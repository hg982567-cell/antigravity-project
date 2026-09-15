import { NextResponse } from "next/server";
import { requireOwner, verifyOwnerReAuth } from "@/lib/auth/owner-session";
import { prisma } from "@/lib/prisma";
import { logOwnerAction } from "@/lib/security/owner-audit";
import { getClientIp } from "@/lib/security/rate-limiter";
import { revokeFirebaseRefreshTokens } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const owner = await requireOwner();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "ALL"; // ALL, ACTIVE, SUSPENDED, DELETED
    const role = searchParams.get("role") || "ALL";

    const where: any = {};

    if (status === "ACTIVE") {
      where.isSuspended = false;
      where.deletedAt = null;
    } else if (status === "SUSPENDED") {
      where.isSuspended = true;
      where.deletedAt = null;
    } else if (status === "DELETED") {
      where.deletedAt = { not: null };
    } else {
      where.deletedAt = null;
    }

    if (role !== "ALL") {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { id: { contains: search } },
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isSuspended: true,
        suspendedReason: true,
        suspendedAt: true,
        deletedAt: true,
        isEmailVerified: true,
        twoFactorEnabled: true,
        failedLoginAttempts: true,
        createdAt: true,
        updatedAt: true,
        subscription: {
          select: {
            plan: true,
            status: true,
            aiCreditsRemaining: true,
            aiCreditsTotal: true,
            currentPeriodEnd: true,
          },
        },
        _count: {
          select: {
            stores: true,
            products: true,
            orders: true,
            sessions: true,
            aiRequests: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED_OWNER") {
      return NextResponse.json({ error: "Unauthorized: Owner privilege required." }, { status: 403 });
    }
    console.error("Owner users fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const owner = await requireOwner();
    const body = await req.json();
    const { action, userId, reason, plan, password, mfaCode } = body;
    const ip = getClientIp(req);
    const userAgent = req.headers.get("user-agent") || "Owner Console";

    if (!userId || !action) {
      return NextResponse.json({ error: "Missing required parameters." }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found." }, { status: 404 });
    }

    // Protect Owner account from accidental modification/deletion
    if (targetUser.role === "OWNER" && targetUser.id !== owner.id) {
      return NextResponse.json({ error: "Permission Denied: Cannot modify peer Owner account." }, { status: 403 });
    }

    // 1. Suspend User
    if (action === "suspend") {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isSuspended: true,
          suspendedReason: reason || "Administrative suspension by DropAI Owner.",
          suspendedAt: new Date(),
        },
      });

      // Revoke all active sessions
      await prisma.session.updateMany({
        where: { userId },
        data: { isValid: false },
      });

      if (targetUser.firebaseUid) {
        await revokeFirebaseRefreshTokens(targetUser.firebaseUid).catch(() => null);
      }

      await logOwnerAction({
        ownerId: owner.id,
        action: "USER_SUSPENDED",
        targetType: "USER",
        targetId: userId,
        previousValue: { isSuspended: false },
        newValue: { isSuspended: true, reason },
        severity: "WARNING",
        ipAddress: ip,
        userAgent,
      });

      return NextResponse.json({ success: true, message: `User ${targetUser.email} has been suspended.` });
    }

    // 2. Unsuspend User
    if (action === "unsuspend") {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isSuspended: false,
          suspendedReason: null,
          suspendedAt: null,
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });

      await logOwnerAction({
        ownerId: owner.id,
        action: "USER_RESTORED",
        targetType: "USER",
        targetId: userId,
        previousValue: { isSuspended: true },
        newValue: { isSuspended: false },
        severity: "INFO",
        ipAddress: ip,
        userAgent,
      });

      return NextResponse.json({ success: true, message: `User ${targetUser.email} has been restored.` });
    }

    // 3. Force Logout (Revoke All Sessions)
    if (action === "force_logout") {
      const revoked = await prisma.session.updateMany({
        where: { userId, isValid: true },
        data: { isValid: false },
      });

      if (targetUser.firebaseUid) {
        await revokeFirebaseRefreshTokens(targetUser.firebaseUid).catch(() => null);
      }

      await logOwnerAction({
        ownerId: owner.id,
        action: "USER_SESSIONS_REVOKED",
        targetType: "USER",
        targetId: userId,
        previousValue: { activeSessions: revoked.count },
        newValue: { activeSessions: 0 },
        severity: "INFO",
        ipAddress: ip,
        userAgent,
      });

      return NextResponse.json({
        success: true,
        message: `Revoked ${revoked.count} active sessions for ${targetUser.email}.`,
      });
    }

    // 4. Soft Delete User (Requires Re-Authentication)
    if (action === "soft_delete") {
      // Re-authentication verification
      const reAuth = await verifyOwnerReAuth(owner.id, password, mfaCode);
      if (!reAuth.success) {
        return NextResponse.json(
          { error: reAuth.error || "High-risk operation requires valid Owner password confirmation." },
          { status: 401 }
        );
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          deletedAt: new Date(),
          isSuspended: true,
          suspendedReason: "Account permanently deactivated and soft-deleted.",
        },
      });

      // Revoke all sessions
      await prisma.session.updateMany({
        where: { userId },
        data: { isValid: false },
      });

      await logOwnerAction({
        ownerId: owner.id,
        action: "USER_DELETED_SOFT",
        targetType: "USER",
        targetId: userId,
        previousValue: { email: targetUser.email, deletedAt: null },
        newValue: { deletedAt: new Date() },
        severity: "CRITICAL",
        ipAddress: ip,
        userAgent,
      });

      return NextResponse.json({
        success: true,
        message: `User ${targetUser.email} has been securely deactivated and marked deleted.`,
      });
    }

    // 5. Change User Plan
    if (action === "change_plan") {
      if (!plan) {
        return NextResponse.json({ error: "Missing new plan." }, { status: 400 });
      }

      const existingPlan = targetUser.subscription?.plan || "FREE";

      if (targetUser.subscription) {
        await prisma.subscription.update({
          where: { userId },
          data: {
            plan,
            status: "ACTIVE",
          },
        });
      } else {
        await prisma.subscription.create({
          data: {
            userId,
            plan,
            status: "ACTIVE",
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });
      }

      await logOwnerAction({
        ownerId: owner.id,
        action: "USER_PLAN_CHANGED",
        targetType: "SUBSCRIPTION",
        targetId: userId,
        previousValue: { plan: existingPlan },
        newValue: { plan },
        severity: "WARNING",
        ipAddress: ip,
        userAgent,
      });

      return NextResponse.json({
        success: true,
        message: `Plan for ${targetUser.email} updated to ${plan}.`,
      });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED_OWNER") {
      return NextResponse.json({ error: "Unauthorized: Owner privilege required." }, { status: 403 });
    }
    console.error("Owner users POST error:", error);
    return NextResponse.json({ error: "Failed to process user action." }, { status: 500 });
  }
}
