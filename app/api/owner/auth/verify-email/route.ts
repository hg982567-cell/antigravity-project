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
    const cleanEmail = (email || "").trim().toLowerCase();

    if (!cleanEmail) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    // Authoritative database check: User MUST exist in database with role OWNER
    let user: any = null;
    try {
      user = await prisma.user.findFirst({
        where: {
          email: cleanEmail,
          role: "OWNER",
        },
      });
    } catch (dbError) {
      console.warn("Database lookup error in verify-email:", dbError);
    }

    if (!user) {
      return NextResponse.json(
        { error: "Access Denied: You do not possess Platform Administrator privileges." },
        { status: 403 }
      );
    }

    if (user.isSuspended || user.status === "SUSPENDED") {
      return NextResponse.json(
        { error: "Access Denied: Owner account is currently suspended." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      allowed: true,
      email: user.email,
      requiresMfa: user.twoFactorEnabled ?? false,
    });
  } catch (error) {
    console.error("Owner verify-email error:", error);
    return NextResponse.json({ error: "Verification failure." }, { status: 500 });
  }
}
