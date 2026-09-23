import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: {
        category: { in: ["PAYMENTS", "SUPPORT"] },
      },
    });

    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    return NextResponse.json({
      gatewayMode: settingsMap["PAYMENT_GATEWAY_MODE"] || "TEST",
      bankDetails: {
        bankName: settingsMap["OWNER_BANK_NAME"] || "HDFC Bank Ltd",
        accountName: settingsMap["OWNER_BANK_ACCOUNT_NAME"] || "RAVAN SHIPPING Commercial Payouts",
        accountNumber: settingsMap["OWNER_BANK_ACCOUNT_NUMBER"] || "50200084920194",
        ifscSwift: settingsMap["OWNER_BANK_IFSC_SWIFT"] || "HDFC0001234 / HDFCINBB",
        branch: settingsMap["OWNER_BANK_BRANCH"] || "Financial District Branch, Mumbai",
      },
      upiDetails: {
        upiId: settingsMap["OWNER_UPI_ID"] || "owner@okhdfcbank",
        upiName: settingsMap["OWNER_UPI_NAME"] || "RAVAN SHIPPING Commercial Payouts",
      },
      stripePublishableKey: settingsMap["STRIPE_PUBLISHABLE_KEY"] || "",
      razorpayKeyId: settingsMap["RAZORPAY_KEY_ID"] || "",
      paypalClientId: settingsMap["PAYPAL_CLIENT_ID"] || "",
      paypalEmail: settingsMap["OWNER_PAYPAL_EMAIL"] || settingsMap["BUSINESS_SUPPORT_EMAIL"] || "billing@ravanshipping.com",
      businessSupportEmail: settingsMap["BUSINESS_SUPPORT_EMAIL"] || "owner@ravanshipping.com",
    });
  } catch (err: any) {
    console.error("Public billing config fetch error:", err);
    // Graceful fallback
    return NextResponse.json({
      gatewayMode: "TEST",
      bankDetails: {
        bankName: "HDFC Bank Ltd",
        accountName: "RAVAN SHIPPING Commercial Payouts",
        accountNumber: "50200084920194",
        ifscSwift: "HDFC0001234 / HDFCINBB",
        branch: "Financial District Branch, Mumbai",
      },
      upiDetails: {
        upiId: "owner@okhdfcbank",
        upiName: "RAVAN SHIPPING Commercial Payouts",
      },
      stripePublishableKey: "",
      razorpayKeyId: "",
      paypalClientId: "",
      businessSupportEmail: "owner@ravanshipping.com",
    });
  }
}
