import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth/owner-session";
import { prisma } from "@/lib/prisma";
import { logOwnerAction } from "@/lib/security/owner-audit";
import { getClientIp } from "@/lib/security/rate-limiter";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const owner = await requireOwner();

    let rules = await prisma.profitRule.findMany({
      orderBy: { createdAt: "desc" },
    });

    if (rules.length === 0) {
      await prisma.profitRule.createMany({
        data: [
          {
            scope: "GLOBAL",
            defaultMarginPercent: 40.0,
            minMarginPercent: 20.0,
            maxMarginPercent: 80.0,
            productMarkup: 2.5,
            shippingMarkup: 1.25,
            platformFeePercent: 2.5,
            aiFeePerRequest: 0.02,
          },
          {
            scope: "PLAN",
            targetPlan: "ENTERPRISE",
            defaultMarginPercent: 48.0,
            minMarginPercent: 15.0,
            maxMarginPercent: 90.0,
            productMarkup: 2.8,
            shippingMarkup: 1.05,
            platformFeePercent: 1.0,
            aiFeePerRequest: 0.0,
          },
        ],
      });
      rules = await prisma.profitRule.findMany({ orderBy: { createdAt: "desc" } });
    }

    return NextResponse.json({ rules });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED_OWNER") {
      return NextResponse.json({ error: "Unauthorized: Owner privilege required." }, { status: 403 });
    }
    console.error("Owner profit error:", error);
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

    if (action === "update_profit_rule") {
      const existing = await prisma.profitRule.findUnique({ where: { id: ruleId } });
      if (!existing) {
        return NextResponse.json({ error: "Rule not found." }, { status: 404 });
      }

      const updated = await prisma.profitRule.update({
        where: { id: ruleId },
        data: {
          defaultMarginPercent: parseFloat(data.defaultMarginPercent) ?? existing.defaultMarginPercent,
          minMarginPercent: parseFloat(data.minMarginPercent) ?? existing.minMarginPercent,
          maxMarginPercent: parseFloat(data.maxMarginPercent) ?? existing.maxMarginPercent,
          productMarkup: parseFloat(data.productMarkup) ?? existing.productMarkup,
          shippingMarkup: parseFloat(data.shippingMarkup) ?? existing.shippingMarkup,
          platformFeePercent: parseFloat(data.platformFeePercent) ?? existing.platformFeePercent,
          aiFeePerRequest: parseFloat(data.aiFeePerRequest) ?? existing.aiFeePerRequest,
        },
      });

      await logOwnerAction({
        ownerId: owner.id,
        action: "PROFIT_RULE_CHANGED",
        targetType: "PROFIT",
        targetId: ruleId,
        previousValue: existing,
        newValue: updated,
        severity: "WARNING",
        ipAddress: ip,
        userAgent,
      });

      return NextResponse.json({ success: true, rule: updated });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED_OWNER") {
      return NextResponse.json({ error: "Unauthorized: Owner privilege required." }, { status: 403 });
    }
    console.error("Owner profit POST error:", error);
    return NextResponse.json({ error: "Failed to update profit rule" }, { status: 500 });
  }
}
