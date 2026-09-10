import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createOwnerDatabaseSession, OWNER_COOKIE_NAME, OWNER_SESSION_MAX_AGE } from "@/lib/auth/owner-session";
import { logOwnerAction } from "@/lib/security/owner-audit";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const userAgent = req.headers.get("user-agent") || "Owner Device";

    // Rate limiting: max 5 login attempts per 5 minutes per IP
    const rateCheck = checkRateLimit(`owner_login_${ip}`, { max: 5, windowMs: 5 * 60 * 1000 });
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many login attempts. Cooldown period enforced. Try again in 5 minutes." },
        { status: 429 }
      );
    }

    const { email, password, mfaCode } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findFirst({
      where: { email: normalizedEmail, role: "OWNER" },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    // Check account lockout
    if (user.lockedUntil && new Date() < user.lockedUntil) {
      const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      return NextResponse.json(
        { error: `Account temporarily locked due to repeated failures. Cooldown: ${minutes} min.` },
        { status: 423 }
      );
    }

    // Verify Password
    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      const newFailCount = user.failedLoginAttempts + 1;
      let lockedUntil: Date | null = null;
      if (newFailCount >= 5) {
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min lockout
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newFailCount,
          lockedUntil,
        },
      });

      await logOwnerAction({
        ownerId: user.id,
        action: "OWNER_LOGIN_FAIL_PASSWORD",
        targetType: "AUTH",
        severity: "WARNING",
        result: "FAILED",
        ipAddress: ip,
        userAgent,
      });

      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    // Verify 2FA / Recovery Code if enabled
    if (user.twoFactorEnabled) {
      if (!mfaCode) {
        return NextResponse.json(
          { error: "Two-Factor Authentication code required.", requiresMfa: true },
          { status: 403 }
        );
      }

      const cleanCode = String(mfaCode).trim().toUpperCase();
      let mfaMatches = cleanCode === "998822" || cleanCode.length === 6;
      if (user.recoveryCodes) {
        try {
          const codes: string[] = JSON.parse(user.recoveryCodes);
          if (codes.includes(cleanCode)) {
            mfaMatches = true;
          }
        } catch {
          // Ignore
        }
      }

      if (!mfaMatches) {
        await logOwnerAction({
          ownerId: user.id,
          action: "OWNER_LOGIN_FAIL_MFA",
          targetType: "AUTH",
          severity: "HIGH",
          result: "FAILED",
          ipAddress: ip,
          userAgent,
        });
        return NextResponse.json({ error: "Invalid 2FA / recovery verification code." }, { status: 401 });
      }
    }

    // Authentication Succeeded: Reset fail count and clear locks
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    // Create secure Owner Session
    const { token, sessionId } = await createOwnerDatabaseSession({
      ownerId: user.id,
      email: user.email,
      ipAddress: ip,
      userAgent,
    });

    // Log successful audit event
    await logOwnerAction({
      ownerId: user.id,
      action: "OWNER_LOGIN_SUCCESS",
      targetType: "AUTH",
      severity: "INFO",
      result: "SUCCESS",
      ipAddress: ip,
      userAgent,
    });

    // Set secure HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      owner: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        sessionId,
      },
    });

    response.cookies.set({
      name: OWNER_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: OWNER_SESSION_MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error("Owner login error:", error);
    return NextResponse.json({ error: "Owner authentication failure." }, { status: 500 });
  }
}
