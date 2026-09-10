import { NextResponse } from "next/server";
import { requireOwner, verifyOwnerReAuth } from "@/lib/auth/owner-session";
import { logOwnerAction } from "@/lib/security/owner-audit";
import { getClientIp } from "@/lib/security/rate-limiter";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const owner = await requireOwner();
    const { password, mfaCode, action } = await req.json();

    const result = await verifyOwnerReAuth(owner.id, password, mfaCode);
    const ip = getClientIp(req);
    const userAgent = req.headers.get("user-agent") || "Owner Device";

    if (!result.success) {
      await logOwnerAction({
        ownerId: owner.id,
        action: `REAUTH_FAILED_${action || "OPERATION"}`,
        targetType: "AUTH",
        severity: "HIGH",
        result: "FAILED",
        ipAddress: ip,
        userAgent,
      });

      return NextResponse.json({ error: result.error || "Re-authentication failed" }, { status: 401 });
    }

    await logOwnerAction({
      ownerId: owner.id,
      action: `REAUTH_SUCCESS_${action || "OPERATION"}`,
      targetType: "AUTH",
      severity: "INFO",
      result: "SUCCESS",
      ipAddress: ip,
      userAgent,
    });

    return NextResponse.json({ success: true, verified: true });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized: Owner session required" }, { status: 403 });
  }
}
