import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const lockdown = await prisma.emergencyLockdown.findFirst({
      where: { isActive: true },
    });

    return NextResponse.json({
      lockdownActive: !!lockdown,
      reason: lockdown?.reason || null,
      activatedAt: lockdown?.activatedAt || null,
    });
  } catch {
    return NextResponse.json({ lockdownActive: false }, { status: 200 });
  }
}
