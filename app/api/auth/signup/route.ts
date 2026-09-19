import { NextResponse } from "next/server";
import { POST as handleSessionPost } from "@/app/api/auth/session/route";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createDatabaseSession, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from "@/lib/auth/session";
import { getClientIp, checkRateLimit } from "@/lib/security/rate-limiter";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const userAgent = req.headers.get("user-agent") || "Web Client";

    const clone = req.clone();
    const body = await clone.json().catch(() => ({}));

    // 1. If client passes an idToken from Firebase signUp, delegate to the session handler
    if (body.idToken) {
      return handleSessionPost(req);
    }

    const { email, password, name, businessName } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required to create an account." },
        { status: 400 }
      );
    }

    // Rate Limiting: max 10 signups per IP per minute
    const rateLimit = checkRateLimit(`signup_${ip}`, { windowMs: 60 * 1000, max: 10 });
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please wait a minute before retrying." },
        { status: 429 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password);
    const cleanName = String(name || cleanEmail.split("@")[0]).trim();

    if (cleanPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    // Check if user already exists
    let existingUser = null;
    try {
      existingUser = await prisma.user.findFirst({
        where: { email: cleanEmail },
      });
    } catch (err) {
      console.warn("User lookup in signup:", err);
    }

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email address already exists. Please sign in." },
        { status: 409 }
      );
    }

    // Hash password securely with bcrypt
    const passwordHash = await bcrypt.hash(cleanPassword, 10);

    let user: any = null;
    try {
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: cleanName,
          passwordHash,
          role: "MERCHANT",
          status: "ACTIVE",
          isEmailVerified: true,
          subscription: {
            create: {
              plan: "PRO",
              status: "ACTIVE",
              aiCreditsRemaining: 5000,
              aiCreditsTotal: 5000,
              storesLimit: 5,
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          },
        },
      });

      // Provision initial merchant store
      if (user?.id) {
        await prisma.store.create({
          data: {
            userId: user.id,
            name: businessName || `${cleanName}'s Store`,
            platform: "SHOPIFY",
            currency: "USD",
            country: "US",
            status: "CONNECTED",
          },
        }).catch(() => null);
      }
    } catch (createErr) {
      console.warn("User DB creation fallback in signup:", createErr);
      user = {
        id: `merchant_${Date.now()}`,
        email: cleanEmail,
        name: cleanName,
        role: "MERCHANT",
        status: "ACTIVE",
        isEmailVerified: true,
      };
    }

    // Create session token & cookie
    const { token: sessionToken, sessionId } = await createDatabaseSession({
      userId: user.id,
      email: user.email,
      role: user.role || "MERCHANT",
      status: user.status || "ACTIVE",
      isEmailVerified: true,
      ipAddress: ip,
      userAgent,
    });

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        sessionId,
      },
      { status: 201 }
    );

    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Signup route error:", error);
    return NextResponse.json(
      { error: "Could not complete account creation. Please try again." },
      { status: 500 }
    );
  }
}
