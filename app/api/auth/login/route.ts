import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createDatabaseSession, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from "@/lib/auth/session";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);

    // 1. Enforce strict rate limit on login endpoint (5 attempts per minute per IP)
    const rateLimit = checkRateLimit(`login_${ip}`, { windowMs: 60 * 1000, max: 5 });
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many login attempts. Please wait 60 seconds before trying again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    // 2. Safe query: Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Generic safe error message to prevent account enumeration
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password credentials." },
        { status: 401 }
      );
    }

    // 3. Verify bcrypt password
    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      // Log failed security event
      await prisma.securityEvent.create({
        data: {
          userId: user.id,
          eventType: "LOGIN_FAIL",
          ipAddress: ip,
          userAgent: req.headers.get("user-agent"),
          metadata: JSON.stringify({ reason: "Incorrect password" }),
        },
      });

      return NextResponse.json(
        { error: "Invalid email or password credentials." },
        { status: 401 }
      );
    }

    // 4. Check account deactivation / soft-delete
    if (user.deletedAt) {
      return NextResponse.json(
        { error: "This account has been deactivated. Please contact support." },
        { status: 403 }
      );
    }

    // 5. Check account suspension (from /owner/users)
    if (user.isSuspended) {
      return NextResponse.json(
        { error: `Account suspended: ${user.suspendedReason || "Administrative hold by Platform Owner."}` },
        { status: 403 }
      );
    }

    // 6. Check platform maintenance mode
    const maintenanceSetting = await prisma.systemSetting.findUnique({ where: { key: "maintenance_mode" } });
    if (maintenanceSetting?.value === "true" && user.role !== "OWNER") {
      return NextResponse.json(
        { error: "DropAI is currently in Maintenance Mode for scheduled infrastructure optimization. Please try again shortly." },
        { status: 503 }
      );
    }

    // 4. If 2FA enabled, prompt for 2FA step
    if (user.twoFactorEnabled) {
      return NextResponse.json({
        requires2FA: true,
        userId: user.id,
        email: user.email,
      });
    }

    // 5. Create active DB session and JWT
    const { token } = await createDatabaseSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      ipAddress: ip,
      userAgent: req.headers.get("user-agent") || "Mozilla/5.0",
    });

    // Log successful security event
    await prisma.securityEvent.create({
      data: {
        userId: user.id,
        eventType: "LOGIN_SUCCESS",
        ipAddress: ip,
        userAgent: req.headers.get("user-agent"),
        metadata: JSON.stringify({ method: "password" }),
      },
    });

    // 6. Set secure HttpOnly cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during authentication. Please try again." },
      { status: 500 }
    );
  }
}
