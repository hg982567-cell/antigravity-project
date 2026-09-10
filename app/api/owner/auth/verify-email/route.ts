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

    const { email } = await req.json();
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists with OWNER role
    const user = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        role: "OWNER",
      },
    });

    if (!user) {
      // Intentionally reject any non-owner emails without leaking information
      return NextResponse.json(
        { error: "Access Denied: This portal is strictly reserved for the authorized DropAI Owner." },
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
