import { NextResponse } from "next/server";
import { requireOwner, verifyOwnerReAuth } from "@/lib/auth/owner-session";
import { prisma } from "@/lib/prisma";
import { logOwnerAction } from "@/lib/security/owner-audit";
import { getClientIp } from "@/lib/security/rate-limiter";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const owner = await requireOwner();

    // 1. Fetch Feature Flags
    let featureFlags = await prisma.featureFlag.findMany();
    if (featureFlags.length === 0) {
      await prisma.featureFlag.createMany({
        data: [
          {
            key: "ai_product_research",
            name: "AI Product Opportunity Radar",
            description: "Allows merchants to run AI multi-score product viability models.",
            isEnabled: true,
            scope: "GLOBAL",
          },
          {
            key: "ai_ad_creative_studio",
            name: "AI Creative Studio & Ad Copy",
            description: "Enables video scriptwriting and UGC hook generation.",
            isEnabled: true,
            scope: "GLOBAL",
          },
          {
            key: "order_auto_fulfillment",
            name: "Autonomous Order Routing",
            description: "Direct automated API fulfillment via factory supplier endpoints.",
            isEnabled: true,
            scope: "GLOBAL",
          },
          {
            key: "shopify_app_bridge",
            name: "Shopify OAuth Integration",
            description: "Permits merchants to install official Shopify bridge app.",
            isEnabled: true,
            scope: "GLOBAL",
          },
          {
            key: "high_risk_fraud_hold",
            name: "Automated Fraud Shield",
            description: "Auto-flags orders above fraud risk threshold for manual review.",
            isEnabled: true,
            scope: "GLOBAL",
          },
          {
            key: "beta_enterprise_ai_swarm",
            name: "Multi-Agent AI Swarm (Beta)",
            description: "Autonomous inventory re-ordering and ad spend auto-adjusters.",
            isEnabled: false,
            scope: "PLAN",
            targetPlan: "ENTERPRISE",
          },
        ],
      });
      featureFlags = await prisma.featureFlag.findMany();
    }

    // 2. Fetch System Settings
    let settings = await prisma.systemSetting.findMany();
    if (settings.length === 0) {
      await prisma.systemSetting.createMany({
        data: [
          {
            key: "platform_name",
            value: "RAVAN SHIPPING Master Enterprise",
            category: "GENERAL",
            description: "Global platform brand identifier",
          },
          {
            key: "default_currency",
            value: "USD",
            category: "GENERAL",
            description: "Platform baseline currency calculation",
          },
          {
            key: "maintenance_mode",
            value: "false",
            category: "MAINTENANCE",
            description: "Locks customer portal for scheduled database migrations",
          },
          {
            key: "public_registration_enabled",
            value: "true",
            category: "SECURITY",
            description: "Permits new merchant signups via /auth/signup",
          },
          {
            key: "max_sessions_per_user",
            value: "5",
            category: "SECURITY",
            description: "Limits concurrent device logins to prevent account sharing",
          },
        ],
      });
      settings = await prisma.systemSetting.findMany();
    }

    // 3. Fetch Emergency Lockdown
    let lockdown = await prisma.emergencyLockdown.findFirst();
    if (!lockdown) {
      lockdown = await prisma.emergencyLockdown.create({
        data: {
          id: "singleton",
          isActive: false,
        },
      });
    }

    return NextResponse.json({
      featureFlags,
      settings,
      lockdown,
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED_OWNER") {
      return NextResponse.json({ error: "Unauthorized: Owner privilege required." }, { status: 403 });
    }
    console.error("Owner system fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const owner = await requireOwner();
    const body = await req.json();
    const { action, flagId, isEnabled, settingKey, settingValue, lockdownData, password, mfaCode } = body;
    const ip = getClientIp(req);
    const userAgent = req.headers.get("user-agent") || "Owner Console";

    // 1. Toggle Feature Flag
    if (action === "toggle_feature") {
      const existing = await prisma.featureFlag.findUnique({ where: { id: flagId } });
      if (!existing) {
        return NextResponse.json({ error: "Feature flag not found" }, { status: 404 });
      }

      const updated = await prisma.featureFlag.update({
        where: { id: flagId },
        data: { isEnabled },
      });

      await logOwnerAction({
        ownerId: owner.id,
        action: "FEATURE_FLAG_TOGGLED",
        targetType: "SYSTEM",
        targetId: flagId,
        previousValue: { key: existing.key, isEnabled: existing.isEnabled },
        newValue: { isEnabled },
        severity: "WARNING",
        ipAddress: ip,
        userAgent,
      });

      return NextResponse.json({ success: true, flag: updated });
    }

    // 2. Update System Setting
    if (action === "update_setting") {
      const existing = await prisma.systemSetting.findUnique({ where: { key: settingKey } });
      const updated = await prisma.systemSetting.upsert({
        where: { key: settingKey },
        update: { value: settingValue, updatedBy: owner.email },
        create: {
          key: settingKey,
          value: settingValue,
          category: "GENERAL",
          updatedBy: owner.email,
        },
      });

      await logOwnerAction({
        ownerId: owner.id,
        action: "SYSTEM_SETTING_UPDATED",
        targetType: "SYSTEM",
        targetId: settingKey,
        previousValue: existing?.value,
        newValue: settingValue,
        severity: "INFO",
        ipAddress: ip,
        userAgent,
      });

      return NextResponse.json({ success: true, setting: updated });
    }

    // 3. Emergency Lockdown Toggle (Requires ReAuth)
    if (action === "emergency_lockdown") {
      const reAuth = await verifyOwnerReAuth(owner.id, password, mfaCode);
      if (!reAuth.success) {
        return NextResponse.json(
          { error: reAuth.error || "Password re-authentication required for Emergency Lockdown." },
          { status: 401 }
        );
      }

      const updated = await prisma.emergencyLockdown.upsert({
        where: { id: "singleton" },
        update: {
          isActive: lockdownData.isActive,
          disableRegistrations: lockdownData.disableRegistrations || false,
          disableAiServices: lockdownData.disableAiServices || false,
          disableApis: lockdownData.disableApis || false,
          maintenanceMode: lockdownData.maintenanceMode || false,
          freezeFinancials: lockdownData.freezeFinancials || false,
          activatedAt: lockdownData.isActive ? new Date() : null,
          activatedBy: lockdownData.isActive ? owner.email : null,
          reason: lockdownData.reason || "Administrative security intervention",
        },
        create: {
          id: "singleton",
          isActive: lockdownData.isActive,
          disableRegistrations: lockdownData.disableRegistrations || false,
          disableAiServices: lockdownData.disableAiServices || false,
          disableApis: lockdownData.disableApis || false,
          maintenanceMode: lockdownData.maintenanceMode || false,
          freezeFinancials: lockdownData.freezeFinancials || false,
          activatedAt: lockdownData.isActive ? new Date() : null,
          activatedBy: lockdownData.isActive ? owner.email : null,
          reason: lockdownData.reason || "Administrative security intervention",
        },
      });

      // If lockdown activated, revoke user sessions immediately
      if (lockdownData.isActive) {
        await prisma.session.updateMany({
          where: { user: { role: { not: "OWNER" } }, isValid: true },
          data: { isValid: false },
        });
      }

      await logOwnerAction({
        ownerId: owner.id,
        action: lockdownData.isActive ? "EMERGENCY_LOCKDOWN_ACTIVATED" : "EMERGENCY_LOCKDOWN_DEACTIVATED",
        targetType: "SECURITY",
        severity: "CRITICAL",
        previousValue: { isActive: !lockdownData.isActive },
        newValue: updated,
        ipAddress: ip,
        userAgent,
      });

      return NextResponse.json({ success: true, lockdown: updated });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED_OWNER") {
      return NextResponse.json({ error: "Unauthorized: Owner privilege required." }, { status: 403 });
    }
    console.error("Owner system POST error:", error);
    return NextResponse.json({ error: "Failed to update system settings" }, { status: 500 });
  }
}
