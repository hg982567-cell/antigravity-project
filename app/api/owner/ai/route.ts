import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth/owner-session";
import { prisma } from "@/lib/prisma";
import { logOwnerAction } from "@/lib/security/owner-audit";
import { getClientIp } from "@/lib/security/rate-limiter";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const owner = await requireOwner();

    // Fetch Providers, Routing Rules, and Usage Metrics
    let [providers, routingRules, totalAiRequests] = await Promise.all([
      prisma.aiProviderConfig.findMany({ orderBy: { priority: "asc" } }),
      prisma.aiRoutingRule.findMany(),
      prisma.aiRequest.count(),
    ]);

    // Seed default providers if none exist yet
    if (providers.length === 0) {
      await prisma.aiProviderConfig.createMany({
        data: [
          {
            provider: "OPENAI",
            displayName: "OpenAI GPT-4o Enterprise",
            status: "ACTIVE",
            priority: 1,
            isDefault: true,
            modelsJson: JSON.stringify(["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"]),
            rateLimitPerMin: 120,
            dailyTokenLimit: 5000000,
          },
          {
            provider: "ANTHROPIC",
            displayName: "Anthropic Claude 3.5 Sonnet",
            status: "ACTIVE",
            priority: 2,
            isDefault: false,
            modelsJson: JSON.stringify(["claude-3-5-sonnet-20240620", "claude-3-haiku-20240307"]),
            rateLimitPerMin: 80,
            dailyTokenLimit: 3000000,
          },
          {
            provider: "GOOGLE",
            displayName: "Google Gemini 1.5 Pro",
            status: "ACTIVE",
            priority: 3,
            isDefault: false,
            modelsJson: JSON.stringify(["gemini-1.5-pro", "gemini-1.5-flash"]),
            rateLimitPerMin: 150,
            dailyTokenLimit: 10000000,
          },
        ],
      });
      providers = await prisma.aiProviderConfig.findMany({ orderBy: { priority: "asc" } });
    }

    // Seed default task routing if none exist
    if (routingRules.length === 0) {
      await prisma.aiRoutingRule.createMany({
        data: [
          {
            taskType: "PRODUCT_RESEARCH",
            providerName: "OPENAI",
            modelName: "gpt-4o",
            temperature: 0.6,
            maxTokens: 3000,
          },
          {
            taskType: "AD_GENERATION",
            providerName: "ANTHROPIC",
            modelName: "claude-3-5-sonnet-20240620",
            temperature: 0.8,
            maxTokens: 2500,
          },
          {
            taskType: "CUSTOMER_SUPPORT",
            providerName: "OPENAI",
            modelName: "gpt-4o-mini",
            temperature: 0.3,
            maxTokens: 1500,
          },
          {
            taskType: "PRICING_OPTIMIZATION",
            providerName: "GOOGLE",
            modelName: "gemini-1.5-pro",
            temperature: 0.2,
            maxTokens: 2000,
          },
          {
            taskType: "FRAUD_RISK_TRIAGE",
            providerName: "OPENAI",
            modelName: "gpt-4o",
            temperature: 0.1,
            maxTokens: 1024,
          },
          {
            taskType: "AUTONOMOUS_WORKFLOWS",
            providerName: "ANTHROPIC",
            modelName: "claude-3-5-sonnet-20240620",
            temperature: 0.5,
            maxTokens: 4000,
          },
        ],
      });
      routingRules = await prisma.aiRoutingRule.findMany();
    }

    // Recent requests
    const recentRequests = await prisma.aiRequest.findMany({
      take: 15,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true, name: true } } },
    });

    return NextResponse.json({
      providers,
      routingRules,
      totalAiRequests,
      recentRequests,
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED_OWNER") {
      return NextResponse.json({ error: "Unauthorized: Owner privilege required." }, { status: 403 });
    }
    console.error("Owner AI fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const owner = await requireOwner();
    const body = await req.json();
    const { action, providerId, ruleId, data } = body;
    const ip = getClientIp(req);
    const userAgent = req.headers.get("user-agent") || "Owner Console";

    // 1. Update AI Provider Config
    if (action === "update_provider") {
      const { status, priority, isDefault, rateLimitPerMin, dailyTokenLimit } = data;
      const existing = await prisma.aiProviderConfig.findUnique({ where: { id: providerId } });

      if (!existing) {
        return NextResponse.json({ error: "Provider not found" }, { status: 404 });
      }

      // Check dependencies before disabling
      if (status === "DISABLED") {
        const dependentTasks = await prisma.aiRoutingRule.findMany({
          where: { providerName: existing.provider, isEnabled: true },
        });

        if (dependentTasks.length > 0) {
          const taskNames = dependentTasks.map((t) => t.taskType).join(", ");
          return NextResponse.json(
            {
              error: `Cannot disable ${existing.displayName}. It is currently the primary provider for active tasks: [${taskNames}]. Please re-route these tasks to another provider first.`,
            },
            { status: 400 }
          );
        }
      }

      // If setting default, unset others
      if (isDefault) {
        await prisma.aiProviderConfig.updateMany({
          where: { id: { not: providerId } },
          data: { isDefault: false },
        });
      }

      const updated = await prisma.aiProviderConfig.update({
        where: { id: providerId },
        data: {
          status: status || existing.status,
          priority: priority ?? existing.priority,
          isDefault: isDefault ?? existing.isDefault,
          rateLimitPerMin: rateLimitPerMin ?? existing.rateLimitPerMin,
          dailyTokenLimit: dailyTokenLimit ?? existing.dailyTokenLimit,
        },
      });

      await logOwnerAction({
        ownerId: owner.id,
        action: "AI_PROVIDER_UPDATED",
        targetType: "AI",
        targetId: providerId,
        previousValue: existing,
        newValue: updated,
        severity: "WARNING",
        ipAddress: ip,
        userAgent,
      });

      return NextResponse.json({ success: true, provider: updated });
    }

    // 2. Update Task Routing Rule
    if (action === "update_routing_rule") {
      const { providerName, modelName, temperature, maxTokens, isEnabled } = data;
      const existing = await prisma.aiRoutingRule.findUnique({ where: { id: ruleId } });

      if (!existing) {
        return NextResponse.json({ error: "Routing rule not found" }, { status: 404 });
      }

      const updated = await prisma.aiRoutingRule.update({
        where: { id: ruleId },
        data: {
          providerName: providerName || existing.providerName,
          modelName: modelName || existing.modelName,
          temperature: temperature ?? existing.temperature,
          maxTokens: maxTokens ?? existing.maxTokens,
          isEnabled: isEnabled ?? existing.isEnabled,
        },
      });

      await logOwnerAction({
        ownerId: owner.id,
        action: "AI_ROUTING_RULE_CHANGED",
        targetType: "AI",
        targetId: ruleId,
        previousValue: existing,
        newValue: updated,
        severity: "INFO",
        ipAddress: ip,
        userAgent,
      });

      return NextResponse.json({ success: true, rule: updated });
    }

    // 3. Test AI Connection live
    if (action === "test_connection") {
      const { provider, displayName, protocol, apiKey, baseUrl, modelName } = data || {};
      const { testAiConnection } = await import("@/lib/ai/universal-client");
      const result = await testAiConnection({
        provider: provider || "CUSTOM",
        displayName: displayName || "AI Provider",
        protocol: protocol || "OPENAI_COMPATIBLE",
        apiKey,
        baseUrl,
        modelName,
      });
      return NextResponse.json(result);
    }

    // 4. Create Custom AI Model / Provider
    if (action === "create_custom_provider") {
      const { displayName, protocol, apiKey, baseUrl, modelName, taskType, isDefault } = data || {};
      if (!displayName || !apiKey) {
        return NextResponse.json({ error: "Display Name and API Key are required." }, { status: 400 });
      }

      const slug = displayName.toUpperCase().replace(/[^A-Z0-9]/g, "_").slice(0, 15);
      const uniqueCode = `CUSTOM_${slug}_${Date.now().toString(36).toUpperCase()}`;

      if (isDefault) {
        await prisma.aiProviderConfig.updateMany({
          data: { isDefault: false },
        });
      }

      const newProvider = await prisma.aiProviderConfig.create({
        data: {
          provider: uniqueCode,
          displayName,
          protocol: protocol || "OPENAI_COMPATIBLE",
          apiKeyEncrypted: apiKey,
          baseUrl: baseUrl || null,
          status: "ACTIVE",
          priority: 1,
          isDefault: !!isDefault,
          modelsJson: JSON.stringify([modelName || "default-model"]),
          rateLimitPerMin: 120,
          dailyTokenLimit: 5000000,
        },
      });

      // Task assignment
      if (taskType && taskType !== "NONE") {
        if (taskType === "ALL") {
          await prisma.aiRoutingRule.updateMany({
            data: {
              providerName: uniqueCode,
              modelName: modelName || "default-model",
            },
          });
        } else {
          await prisma.aiRoutingRule.upsert({
            where: { taskType },
            update: {
              providerName: uniqueCode,
              modelName: modelName || "default-model",
              isEnabled: true,
            },
            create: {
              taskType,
              providerName: uniqueCode,
              modelName: modelName || "default-model",
              isEnabled: true,
            },
          });
        }
      }

      await logOwnerAction({
        ownerId: owner.id,
        action: "AI_CUSTOM_PROVIDER_CREATED",
        targetType: "AI",
        targetId: newProvider.id,
        newValue: { displayName, provider: uniqueCode, modelName, taskType },
        severity: "WARNING",
        ipAddress: ip,
        userAgent,
      });

      return NextResponse.json({ success: true, provider: newProvider });
    }

    // 5. Delete Provider
    if (action === "delete_provider") {
      const existing = await prisma.aiProviderConfig.findUnique({ where: { id: providerId } });
      if (!existing) {
        return NextResponse.json({ error: "Provider not found" }, { status: 404 });
      }

      await prisma.aiRoutingRule.updateMany({
        where: { providerName: existing.provider },
        data: { providerName: "GOOGLE", modelName: "gemini-3.6-flash" },
      });

      await prisma.aiProviderConfig.delete({ where: { id: providerId } });

      await logOwnerAction({
        ownerId: owner.id,
        action: "AI_PROVIDER_DELETED",
        targetType: "AI",
        targetId: providerId,
        previousValue: existing,
        severity: "WARNING",
        ipAddress: ip,
        userAgent,
      });

      return NextResponse.json({ success: true, deletedId: providerId });
    }

    // 6. Update Provider Key / Settings
    if (action === "update_provider_key") {
      const { apiKey, baseUrl, modelName, protocol } = data || {};
      const existing = await prisma.aiProviderConfig.findUnique({ where: { id: providerId } });
      if (!existing) {
        return NextResponse.json({ error: "Provider not found" }, { status: 404 });
      }

      let models = [modelName];
      if (!modelName) {
        try {
          models = JSON.parse(existing.modelsJson || "[]");
        } catch {
          models = ["default"];
        }
      }

      const updated = await prisma.aiProviderConfig.update({
        where: { id: providerId },
        data: {
          apiKeyEncrypted: apiKey !== undefined ? apiKey : existing.apiKeyEncrypted,
          baseUrl: baseUrl !== undefined ? baseUrl : existing.baseUrl,
          protocol: protocol || existing.protocol,
          modelsJson: modelName ? JSON.stringify(models) : existing.modelsJson,
        },
      });

      await logOwnerAction({
        ownerId: owner.id,
        action: "AI_PROVIDER_KEY_UPDATED",
        targetType: "AI",
        targetId: providerId,
        newValue: { provider: existing.provider, keyUpdated: !!apiKey },
        severity: "WARNING",
        ipAddress: ip,
        userAgent,
      });

      return NextResponse.json({ success: true, provider: updated });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED_OWNER") {
      return NextResponse.json({ error: "Unauthorized: Owner privilege required." }, { status: 403 });
    }
    console.error("Owner AI POST error:", error);
    return NextResponse.json({ error: "Failed to update AI configuration" }, { status: 500 });
  }
}
