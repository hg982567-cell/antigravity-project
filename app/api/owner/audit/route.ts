import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth/owner-session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const owner = await requireOwner();
    const { searchParams } = new URL(req.url);
    const targetType = searchParams.get("targetType") || "ALL";
    const severity = searchParams.get("severity") || "ALL";
    const search = searchParams.get("search") || "";

    const where: any = {};
    if (targetType !== "ALL") where.targetType = targetType;
    if (severity !== "ALL") where.severity = severity;
    if (search) {
      const isPostgres = process.env.DATABASE_URL?.startsWith("postgres");
      where.OR = [
        { action: { contains: search, ...(isPostgres ? { mode: "insensitive" } : {}) } },
        { targetId: { contains: search, ...(isPostgres ? { mode: "insensitive" } : {}) } },
        { ipAddress: { contains: search } },
      ];
    }

    const logs = await prisma.ownerAuditLog.findMany({
      where,
      take: 100,
      orderBy: { createdAt: "desc" },
      include: {
        owner: {
          select: { name: true, email: true, role: true },
        },
      },
    });

    return NextResponse.json({ logs });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED_OWNER") {
      return NextResponse.json({ error: "Unauthorized: Owner privilege required." }, { status: 403 });
    }
    console.error("Owner audit error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
