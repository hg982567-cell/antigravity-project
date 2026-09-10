import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth/owner-session";
import { prisma } from "@/lib/prisma";
import { logOwnerAction } from "@/lib/security/owner-audit";
import { getClientIp } from "@/lib/security/rate-limiter";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const owner = await requireOwner();

    let plans = await prisma.subscriptionPlan.findMany({
      orderBy: { priceMonthly: "asc" },
    });

    // Seed default plans if none exist
    if (plans.length === 0) {
      await prisma.subscriptionPlan.createMany({
        data: [
          {
            code: "FREE",
            name: "Free Trial / Starter",
            priceMonthly: 0,
            priceYearly: 0,
            productLimit: 5,
            storeLimit: 1,
            orderLimit: 25,
            aiCreditsLimit: 250,
            automationLimit: 1,
            apiAccess: false,
            supportLevel: "COMMUNITY",
            isActive: true,
          },
          {
            code: "STARTER",
            name: "Merchant Starter",
            priceMonthly: 29,
            priceYearly: 279,
            productLimit: 50,
            storeLimit: 2,
            orderLimit: 250,
            aiCreditsLimit: 2000,
            automationLimit: 5,
            apiAccess: false,
            supportLevel: "EMAIL",
            isActive: true,
          },
          {
            code: "PRO",
            name: "DropAI Professional",
            priceMonthly: 79,
            priceYearly: 759,
            productLimit: 500,
            storeLimit: 5,
            orderLimit: 2500,
            aiCreditsLimit: 10000,
            automationLimit: 25,
            apiAccess: true,
            supportLevel: "PRIORITY_24_7",
            isActive: true,
          },
          {
            code: "BUSINESS",
            name: "Commerce Business Scale",
            priceMonthly: 149,
            priceYearly: 1430,
            productLimit: 2500,
            storeLimit: 15,
            orderLimit: 10000,
            aiCreditsLimit: 35000,
            automationLimit: 100,
            apiAccess: true,
            supportLevel: "PRIORITY_24_7",
            isActive: true,
          },
          {
            code: "ENTERPRISE",
            name: "DropAI Enterprise Dedicated",
            priceMonthly: 299,
            priceYearly: 2870,
            productLimit: 99999,
            storeLimit: 99,
            orderLimit: 999999,
            aiCreditsLimit: 150000,
            automationLimit: 999,
            apiAccess: true,
            supportLevel: "DEDICATED",
            isActive: true,
          },
        ],
      });
      plans = await prisma.subscriptionPlan.findMany({ orderBy: { priceMonthly: "asc" } });
    }

    // Get distribution of active users across plans
    const subscriptions = await prisma.subscription.findMany({
      select: { plan: true, status: true },
    });

    const userCountByPlan: Record<string, number> = {};
    subscriptions.forEach((s) => {
      userCountByPlan[s.plan] = (userCountByPlan[s.plan] || 0) + 1;
    });

    return NextResponse.json({ plans, userCountByPlan });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED_OWNER") {
      return NextResponse.json({ error: "Unauthorized: Owner privilege required." }, { status: 403 });
    }
    console.error("Owner subscriptions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const owner = await requireOwner();
    const body = await req.json();
    const { action, planId, data } = body;
    const ip = getClientIp(req);
    const userAgent = req.headers.get("user-agent") || "Owner Console";

    if (action === "update_plan") {
      const existing = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
      if (!existing) {
        return NextResponse.json({ error: "Plan not found." }, { status: 404 });
      }

      const updated = await prisma.subscriptionPlan.update({
        where: { id: planId },
        data: {
          name: data.name ?? existing.name,
          priceMonthly: data.priceMonthly !== undefined ? parseFloat(data.priceMonthly) : existing.priceMonthly,
          priceYearly: data.priceYearly !== undefined ? parseFloat(data.priceYearly) : existing.priceYearly,
          productLimit: data.productLimit !== undefined ? parseInt(data.productLimit) : existing.productLimit,
          storeLimit: data.storeLimit !== undefined ? parseInt(data.storeLimit) : existing.storeLimit,
          orderLimit: data.orderLimit !== undefined ? parseInt(data.orderLimit) : existing.orderLimit,
          aiCreditsLimit: data.aiCreditsLimit !== undefined ? parseInt(data.aiCreditsLimit) : existing.aiCreditsLimit,
          automationLimit: data.automationLimit !== undefined ? parseInt(data.automationLimit) : existing.automationLimit,
          apiAccess: data.apiAccess !== undefined ? data.apiAccess : existing.apiAccess,
          supportLevel: data.supportLevel ?? existing.supportLevel,
          isActive: data.isActive !== undefined ? data.isActive : existing.isActive,
        },
      });

      await logOwnerAction({
        ownerId: owner.id,
        action: "SUBSCRIPTION_PLAN_UPDATED",
        targetType: "SUBSCRIPTION",
        targetId: planId,
        previousValue: existing,
        newValue: updated,
        severity: "WARNING",
        ipAddress: ip,
        userAgent,
      });

      return NextResponse.json({ success: true, plan: updated });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED_OWNER") {
      return NextResponse.json({ error: "Unauthorized: Owner privilege required." }, { status: 403 });
    }
    console.error("Owner subscription POST error:", error);
    return NextResponse.json({ error: "Failed to update plan" }, { status: 500 });
  }
}
