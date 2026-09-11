import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyFirebaseIdToken } from "@/lib/firebase/admin";
import {
  getCurrentUser,
  createDatabaseSession,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
} from "@/lib/auth/session";
import { getClientIp, checkRateLimit } from "@/lib/security/rate-limiter";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/verify-email
 * Checks and syncs email verification state from Firebase token to Prisma DB and session.
 */
export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const userAgent = req.headers.get("user-agent") || "Mozilla/5.0";

    const rateLimit = checkRateLimit(`verify_email_${ip}`, {
      windowMs: 60 * 1000,
      max: 15,
    });
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json(
        { error: "ID token is required to check verification status." },
        { status: 400 }
      );
    }

    const decoded = await verifyFirebaseIdToken(idToken);
    if (!decoded || !decoded.uid) {
      return NextResponse.json(
        { error: "Invalid authentication token." },
        { status: 401 }
      );
    }

    const isVerified = Boolean(decoded.email_verified);

    if (isVerified) {
      // Update User record in database
      const user = await prisma.user.findFirst({
        where: {
          OR: [{ firebaseUid: decoded.uid }, { email: decoded.email?.toLowerCase().trim() }],
        },
      });

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            isEmailVerified: true,
            status: user.status === "EMAIL_UNVERIFIED" ? "ACTIVE" : user.status,
          },
        });

        // Re-issue session cookie with verified status
        const { token: newSessionToken } = await createDatabaseSession({
          userId: user.id,
          firebaseUid: decoded.uid,
          email: user.email,
          role: user.role,
          status: "ACTIVE",
          isEmailVerified: true,
          ipAddress: ip,
          userAgent,
        });

        const response = NextResponse.json({
          verified: true,
          message: "Email successfully verified!",
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: "ACTIVE",
            isEmailVerified: true,
          },
        });

        response.cookies.set({
          name: SESSION_COOKIE_NAME,
          value: newSessionToken,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: SESSION_MAX_AGE,
          path: "/",
        });

        return response;
      }
    }

    return NextResponse.json({
      verified: isVerified,
      message: isVerified
        ? "Email is verified."
        : "Email not verified yet. Please check your inbox and click the verification link, then click Check Status.",
    });
  } catch (error) {
    console.error("Verification status check error:", error);
    return NextResponse.json(
      { error: "Failed to verify email status." },
      { status: 500 }
    );
  }
}
