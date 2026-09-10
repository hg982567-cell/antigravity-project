import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth/owner-session";
import { prisma } from "@/lib/prisma";
import { logOwnerAction } from "@/lib/security/owner-audit";
import { getClientIp } from "@/lib/security/rate-limiter";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const owner = await requireOwner();

    let rules = await prisma.shippingRule.findMany({
      orderBy: { createdAt: "desc" },
    });

    if (rules.length === 0) {
      await prisma.shippingRule.createMany({
        data: [
          {
            scope: "GLOBAL",
            countryCode: "US",
            methodName: "YunExpress Standard Direct",
            baseCost: 4.85,
            deliveryDaysEstimate: "6-9 business days",
            isRestricted: false,
          },
          {
            scope: "GLOBAL",
            countryCode: "US",
            methodName: "USPS Priority Fast Track",
            baseCost: 8.5,
            deliveryDaysEstimate: "2-4 business days",
            isRestricted: false,
          },
          {
            scope: "GLOBAL",
            countryCode: "GB",
            methodName: "Royal Mail Special Tracked",
            baseCost: 5.2,
            deliveryDaysEstimate: "5-8 business days",
            isRestricted: false,
          },
          {
            scope: "GLOBAL",
            countryCode: "DE",
            methodName: "DHL Paket Germany Hub",
            baseCost: 6.1,
            deliveryDaysEstimate: "4-7 business days",
            isRestricted: false,
          },
          {
            scope: "PLAN",
            targetPlan: "ENTERPRISE",
            countryCode: "*",
            methodName: "VIP Factory Direct Air Express",
            baseCost: 3.5,
            deliveryDaysEstimate: "3-5 business days",
            isRestricted: false,
          },
        ],
      });
      rules = await prisma.shippingRule.findMany({ orderBy: { createdAt: "desc" } });
    }

    return NextResponse.json({ rules });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED_OWNER") {
      return NextResponse.json({ error: "Unauthorized: Owner privilege required." }, { status: 403 });
    }
    console.error("Owner shipping error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const owner = await requireOwner();
    const body = await req.json();
    const { action, ruleId, data } = body;
    const ip = getClientIp(req);
    const userAgent = req.headers.get("user-agent") || "Owner Console";

    if (action === "create_rule") {
      const created = await prisma.shippingRule.create({
        data: {
          scope: data.scope || "GLOBAL",
          targetPlan: data.targetPlan || null,
          targetUserId: data.targetUserId || null,
          countryCode: data.countryCode || "*",
          methodName: data.methodName || "Standard Shipping",
          baseCost: parseFloat(data.baseCost) || 0,
          deliveryDaysEstimate: data.deliveryDaysEstimate || "7-12 days",
          isRestricted: data.isRestricted || false,
        },
      });

      await logOwnerAction({
        ownerId: owner.id,
        action: "SHIPPING_RULE_CREATED",
        targetType: "SHIPPING",
        targetId: created.id,
        newValue: created,
        severity: "INFO",
        ipAddress: ip,
        userAgent,
      });

      return NextResponse.json({ success: true, rule: created });
    }

    if (action === "delete_rule") {
      await prisma.shippingRule.delete({ where: { id: ruleId } });

      await logOwnerAction({
        ownerId: owner.id,
        action: "SHIPPING_RULE_DELETED",
        targetType: "SHIPPING",
        targetId: ruleId,
        severity: "WARNING",
        ipAddress: ip,
        userAgent,
      });

      return NextResponse.json({ success: true, id: ruleId });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED_OWNER") {
      return NextResponse.json({ error: "Unauthorized: Owner privilege required." }, { status: 403 });
    }
    console.error("Owner shipping POST error:", error);
    return NextResponse.json({ error: "Failed to update shipping rule" }, { status: 500 });
  }
}
