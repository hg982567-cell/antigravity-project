import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getCurrentUser,
  createDatabaseSession,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
} from "@/lib/auth/session";
import {
  getCurrentOwner,
  createOwnerDatabaseSession,
  OWNER_COOKIE_NAME,
  OWNER_SESSION_MAX_AGE,
} from "@/lib/auth/owner-session";
import { verifyFirebaseIdToken } from "@/lib/firebase/admin";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/session
 * Returns current session info for the authenticated user or owner.
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    const owner = await getCurrentOwner();

    // isOwner is strictly true ONLY when a verified owner session cookie exists (authenticated with owner password)
    const isOwner = Boolean(owner);
    const isOwnerAccount = Boolean((user && (user.role === "OWNER" || user.role === "ADMIN")) || owner);
    const effectiveUser: any =
      user ||
      (owner
        ? {
            id: owner.id,
            firebaseUid: null,
            name: owner.name,
            email: owner.email,
            role: "OWNER",
            isEmailVerified: true,
            status: "ACTIVE",
            twoFactorEnabled: true,
            avatarUrl: (owner as any).avatarUrl || null,
            isSuspended: false,
            suspendedReason: null,
          }
        : null);

    if (!effectiveUser) {
      return NextResponse.json(
        { authenticated: false, user: null, isOwner: false, isOwnerAccount: false },
        { status: 200 }
      );
    }

    const response = NextResponse.json({
      authenticated: true,
      user: {
        id: effectiveUser.id,
        firebaseUid: effectiveUser.firebaseUid || null,
        name: effectiveUser.name,
        email: effectiveUser.email,
        role: effectiveUser.role,
        status: effectiveUser.status || (effectiveUser.isEmailVerified ? "ACTIVE" : "EMAIL_UNVERIFIED"),
        isEmailVerified: effectiveUser.isEmailVerified ?? false,
        avatarUrl: effectiveUser.avatarUrl || null,
        isSuspended: effectiveUser.isSuspended || effectiveUser.status === "SUSPENDED",
        suspendedReason: effectiveUser.suspendedReason || null,
      },
      isOwner,
      isOwnerAccount,
    });

    // If merchant is logged in, proactively clear any lingering owner cookie
    if (user && user.role !== "OWNER") {
      response.cookies.set({
        name: OWNER_COOKIE_NAME,
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        expires: new Date(0),
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error("GET /api/auth/session error:", error);
    return NextResponse.json(
      { authenticated: false, user: null, isOwner: false },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/session
 * Verifies Firebase ID token, syncs or provisions user in Prisma, and establishes session cookies.
 */
export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const userAgent = req.headers.get("user-agent") || "Mozilla/5.0";

    // 1. Rate Limiting: 10 session exchanges per minute per IP
    const rateLimit = checkRateLimit(`session_post_${ip}`, {
      windowMs: 60 * 1000,
      max: 10,
    });
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many authentication requests. Please wait a minute before retrying." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { idToken, name, action } = body;

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 400 }
      );
    }

    // 2. Cryptographically verify Firebase ID Token via Firebase Admin SDK
    const decodedToken = await verifyFirebaseIdToken(idToken);
    if (!decodedToken || !decodedToken.uid || !decodedToken.email) {
      // Always generic error - zero enumeration
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const firebaseUid = decodedToken.uid;
    const email = decodedToken.email.toLowerCase().trim();
    const isEmailVerified = Boolean(decodedToken.email_verified);
    const hasAdminClaim = Boolean(decodedToken.admin) || decodedToken.role === "OWNER";

    // 3. Maintenance mode check
    try {
      const maintenanceSetting = await prisma.systemSetting.findUnique({
        where: { key: "maintenance_mode" },
      });
      if (maintenanceSetting?.value === "true" && !hasAdminClaim) {
        return NextResponse.json(
          { error: "DropAI is currently in Maintenance Mode for scheduled infrastructure optimization." },
          { status: 503 }
        );
      }
    } catch (e) {
      console.warn("Maintenance mode check skipped:", e);
    }

    // 4. Look up existing user in database
    let user = null;
    try {
      user = await prisma.user.findFirst({
        where: {
          OR: [{ firebaseUid }, { email }],
        },
      });
    } catch (err) {
      console.warn("Prisma user lookup error in /api/auth/session:", err);
    }

    // 5. If user does not exist, provision new user
    if (!user) {
      // Check public registration setting
      try {
        const regSetting = await prisma.systemSetting.findUnique({
          where: { key: "public_registration_enabled" },
        });
        if (regSetting?.value === "false" && !hasAdminClaim) {
          return NextResponse.json(
            { error: "Public merchant registration is temporarily closed by platform administration." },
            { status: 403 }
          );
        }
      } catch (regErr) {
        console.warn("Registration setting check skipped:", regErr);
      }

      const userRole = hasAdminClaim ? "OWNER" : "MERCHANT";
      const initialStatus = isEmailVerified ? "ACTIVE" : "EMAIL_UNVERIFIED";

      try {
        user = await prisma.user.create({
          data: {
            firebaseUid,
            email,
            name: name?.trim() || decodedToken.name || email.split("@")[0],
            role: userRole,
            status: initialStatus,
            isEmailVerified,
            avatarUrl: decodedToken.picture || null,
          },
        });

        // Create default starter subscription for new merchant
        if (userRole === "MERCHANT") {
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
          }).catch(() => null);
        }
      } catch (err) {
        console.error("Failed to provision new user in DB:", err);
        // Fallback user object if DB is temporarily offline
        user = {
          id: `usr_${firebaseUid.substring(0, 16)}`,
          firebaseUid,
          email,
          name: name?.trim() || decodedToken.name || email.split("@")[0],
          role: userRole,
          status: initialStatus,
          isEmailVerified,
          isSuspended: false,
          suspendedReason: null,
          deletedAt: null,
        };
      }
    } else {
      // Update user with firebaseUid if not linked yet, or sync verified email status
      const needsUpdate =
        user.firebaseUid !== firebaseUid ||
        (isEmailVerified && !user.isEmailVerified) ||
        (isEmailVerified && user.status === "EMAIL_UNVERIFIED") ||
        (hasAdminClaim && user.role !== "OWNER");

      if (needsUpdate) {
        try {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              firebaseUid,
              isEmailVerified: user.isEmailVerified || isEmailVerified,
              status:
                user.status === "EMAIL_UNVERIFIED" && isEmailVerified
                  ? "ACTIVE"
                  : user.status,
              role: hasAdminClaim ? "OWNER" : user.role,
              avatarUrl: user.avatarUrl || decodedToken.picture || undefined,
            },
          });
        } catch (err) {
          console.warn("Failed to sync user attributes in DB:", err);
        }
      }
    }

    // 6. Enforce account states
    if (user.deletedAt) {
      return NextResponse.json(
        { error: "This account has been deactivated. Please contact support." },
        { status: 403 }
      );
    }

    if (user.isSuspended || user.status === "SUSPENDED" || user.status === "DISABLED") {
      return NextResponse.json(
        { error: `Account suspended: ${user.suspendedReason || "Administrative hold by Platform Owner."}` },
        { status: 403 }
      );
    }

    // 7. Establish database session
    const effectiveIsEmailVerified = Boolean(user.isEmailVerified || isEmailVerified);
    const effectiveStatus =
      user.status === "EMAIL_UNVERIFIED" && effectiveIsEmailVerified
        ? "ACTIVE"
        : user.status || (effectiveIsEmailVerified ? "ACTIVE" : "EMAIL_UNVERIFIED");

    const { token: sessionToken } = await createDatabaseSession({
      userId: user.id,
      firebaseUid,
      email: user.email,
      role: user.role,
      status: effectiveStatus,
      isEmailVerified: effectiveIsEmailVerified,
      ipAddress: ip,
      userAgent,
    });

    // 8. Prepare JSON Response & Set HttpOnly Session Cookie
    const isOwner = user.role === "OWNER" || hasAdminClaim;
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        firebaseUid,
        email: user.email,
        name: user.name,
        role: user.role,
        status: effectiveStatus,
        isEmailVerified: effectiveIsEmailVerified,
      },
      isOwner,
    });

    // dropai_session_token cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });

    // 9. Owner session isolation: Normal merchant login NEVER generates owner session tokens.
    // Platform Owner access strictly requires explicit password authentication via /owner/login.
    response.cookies.set({
      name: OWNER_COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      expires: new Date(0),
      path: "/",
    });

    // Log security event safely
    try {
      await prisma.securityEvent.create({
        data: {
          userId: user.id,
          eventType: action === "signup" ? "SIGNUP_SUCCESS" : "LOGIN_SUCCESS",
          ipAddress: ip,
          userAgent,
          metadata: JSON.stringify({
            provider: (decodedToken as any).firebase?.sign_in_provider || "firebase",
            firebaseUid,
          }),
        },
      });
    } catch {}

    return response;
  } catch (error) {
    console.error("POST /api/auth/session error:", error);
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 500 }
    );
  }
}
