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
            name: "RAVAN SHIPPING Professional",
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
            name: "RAVAN SHIPPING Enterprise Dedicated",
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

    // Query pending merchant payment confirmations
    const pendingInvoices = await prisma.invoice.findMany({
      where: { paymentStatus: "PENDING" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Query receiving account settings (UPI & Bank)
    const settings = await prisma.systemSetting.findMany({
      where: { category: "PAYMENTS" },
    });
    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }
    const payoutSettings = {
      OWNER_UPI_ID: settingsMap["OWNER_UPI_ID"] || "owner@okhdfcbank",
      OWNER_UPI_NAME: settingsMap["OWNER_UPI_NAME"] || "RAVAN SHIPPING Commercial Payouts",
      OWNER_PAYPAL_EMAIL: settingsMap["OWNER_PAYPAL_EMAIL"] || "",
      OWNER_BANK_NAME: settingsMap["OWNER_BANK_NAME"] || "HDFC Bank Ltd",
      OWNER_BANK_ACCOUNT_NAME: settingsMap["OWNER_BANK_ACCOUNT_NAME"] || "RAVAN SHIPPING Commercial Payouts",
      OWNER_BANK_ACCOUNT_NUMBER: settingsMap["OWNER_BANK_ACCOUNT_NUMBER"] || "50200084920194",
      OWNER_BANK_IFSC_SWIFT: settingsMap["OWNER_BANK_IFSC_SWIFT"] || "HDFC0001234",
      OWNER_BANK_BRANCH: settingsMap["OWNER_BANK_BRANCH"] || "Financial District, Mumbai",
    };

    return NextResponse.json({ plans, userCountByPlan, pendingInvoices, payoutSettings });
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
    const { action, planId, data, invoiceId, reason, settings } = body;
    const ip = getClientIp(req);
    const userAgent = req.headers.get("user-agent") || "Owner Console";

    // 0. Save Receiving Payout / UPI / Bank Settings
    if (action === "save_payout_settings" && settings && typeof settings === "object") {
      for (const [key, value] of Object.entries(settings)) {
        if (value !== undefined && value !== null) {
          await prisma.systemSetting.upsert({
            where: { key },
            update: { value: String(value) },
            create: {
              key,
              value: String(value),
              category: "PAYMENTS",
              description: "Owner payout parameter",
            },
          });
        }
      }

      await logOwnerAction({
        ownerId: owner.id,
        action: "PAYMENT_GATEWAYS_CONFIGURED",
        targetType: "SUBSCRIPTION",
        severity: "HIGH",
        previousValue: { keysUpdated: Object.keys(settings) },
        ipAddress: ip,
        userAgent,
      });

      return NextResponse.json({
        success: true,
        message: "Receiving account & UPI details successfully updated and saved in Neon PostgreSQL!",
      });
    }

    // 1. Approve Merchant Payment & Activate Subscription Plan
    if (action === "approve_invoice") {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { user: true },
      });

      if (!invoice) {
        return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
      }

      // Determine Plan parameters
      const planConfig = await prisma.subscriptionPlan.findUnique({
        where: { code: invoice.planCode },
      }).catch(() => null);

      let aiCredits = planConfig?.aiCreditsLimit || 10000;
      let storesLimit = planConfig?.storeLimit || 5;

      if (invoice.planCode === "STARTER") {
        aiCredits = planConfig?.aiCreditsLimit || 2000;
        storesLimit = planConfig?.storeLimit || 2;
      } else if (invoice.planCode === "PRO") {
        aiCredits = planConfig?.aiCreditsLimit || 10000;
        storesLimit = planConfig?.storeLimit || 5;
      } else if (invoice.planCode === "ENTERPRISE") {
        aiCredits = planConfig?.aiCreditsLimit || 150000;
        storesLimit = planConfig?.storeLimit || 99;
      }

      const periodEnd = new Date();
      periodEnd.setDate(periodEnd.getDate() + (invoice.billingPeriod === "Yearly" ? 365 : 30));

      // Mark Invoice as PAID
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { paymentStatus: "PAID" },
      });

      // Activate User Subscription
      const updatedSubscription = await prisma.subscription.upsert({
        where: { userId: invoice.userId },
        update: {
          plan: invoice.planCode,
          status: "ACTIVE",
          currentPeriodEnd: periodEnd,
          aiCreditsTotal: aiCredits,
          aiCreditsRemaining: aiCredits,
          storesLimit,
        },
        create: {
          userId: invoice.userId,
          plan: invoice.planCode,
          status: "ACTIVE",
          currentPeriodEnd: periodEnd,
          aiCreditsTotal: aiCredits,
          aiCreditsRemaining: aiCredits,
          storesLimit,
        },
      });

      // Send In-App Notification to Merchant
      await prisma.notification.create({
        data: {
          userId: invoice.userId,
          type: "SUCCESS",
          title: `Payment Verified: ${invoice.planName} Activated!`,
          message: `Your payment of $${invoice.amount} (${invoice.paymentMethod}) with reference "${invoice.paymentReference}" has been verified by the platform owner. Your subscription is now active!`,
          link: "/app/billing",
        },
      }).catch(() => null);

      // Log Owner Audit Event
      await logOwnerAction({
        ownerId: owner.id,
        action: "PAYMENT_APPROVED",
        targetType: "SUBSCRIPTION",
        targetId: invoice.userId,
        newValue: { invoiceId, plan: invoice.planCode, amount: invoice.amount },
        severity: "INFO",
        ipAddress: ip,
        userAgent,
      });

      return NextResponse.json({
        success: true,
        message: `Payment confirmed! User ${invoice.user?.email} upgraded to ${invoice.planName}.`,
        subscription: updatedSubscription,
      });
    }

    // 2. Reject Merchant Payment
    if (action === "reject_invoice") {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { user: true },
      });

      if (!invoice) {
        return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
      }

      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { paymentStatus: "REJECTED" },
      });

      await prisma.notification.create({
        data: {
          userId: invoice.userId,
          type: "ALERT",
          title: `Payment Verification Declined: ${invoice.planName}`,
          message: `Your payment reference "${invoice.paymentReference}" for invoice ${invoice.invoiceNumber} could not be verified. Reason: ${reason || "Payment not received in account / invalid UTR reference."}. Please contact support or retry.`,
          link: "/app/billing",
        },
      }).catch(() => null);

      await logOwnerAction({
        ownerId: owner.id,
        action: "PAYMENT_REJECTED",
        targetType: "SUBSCRIPTION",
        targetId: invoice.userId,
        newValue: { invoiceId, reason },
        severity: "WARNING",
        ipAddress: ip,
        userAgent,
      });

      return NextResponse.json({
        success: true,
        message: `Payment for invoice ${invoice.invoiceNumber} has been rejected.`,
      });
    }

    // 3. Update Plan Configuration
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
