import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { getClientIp, checkRateLimit } from "@/lib/security/rate-limiter";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`support_ticket_${ip}`, { max: 10, windowMs: 60 * 1000 });
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many support requests. Please wait a minute before submitting again." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { name, email, subject, category = "SUPPORT", message, priority = "MEDIUM" } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email address, and message are required." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(name).trim();
    const cleanSubject = String(subject || "General Inquiry").trim();
    const cleanCategory = String(category).trim().toUpperCase();
    const cleanMessage = String(message).trim();
    const cleanPriority = ["LOW", "MEDIUM", "HIGH", "URGENT"].includes(priority?.toUpperCase())
      ? priority.toUpperCase()
      : "MEDIUM";

    // Detect user session if logged in
    const currentUser = await getCurrentUser().catch(() => null);

    // Business email configuration lookup (or default to owner@dropai.com)
    let businessEmail = "owner@dropai.com";
    try {
      const configSetting = await prisma.systemSetting.findUnique({
        where: { key: "BUSINESS_SUPPORT_EMAIL" },
      });
      if (configSetting?.value) {
        businessEmail = configSetting.value;
      }
    } catch {}

    // Generate unique human-readable ticket number (e.g. TKT-2026-8492)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const currentYear = new Date().getFullYear();
    const ticketNumber = `TKT-${currentYear}-${randomSuffix}`;

    // Store support complaint / ticket in database
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: currentUser?.id || null,
        ticketNumber,
        name: cleanName,
        email: cleanEmail,
        subject: cleanSubject,
        category: cleanCategory,
        message: cleanMessage,
        priority: cleanPriority,
        businessEmail,
        status: "OPEN",
      },
    });

    // Notify Platform Owners via in-app notifications
    try {
      const owners = await prisma.user.findMany({
        where: { role: "OWNER" },
        select: { id: true },
      });

      for (const owner of owners) {
        await prisma.notification.create({
          data: {
            userId: owner.id,
            type: cleanPriority === "URGENT" || cleanPriority === "HIGH" ? "ALERT" : "INFO",
            title: `New Customer Support Ticket: ${ticketNumber}`,
            message: `From ${cleanName} (${cleanEmail}): ${cleanSubject} [${cleanCategory}]`,
            link: "/owner/support",
          },
        });
      }
    } catch (notifErr) {
      console.warn("Failed to dispatch owner notification for support ticket:", notifErr);
    }

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        status: ticket.status,
        businessEmail: ticket.businessEmail,
        createdAt: ticket.createdAt,
      },
      message: `Your complaint/inquiry has been received and routed to ${businessEmail}. Your reference number is ${ticketNumber}.`,
    });
  } catch (error: any) {
    console.error("Support ticket creation error:", error);
    return NextResponse.json(
      { error: "Failed to submit support ticket. Please try again or email support@dropai.io directly." },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Merchants only see their own tickets; Owners see all tickets
    const isOwner = user.role === "OWNER";
    const tickets = await prisma.supportTicket.findMany({
      where: isOwner ? {} : { OR: [{ userId: user.id }, { email: user.email }] },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tickets });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch tickets" }, { status: 500 });
  }
}
