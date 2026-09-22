import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accounts = await prisma.socialAccount.findMany({
      where: { userId: user.id },
      include: {
        adPosts: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ accounts });
  } catch (error: any) {
    console.error("GET /api/app/social-accounts error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to load social accounts" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.isSuspended || user.status === "SUSPENDED") {
      return NextResponse.json({ error: "Account suspended." }, { status: 403 });
    }

    const body = await req.json();
    const { platform, accountName, displayName, profileUrl, apiKey, accessToken, webhookUrl, autoPublishAds } = body;

    if (!platform || !accountName) {
      return NextResponse.json(
        { error: "Platform and account name (handle) are required." },
        { status: 400 }
      );
    }

    // Check account limit (support at least 25 accounts per user)
    const existingCount = await prisma.socialAccount.count({
      where: { userId: user.id },
    });

    if (existingCount >= 25) {
      return NextResponse.json(
        { error: "Maximum limit of 25 social accounts reached. Please remove an existing account first." },
        { status: 400 }
      );
    }

    const account = await prisma.socialAccount.create({
      data: {
        userId: user.id,
        platform: String(platform).toUpperCase().trim(),
        accountName: String(accountName).trim(),
        displayName: displayName?.trim() || String(accountName).trim(),
        profileUrl: profileUrl?.trim() || null,
        apiKey: apiKey?.trim() || null,
        accessToken: accessToken?.trim() || null,
        webhookUrl: webhookUrl?.trim() || null,
        autoPublishAds: autoPublishAds !== false,
        status: "CONNECTED",
      },
    });

    return NextResponse.json({ success: true, account }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/app/social-accounts error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to add social account" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Account ID is required." }, { status: 400 });
    }

    const existing = await prisma.socialAccount.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Account not found or access denied." }, { status: 404 });
    }

    await prisma.socialAccount.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error("DELETE /api/app/social-accounts error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to remove social account" },
      { status: 500 }
    );
  }
}
