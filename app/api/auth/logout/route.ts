import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

export async function POST() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
      const payload = await verifySessionToken(token);
      if (payload?.sessionId) {
        await prisma.session.update({
          where: { id: payload.sessionId },
          data: { isValid: false },
        }).catch(() => null);

        await prisma.securityEvent.create({
          data: {
            userId: payload.userId,
            eventType: "LOGOUT",
            ipAddress: "127.0.0.1",
            metadata: JSON.stringify({ sessionId: payload.sessionId }),
          },
        }).catch(() => null);
      }
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    const response = NextResponse.json({ success: true });
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }
}
