import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth/owner-session";
import { prisma } from "@/lib/prisma";
import { logOwnerAction } from "@/lib/security/owner-audit";
import { getClientIp } from "@/lib/security/rate-limiter";

export const dynamic = "force-dynamic";

const DEFAULT_SETTINGS: Record<string, { value: string; category: string; description: string }> = {
  PAYMENT_GATEWAY_MODE: {
    value: "TEST",
    category: "PAYMENTS",
    description: "Operational mode for merchant checkouts (TEST for sandbox, LIVE for real money settlement)",
  },
  OWNER_BANK_NAME: {
    value: "HDFC Bank Ltd",
    category: "PAYMENTS",
    description: "Owner beneficiary bank name for direct wire transfers",
  },
  OWNER_BANK_ACCOUNT_NAME: {
    value: "DropAI Technologies Commercial",
    category: "PAYMENTS",
    description: "Account holder name for wire payments",
  },
  OWNER_BANK_ACCOUNT_NUMBER: {
    value: "50200084920194",
    category: "PAYMENTS",
    description: "Bank account number",
  },
  OWNER_BANK_IFSC_SWIFT: {
    value: "HDFC0001234 / HDFCINBB",
    category: "PAYMENTS",
    description: "IFSC code for India / SWIFT-BIC for International transfers",
  },
  OWNER_BANK_BRANCH: {
    value: "Financial District Branch, Mumbai",
    category: "PAYMENTS",
    description: "Bank branch details",
  },
  OWNER_UPI_ID: {
    value: "owner@okhdfcbank",
    category: "PAYMENTS",
    description: "Business UPI ID for GPay, PhonePe, Paytm, and BHIM payments",
  },
  OWNER_UPI_NAME: {
    value: "DropAI Commercial Payouts",
    category: "PAYMENTS",
    description: "Merchant display name shown during UPI checkout",
  },
  RAZORPAY_KEY_ID: {
    value: "",
    category: "PAYMENTS",
    description: "Razorpay Public Key ID (rzp_live_... or rzp_test_...)",
  },
  RAZORPAY_KEY_SECRET: {
    value: "",
    category: "PAYMENTS",
    description: "Razorpay Secret Key",
  },
  STRIPE_PUBLISHABLE_KEY: {
    value: "",
    category: "PAYMENTS",
    description: "Stripe Publishable Key (pk_live_... or pk_test_...)",
  },
  STRIPE_SECRET_KEY: {
    value: "",
    category: "PAYMENTS",
    description: "Stripe Secret Key (sk_live_... or sk_test_...)",
  },
  STRIPE_WEBHOOK_SECRET: {
    value: "",
    category: "PAYMENTS",
    description: "Stripe Webhook Signing Secret (whsec_...)",
  },
  PAYPAL_CLIENT_ID: {
    value: "",
    category: "PAYMENTS",
    description: "PayPal REST API Client ID",
  },
  PAYPAL_SECRET: {
    value: "",
    category: "PAYMENTS",
    description: "PayPal REST API Secret",
  },
  PAYPAL_MODE: {
    value: "sandbox",
    category: "PAYMENTS",
    description: "PayPal Environment (sandbox or live)",
  },
  BUSINESS_SUPPORT_EMAIL: {
    value: "owner@dropai.com",
    category: "SUPPORT",
    description: "Business email where customer complaints, tickets, and disputes arrive",
  },
};

