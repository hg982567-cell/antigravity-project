import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createDatabaseSession, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from "@/lib/auth/session";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);

    // Rate limit signup endpoint (3 attempts per minute per IP)
    const rateLimit = checkRateLimit(`signup_${ip}`, { windowMs: 60 * 1000, max: 3 });
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many registration requests. Please wait a minute before trying again." },
        { status: 429 }
      );
    }

    // Check system settings: public registration & maintenance mode
    const [regSetting, maintenanceSetting] = await Promise.all([
      prisma.systemSetting.findUnique({ where: { key: "public_registration_enabled" } }),
      prisma.systemSetting.findUnique({ where: { key: "maintenance_mode" } }),
    ]);

    if (regSetting?.value === "false") {
      return NextResponse.json(
        { error: "Public merchant registration is temporarily closed by the platform administrator." },
        { status: 403 }
      );
    }

    if (maintenanceSetting?.value === "true") {
      return NextResponse.json(
        { error: "DropAI is currently in Maintenance Mode for scheduled infrastructure optimization." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Name, email, and password are required fields." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check existing user
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email address already exists. Please log in." },
        { status: 400 }
      );
    }

    // Hash password with 12 bcrypt salt rounds
    const passwordHash = await hashPassword(password);

    // Create user in DB
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: name.trim(),
        role: "MERCHANT",
        isEmailVerified: true,
      },
    });

    // Create default starter subscription
    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: "STARTER",
        status: "ACTIVE",
        currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14-day trial
        aiCreditsRemaining: 1000,
        aiCreditsTotal: 1000,
        storesLimit: 1,
      },
    });

    // Create active session
    const { token } = await createDatabaseSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      ipAddress: ip,
      userAgent: req.headers.get("user-agent") || "Mozilla/5.0",
    });

    // Log security event
    await prisma.securityEvent.create({
      data: {
        userId: user.id,
        eventType: "SIGNUP_SUCCESS",
        ipAddress: ip,
        userAgent: req.headers.get("user-agent"),
        metadata: JSON.stringify({ method: "email_registration" }),
      },
    });

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
    console.error("Signup API error:", error);
    return NextResponse.json(
      { error: "Could not complete account creation. Please try again." },
      { status: 500 }
    );
  }
}
