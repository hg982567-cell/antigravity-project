import { NextResponse } from "next/server";
import { getCurrentOwner, OWNER_COOKIE_NAME } from "@/lib/auth/owner-session";
import { prisma } from "@/lib/prisma";
import { logOwnerAction } from "@/lib/security/owner-audit";
import { getClientIp } from "@/lib/security/rate-limiter";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const owner = await getCurrentOwner();
    if (owner?.sessionId) {
      await prisma.session.update({
        where: { id: owner.sessionId },
        data: { isValid: false },
      });

      await logOwnerAction({
        ownerId: owner.id,
        action: "OWNER_LOGOUT",
        targetType: "AUTH",
        severity: "INFO",
        result: "SUCCESS",
        ipAddress: getClientIp(req),
      });
    }

    const response = NextResponse.json({ success: true, message: "Logged out successfully" });
    response.cookies.delete(OWNER_COOKIE_NAME);
    return response;
  } catch (error) {
    console.error("Owner logout error:", error);
    const response = NextResponse.json({ success: true });
    response.cookies.delete(OWNER_COOKIE_NAME);
    return response;
  }
}