export async function GET() {
  try {
    const owner = await requireOwner();

    // 1. Fetch all system settings from database
    const settings = await prisma.systemSetting.findMany({
      where: { category: { in: ["PAYMENTS", "SUPPORT"] } },
    });

    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    // Apply defaults for any missing keys
    const config: Record<string, any> = {};
    for (const [key, meta] of Object.entries(DEFAULT_SETTINGS)) {
      config[key] = settingsMap[key] !== undefined ? settingsMap[key] : meta.value;
    }

    // Mask sensitive secrets before sending to client UI
    const maskedConfig = {
      ...config,
      RAZORPAY_KEY_SECRET: config.RAZORPAY_KEY_SECRET
        ? `••••••••••••${config.RAZORPAY_KEY_SECRET.slice(-4)}`
        : "",
      STRIPE_SECRET_KEY: config.STRIPE_SECRET_KEY
        ? `••••••••••••${config.STRIPE_SECRET_KEY.slice(-4)}`
        : "",
      STRIPE_WEBHOOK_SECRET: config.STRIPE_WEBHOOK_SECRET
        ? `••••••••••••${config.STRIPE_WEBHOOK_SECRET.slice(-4)}`
        : "",
      PAYPAL_SECRET: config.PAYPAL_SECRET
        ? `••••••••••••${config.PAYPAL_SECRET.slice(-4)}`
        : "",
      RAZORPAY_KEY_SECRET_MASKED: config.RAZORPAY_KEY_SECRET
        ? `••••••••••••${config.RAZORPAY_KEY_SECRET.slice(-4)}`
        : "",
      STRIPE_SECRET_KEY_MASKED: config.STRIPE_SECRET_KEY
        ? `••••••••••••${config.STRIPE_SECRET_KEY.slice(-4)}`
        : "",
      STRIPE_WEBHOOK_SECRET_MASKED: config.STRIPE_WEBHOOK_SECRET
        ? `••••••••••••${config.STRIPE_WEBHOOK_SECRET.slice(-4)}`
        : "",
      PAYPAL_SECRET_MASKED: config.PAYPAL_SECRET
        ? `••••••••••••${config.PAYPAL_SECRET.slice(-4)}`
        : "",
    };

    // 2. Fetch real live collected invoices & revenue metrics
    const [invoices, totalPaidInvoices, sumPaid] = await Promise.all([
      prisma.invoice.findMany({
        take: 30,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.invoice.count({ where: { paymentStatus: "PAID" } }),
      prisma.invoice.aggregate({
        where: { paymentStatus: "PAID" },
        _sum: { amount: true },
      }),
    ]);

    return NextResponse.json({
      config: maskedConfig,
      stats: {
        totalRevenue: sumPaid._sum.amount || 0,
        totalInvoicesPaid: totalPaidInvoices,
        activeGatewaysCount: [
          config.RAZORPAY_KEY_ID ? "Razorpay" : null,
          config.STRIPE_PUBLISHABLE_KEY ? "Stripe" : null,
          config.PAYPAL_CLIENT_ID ? "PayPal" : null,
          config.OWNER_BANK_ACCOUNT_NUMBER ? "Bank Wire" : null,
          config.OWNER_UPI_ID ? "UPI" : null,
        ].filter(Boolean).length,
      },
      invoices,
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED_OWNER") {
      return NextResponse.json({ error: "Unauthorized: Platform Owner privilege required." }, { status: 403 });
    }
    console.error("Owner Billing API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const owner = await requireOwner();
    const body = await req.json();
    const { action, settings } = body;
    const ip = getClientIp(req);
    const userAgent = req.headers.get("user-agent") || "Owner Console";

    if (!action) {
      return NextResponse.json({ error: "Action is required." }, { status: 400 });
    }

    // Save batch or specific settings
    if (action === "save_settings" && settings && typeof settings === "object") {
      const updates = [];
      for (const [key, value] of Object.entries(settings)) {
        if (value !== undefined && value !== null) {
          const defaultMeta = DEFAULT_SETTINGS[key] || {
            category: "PAYMENTS",
            description: "Owner payout & gateway parameter",
          };

          // If masked string sent back without changes, don't overwrite real secret
          if (String(value).includes("••••••••••••")) {
            continue;
          }

          updates.push(
            prisma.systemSetting.upsert({
              where: { key },
              update: { value: String(value) },
              create: {
                key,
                value: String(value),
                category: defaultMeta.category,
                description: defaultMeta.description,
              },
            })
          );
        }
      }

      await Promise.all(updates);

      await logOwnerAction({
        ownerId: owner.id,
        action: "PAYMENT_GATEWAYS_CONFIGURED",
        targetType: "SUBSCRIPTION",
        severity: "HIGH",
        previousValue: { keysUpdated: Object.keys(settings) },
        ipAddress: ip,
        userAgent,
      });

      return NextResponse.json({ success: true, message: "Payment & payout accounts successfully updated." });
    }

    // Direct Gateway Mode Toggle (TEST vs LIVE)
    if (action === "toggle_mode") {
      const currentSetting = await prisma.systemSetting.findUnique({
        where: { key: "PAYMENT_GATEWAY_MODE" },
      });
      const nextMode = currentSetting?.value === "LIVE" ? "TEST" : "LIVE";

      await prisma.systemSetting.upsert({
        where: { key: "PAYMENT_GATEWAY_MODE" },
        update: { value: nextMode },
        create: {
          key: "PAYMENT_GATEWAY_MODE",
          value: nextMode,
          category: "PAYMENTS",
          description: "Operational mode for merchant checkouts",
        },
      });

      await logOwnerAction({
        ownerId: owner.id,
        action: `PAYMENT_GATEWAY_MODE_SWITCHED_TO_${nextMode}`,
        targetType: "SUBSCRIPTION",
        severity: "CRITICAL",
        ipAddress: ip,
        userAgent,
      });

      return NextResponse.json({ success: true, mode: nextMode });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED_OWNER") {
      return NextResponse.json({ error: "Unauthorized: Platform Owner privilege required." }, { status: 403 });
    }
    console.error("Owner Billing API update error:", error);
    return NextResponse.json({ error: "Failed to update payment settings." }, { status: 500 });
  }
}
