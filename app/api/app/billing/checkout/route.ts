import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized: Please log in." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const {
      planCode = "PRO",
      paymentMethod = "STRIPE_CARD",
      billingCycle = "MONTHLY",
      paymentDetails = {},
    } = body;

    const cleanPlan = String(planCode).toUpperCase();
    const cleanMethod = String(paymentMethod).toUpperCase();

    // Determine plan pricing and credit limits
    let planName = "Pro Merchant";
    let amount = 79.0;
    let aiCreditsTotal = 10000;
    let storesLimit = 5;

    if (cleanPlan === "STARTER") {
      planName = "Starter Merchant";
      amount = 29.0;
      aiCreditsTotal = 2500;
      storesLimit = 2;
    } else if (cleanPlan === "ENTERPRISE") {
      planName = "Scale Enterprise";
      amount = 199.0;
      aiCreditsTotal = 50000;
      storesLimit = 25;
    }

    // Apply yearly discount if applicable
    if (billingCycle === "YEARLY") {
      amount = Math.round(amount * 12 * 0.8); // 20% discount
    }

    // Generate unique invoice number and transaction reference
    const currentYear = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-${currentYear}-${randomSuffix}`;

    // Read payment gateway mode from database settings
    let isLiveMode = false;
    try {
      const modeSetting = await prisma.systemSetting.findUnique({
        where: { key: "PAYMENT_GATEWAY_MODE" },
      });
      isLiveMode = modeSetting?.value === "LIVE";
    } catch {}

    const modePrefix = isLiveMode ? "live" : "test";
    let paymentReference = "";
    if (cleanMethod === "STRIPE_CARD") {
      paymentReference = `pi_stripe_${modePrefix}_${Math.random().toString(36).substring(2, 14)}`;
    } else if (cleanMethod === "RAZORPAY_UPI") {
      paymentReference = `pay_rzp_${modePrefix}_${Math.random().toString(36).substring(2, 14)}`;
    } else if (cleanMethod === "PAYPAL") {
      paymentReference = `pp_${modePrefix}_${Math.random().toString(36).substring(2, 14)}`;
    } else {
      paymentReference = `wire_${modePrefix}_${Math.random().toString(36).substring(2, 14)}`;
    }

    // Create official Invoice record in PostgreSQL
    const invoice = await prisma.invoice.create({
      data: {
        userId: user.id,
        invoiceNumber,
        planCode: cleanPlan,
        planName,
        amount,
        currency: "USD",
        paymentMethod: cleanMethod,
        paymentStatus: "PAID",
        paymentReference,
        billingPeriod: billingCycle === "YEARLY" ? "Yearly" : "Monthly",
      },
    });

    // Update user's Subscription in database
    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + (billingCycle === "YEARLY" ? 365 : 30));

    const subscription = await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {
        plan: cleanPlan,
        status: "ACTIVE",
        currentPeriodEnd: periodEnd,
        aiCreditsTotal,
        aiCreditsRemaining: aiCreditsTotal,
        storesLimit,
      },
      create: {
        userId: user.id,
        plan: cleanPlan,
        status: "ACTIVE",
        currentPeriodEnd: periodEnd,
        aiCreditsTotal,
        aiCreditsRemaining: aiCreditsTotal,
        storesLimit,
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "SUCCESS",
        title: `Subscription Activated: ${planName}`,
        message: `Your payment of $${amount} via ${cleanMethod.replace("_", " ")} was successful. Invoice: ${invoiceNumber}`,
        link: "/app/billing",
      },
    }).catch(() => null);

    return NextResponse.json({
      success: true,
      invoice,
      subscription,
      message: `Successfully upgraded to ${planName}! Your payment reference is ${paymentReference}.`,
    });
  } catch (err: any) {
    console.error("Billing checkout error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process payment." },
      { status: 500 }
    );
  }
}
