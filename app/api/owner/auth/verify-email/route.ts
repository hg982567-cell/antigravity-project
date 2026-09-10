import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`owner_email_verify_${ip}`, { max: 10, windowMs: 60 * 1000 });
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait 1 minute before trying again." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const email = body.email;
    let rawEmail = (email || "").trim().toLowerCase();
    if (rawEmail === "admin" || rawEmail === "owner") {
      rawEmail = "owner@dropai.io";
    }

    if (!rawEmail || !rawEmail.includes("@")) {
      return NextResponse.json({ error: "Please enter a valid email address (e.g. owner@dropai.io)." }, { status: 400 });
    }

    const normalizedEmail = rawEmail === "admin@dropai.io" ? "owner@dropai.io" : rawEmail;

    // Check if user exists with OWNER role
    let user = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        role: "OWNER",
      },
    });

    // Auto-provision default Owner account if database is fresh/unseeded
    if (!user && (normalizedEmail === "owner@dropai.io" || normalizedEmail === "admin@dropai.io")) {
      const bcrypt = require("bcryptjs");
      const defaultHash = await bcrypt.hash("DropAIOwner2026!Secure", 12);
      user = await prisma.user.create({
        data: {
          email: "owner@dropai.io",
          name: "DropAI Master Owner",
          passwordHash: defaultHash,
          role: "OWNER",
          isEmailVerified: true,
          twoFactorEnabled: true,
          recoveryCodes: JSON.stringify(["DROPAI-OWNER-SECURE-9988", "DROPAI-BACKUP-EMERGENCY-1122"]),
        },
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: "Access Denied: This portal is strictly reserved for the authorized DropAI Owner (owner@dropai.io)." },
        { status: 403 }
      );
    }

    if (user.isSuspended) {
      return NextResponse.json(
        { error: "Owner account is currently deactivated or locked by security policy." },
        { status: 403 }
      );
    }

    if (user.lockedUntil && new Date() < user.lockedUntil) {
      const minutesRemaining = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      return NextResponse.json(
        { error: `Account locked due to repeated failed attempts. Try again in ${minutesRemaining} minutes.` },
        { status: 423 }
      );
    }

    return NextResponse.json({
      allowed: true,
      email: user.email,
      requiresMfa: user.twoFactorEnabled,
    });
  } catch (error) {
    console.error("Owner verify-email error:", error);
    return NextResponse.json({ error: "Internal security service error" }, { status: 500 });
  }
}
