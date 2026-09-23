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
      paymentMethod = "RAZORPAY_UPI",
      billingCycle = "MONTHLY",
      paymentDetails = {},
    } = body;

    const cleanPlan = String(planCode).toUpperCase();
    const cleanMethod = String(paymentMethod).toUpperCase();

    // 1. Handling FREE plan switch / downgrade
    if (cleanPlan === "FREE") {
      const subscription = await prisma.subscription.upsert({
        where: { userId: user.id },
        update: {
          plan: "FREE",
          status: "ACTIVE",
          storesLimit: 1,
        },
        create: {
          userId: user.id,
          plan: "FREE",
          status: "ACTIVE",
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          aiCreditsTotal: 100,
          aiCreditsRemaining: 100,
          storesLimit: 1,
        },
      });

      return NextResponse.json({
        success: true,
        pendingVerification: false,
        subscription,
        message: "You are now on the Free Tier.",
      });
    }

    // 2. Fetch Plan Configuration from DB
    const planConfig = await prisma.subscriptionPlan.findUnique({
      where: { code: cleanPlan },
    }).catch(() => null);

    let planName = planConfig?.name || `${cleanPlan} Merchant`;
    let amount = billingCycle === "YEARLY"
      ? (planConfig?.priceYearly || 790.0)
      : (planConfig?.priceMonthly || 79.0);

    if (cleanPlan === "STARTER") {
      planName = planConfig?.name || "Merchant Starter";
      amount = billingCycle === "YEARLY" ? (planConfig?.priceYearly || 279.0) : (planConfig?.priceMonthly || 29.0);
    } else if (cleanPlan === "PRO") {
      planName = planConfig?.name || "DropAI Professional";
      amount = billingCycle === "YEARLY" ? (planConfig?.priceYearly || 759.0) : (planConfig?.priceMonthly || 79.0);
    } else if (cleanPlan === "ENTERPRISE") {
      planName = planConfig?.name || "DropAI Enterprise Dedicated";
      amount = billingCycle === "YEARLY" ? (planConfig?.priceYearly || 2870.0) : (planConfig?.priceMonthly || 299.0);
    }

    // 3. Validate payment details based on method
    let paymentReference = "";

    if (cleanMethod === "RAZORPAY_UPI") {
      const utr = String(paymentDetails.utrNumber || paymentDetails.upiId || "").trim();
      const payerName = String(paymentDetails.payerName || user.name || "").trim();

      if (!utr || utr.length < 6) {
        return NextResponse.json(
          { error: "Please enter the valid UPI Transaction ID / 12-digit UTR reference number from your payment app (GPay / PhonePe / Paytm)." },
          { status: 400 }
        );
      }

      paymentReference = `UPI UTR: ${utr} (Payer: ${payerName})`;
    } else if (cleanMethod === "BANK_WIRE") {
      const utr = String(paymentDetails.utrNumber || "").trim();
      const payerName = String(paymentDetails.payerName || user.name || "").trim();

      if (!utr || utr.length < 6) {
        return NextResponse.json(
          { error: "Please enter the Bank Transfer UTR / Transaction Reference number from your bank receipt." },
          { status: 400 }
        );
      }

      paymentReference = `BANK UTR: ${utr} (Account: ${payerName})`;
    } else if (cleanMethod === "STRIPE_CARD") {
      // Check if Stripe is configured
      const hasStripe = Boolean(process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes("dummy"));
      if (!hasStripe) {
        return NextResponse.json(
          { error: "Card processing gateway is currently in maintenance. Please select Instant UPI (GPay/PhonePe) or Bank Wire to complete your transfer directly to the platform account." },
          { status: 400 }
        );
      }
      paymentReference = `STRIPE_CARD: Pending Verification`;
    } else {
      // PayPal or other
      const ref = String(paymentDetails.utrNumber || paymentDetails.reference || "").trim();
      if (!ref) {
        return NextResponse.json(
          { error: "Please provide the payment transaction ID or reference." },
          { status: 400 }
        );
      }
      paymentReference = `${cleanMethod}: ${ref}`;
    }

    // 4. Generate unique Invoice Number
    const currentYear = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-${currentYear}-${randomSuffix}`;

    // 5. Create Invoice record with PENDING status
    const invoice = await prisma.invoice.create({
      data: {
        userId: user.id,
        invoiceNumber,
        planCode: cleanPlan,
        planName,
        amount,
        currency: "USD",
        paymentMethod: cleanMethod,
        paymentStatus: "PENDING", // Strictly PENDING until owner verifies receipt in bank/UPI
        paymentReference,
        billingPeriod: billingCycle === "YEARLY" ? "Yearly" : "Monthly",
      },
    });

    // 6. Notify Platform Owners of new pending payment
    try {
      const owners = await prisma.user.findMany({
        where: { role: "OWNER" },
        select: { id: true },
      });

      for (const owner of owners) {
        await prisma.notification.create({
          data: {
            userId: owner.id,
            type: "ALERT",
            title: `New Payment Verification: ${user.name} (${cleanPlan})`,
            message: `Merchant ${user.email} submitted $${amount} via ${cleanMethod}. ${paymentReference}. Review and activate in Subscriptions.`,
            link: "/owner/subscriptions",
          },
        });
      }
    } catch (notifErr) {
      console.warn("Owner notification failed:", notifErr);
    }

    // 7. Notify Merchant that verification is pending
    try {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: "INFO",
          title: `Payment Submitted: ${planName} (Verification Pending)`,
          message: `Your payment reference ${paymentReference} has been submitted for invoice ${invoiceNumber}. Platform administration is verifying receipt in the owner account. Your plan will be activated upon confirmation.`,
          link: "/app/billing",
        },
      });
    } catch {}

    // DO NOT upgrade subscription! Plan remains FREE until owner clicks "Approve" in Owner Panel.
    return NextResponse.json({
      success: true,
      pendingVerification: true,
      invoice,
      message: `Payment submitted! Reference ${paymentReference} has been received. Your plan will be activated within 10-30 minutes once verified in the platform account.`,
    });
  } catch (err: any) {
    console.error("Billing checkout error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to submit payment verification." },
      { status: 500 }
    );
  }
}
