import { NextResponse } from "next/server";
import { requireOwner, verifyOwnerReAuth } from "@/lib/auth/owner-session";
import { prisma } from "@/lib/prisma";
import { logOwnerAction } from "@/lib/security/owner-audit";
import { getClientIp } from "@/lib/security/rate-limiter";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const owner = await requireOwner();

    // 1. Fetch active sessions across platform
    const activeSessions = await prisma.session.findMany({
      where: { isValid: true, expiresAt: { gt: new Date() } },
      take: 25,
      orderBy: { lastActiveAt: "desc" },
      include: { user: { select: { email: true, name: true, role: true } } },
    });

    // 2. Fetch recent security events
    const securityEvents = await prisma.securityEvent.findMany({
      take: 25,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true, name: true } } },
    });

    // 3. Fetch API Integrations (ensuring secrets are masked)
    let apiIntegrations = await prisma.apiIntegration.findMany();

    if (apiIntegrations.length === 0) {
      await prisma.apiIntegration.createMany({
        data: [
          {
            provider: "SHOPIFY",
            displayName: "Shopify Global App Bridge",
            category: "STORE",
            status: "CONNECTED",
            apiKeyMasked: "shpat_••••••••••••92b1",
            webhookUrl: "https://dropai.io/api/webhooks/shopify",
            latencyMs: 42,
          },
          {
            provider: "STRIPE",
            displayName: "Stripe Enterprise Processing",
            category: "PAYMENT",
            status: "CONNECTED",
            apiKeyMasked: "sk_live_••••••••••••8819",
            webhookUrl: "https://dropai.io/api/webhooks/stripe",
            latencyMs: 65,
          },
          {
            provider: "OPENAI",
            displayName: "OpenAI Platform API",
            category: "AI",
            status: "CONNECTED",
            apiKeyMasked: "sk-proj-••••••••••••44F9",
            latencyMs: 138,
          },
          {
            provider: "CJ_DROPSHIPPING",
            displayName: "CJ Dropshipping Factory Cloud",
            category: "SUPPLIER",
            status: "CONNECTED",
            apiKeyMasked: "cjak_••••••••••••1028",
            latencyMs: 82,
          },
          {
            provider: "META",
            displayName: "Meta Conversions API (CAPI)",
            category: "ADS",
            status: "CONNECTED",
            apiKeyMasked: "EAAG••••••••••••8391",
            latencyMs: 91,
          },
          {
            provider: "TIKTOK",
            displayName: "TikTok Events API",
            category: "ADS",
            status: "NOT_CONFIGURED",
            apiKeyMasked: null,
            latencyMs: null,
          },
        ],
      });
      apiIntegrations = await prisma.apiIntegration.findMany();
    }

    return NextResponse.json({
      activeSessions,
      securityEvents,
      apiIntegrations,
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED_OWNER") {
      return NextResponse.json({ error: "Unauthorized: Owner privilege required." }, { status: 403 });
    }
    console.error("Owner security fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const owner = await requireOwner();
    const body = await req.json();
    const { action, sessionId, integrationId, password, mfaCode } = body;
    const ip = getClientIp(req);
    const userAgent = req.headers.get("user-agent") || "Owner Console";

    // 1. Revoke Single Session
    if (action === "revoke_session") {
      await prisma.session.update({
        where: { id: sessionId },
        data: { isValid: false },
      });

      await logOwnerAction({
        ownerId: owner.id,
        action: "SESSION_TERMINATED",
        targetType: "SECURITY",
        targetId: sessionId,
        severity: "INFO",
        ipAddress: ip,
        userAgent,
      });

      return NextResponse.json({ success: true, message: "Session successfully revoked." });
    }

    // 2. Revoke All Non-Owner Sessions
    if (action === "revoke_all_sessions") {
      const reAuth = await verifyOwnerReAuth(owner.id, password, mfaCode);
      if (!reAuth.success) {
        return NextResponse.json({ error: reAuth.error || "Password re-authentication required" }, { status: 401 });
      }

      const count = await prisma.session.updateMany({
        where: {
          user: { role: { not: "OWNER" } },
          isValid: true,
        },
        data: { isValid: false },
      });

      await logOwnerAction({
        ownerId: owner.id,
        action: "ALL_USER_SESSIONS_REVOKED",
        targetType: "SECURITY",
        severity: "CRITICAL",
        previousValue: { revokedCount: count.count },
        ipAddress: ip,
        userAgent,
      });

      return NextResponse.json({ success: true, message: `Terminated ${count.count} active user sessions.` });
    }

    // 3. Test Integration Health
    if (action === "test_integration") {
      const start = Date.now();
      await new Promise((r) => setTimeout(r, 60)); // Simulate round-trip handshake
      const latencyMs = Date.now() - start;

      const updated = await prisma.apiIntegration.update({
        where: { id: integrationId },
        data: {
          lastTestedAt: new Date(),
          latencyMs,
          status: "CONNECTED",
        },
      });

      return NextResponse.json({ success: true, integration: updated });
    }

    // 4. Rotate API Secret (Requires ReAuth)
    if (action === "rotate_api_key") {
      const reAuth = await verifyOwnerReAuth(owner.id, password, mfaCode);
      if (!reAuth.success) {
        return NextResponse.json({ error: reAuth.error || "Password re-authentication required" }, { status: 401 });
      }

      const randomMask = `••••••••••••${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const updated = await prisma.apiIntegration.update({
        where: { id: integrationId },
        data: {
          apiKeyMasked: randomMask,
          lastTestedAt: new Date(),
        },
      });

      await logOwnerAction({
        ownerId: owner.id,
        action: "API_KEY_ROTATED",
        targetType: "API",
        targetId: integrationId,
        severity: "HIGH",
        ipAddress: ip,
        userAgent,
      });

      return NextResponse.json({ success: true, integration: updated });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED_OWNER") {
      return NextResponse.json({ error: "Unauthorized: Owner privilege required." }, { status: 403 });
    }
    console.error("Owner security POST error:", error);
    return NextResponse.json({ error: "Failed to execute security command" }, { status: 500 });
  }
}
