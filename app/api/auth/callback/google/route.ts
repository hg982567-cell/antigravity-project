import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createDatabaseSession, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from "@/lib/auth/session";
import { getClientIp } from "@/lib/security/rate-limiter";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error || !code) {
    console.warn("Google OAuth callback error:", error);
    return NextResponse.redirect(new URL("/auth/login?error=Google+authentication+cancelled", req.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/auth/login?google_error=setup_required", req.url));
  }

  const host = req.headers.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const redirectUri = `${protocol}://${host}/api/auth/callback/google`;

  try {
    // 1. Exchange code for tokens with Google
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("Failed to exchange Google OAuth code:", tokenData);
      return NextResponse.redirect(new URL("/auth/login?error=Failed+to+verify+Google+account", req.url));
    }

    // 2. Retrieve verified profile from Google UserInfo API
    const userinfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profile = await userinfoResponse.json();

    if (!profile.email) {
      return NextResponse.redirect(new URL("/auth/login?error=Google+did+not+provide+an+email+address", req.url));
    }

    const email = profile.email.toLowerCase().trim();
    const name = profile.name || email.split("@")[0];
    const avatarUrl = profile.picture || null;
    const ip = getClientIp(req);
    const userAgent = req.headers.get("user-agent") || "Mozilla/5.0";

    // 3. Find or register user in database
    let user = await prisma.user.findUnique({
      where: { email },
    }).catch(() => null);

    if (!user) {
      // Create user with randomized unguessable password hash for OAuth
      const randomPassword = crypto.randomBytes(32).toString("hex");
      const bcrypt = require("bcryptjs");
      const passwordHash = await bcrypt.hash(randomPassword, 10);

      user = await prisma.user.create({
        data: {
          email,
          name,
          avatarUrl,
          passwordHash,
          role: "MERCHANT",
          isEmailVerified: true,
          subscription: {
            create: {
              plan: "PRO",
              status: "ACTIVE",
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              aiCreditsRemaining: 2500,
              aiCreditsTotal: 2500,
              storesLimit: 3,
            },
          },
        },
      });
    } else {
      // Update email verification & avatar if changed
      await prisma.user.update({
        where: { id: user.id },
        data: {
          isEmailVerified: true,
          avatarUrl: avatarUrl || user.avatarUrl,
          name: user.name || name,
        },
      }).catch(() => null);
    }

    // 4. Create active session and issue JWT
    const { token } = await createDatabaseSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      ipAddress: ip,
      userAgent,
    });

    const response = NextResponse.redirect(new URL("/app/dashboard", req.url));

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
  } catch (err) {
    console.error("Google OAuth callback exception:", err);
    return NextResponse.redirect(new URL("/auth/login?error=Unexpected+Google+Authentication+Error", req.url));
  }
}
