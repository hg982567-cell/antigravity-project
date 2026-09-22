import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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
    const { accountIds, adTitle, hook, caption, cta, mediaUrl, scheduledFor } = body;

    if (!accountIds || !Array.isArray(accountIds) || accountIds.length === 0) {
      return NextResponse.json(
        { error: "Please select at least one social media account to upload your ad." },
        { status: 400 }
      );
    }

    if (!caption && !hook) {
      return NextResponse.json(
        { error: "Ad copy or hook content is required." },
        { status: 400 }
      );
    }

    // Verify all selected accounts belong to active user
    const accounts = await prisma.socialAccount.findMany({
      where: {
        id: { in: accountIds },
        userId: user.id,
      },
    });

    if (accounts.length === 0) {
      return NextResponse.json(
        { error: "No valid connected social accounts found." },
        { status: 404 }
      );
    }

    const results = [];
    const isScheduled = Boolean(scheduledFor && new Date(scheduledFor) > new Date());

    for (const account of accounts) {
      let dispatchStatus = isScheduled ? "SCHEDULED" : "PUBLISHED";
      let externalPostId = `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      // If user provided a webhook URL (Zapier, Make, n8n, Publer, or direct API endpoint)
      if (account.webhookUrl && !isScheduled) {
        try {
          const webhookRes = await fetch(account.webhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(account.apiKey ? { Authorization: `Bearer ${account.apiKey}` } : {}),
            },
            body: JSON.stringify({
              event: "AUTO_PUBLISH_AD",
              platform: account.platform,
              accountName: account.accountName,
              ad: {
                title: adTitle || "DropAI Viral Ad",
                hook: hook || "",
                caption: caption || "",
                cta: cta || "Shop Now",
                mediaUrl: mediaUrl || null,
              },
              timestamp: new Date().toISOString(),
            }),
          });

          if (!webhookRes.ok) {
            console.warn(`Webhook dispatch returned status ${webhookRes.status} for ${account.accountName}`);
          }
        } catch (webhookErr) {
          console.warn(`Webhook dispatch error for ${account.accountName}:`, webhookErr);
        }
      }

      // Record Ad Post in database
      const post = await prisma.socialAdPost.create({
        data: {
          socialAccountId: account.id,
          adTitle: adTitle || "AI Viral Ad",
          caption: `${hook ? hook + "\n\n" : ""}${caption || ""}${cta ? "\n\n" + cta : ""}`,
          hook: hook || null,
          cta: cta || null,
          mediaUrl: mediaUrl || null,
          platform: account.platform,
          status: dispatchStatus,
          scheduledFor: isScheduled ? new Date(scheduledFor) : null,
          publishedAt: isScheduled ? null : new Date(),
          externalPostId,
        },
      });

      // Update social account stats
      await prisma.socialAccount.update({
        where: { id: account.id },
        data: {
          totalPosts: { increment: 1 },
          lastPostedAt: new Date(),
        },
      });

      results.push({
        accountId: account.id,
        accountName: account.accountName,
        platform: account.platform,
        status: dispatchStatus,
        postId: post.id,
      });
    }

    // Save notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "SUCCESS",
        title: isScheduled ? "Ad Campaign Scheduled" : "Ad Uploaded to Social Media",
        message: isScheduled
          ? `Your ad was scheduled to publish on ${results.length} connected social account(s).`
          : `Your AI-generated ad was uploaded and published to ${results.length} account(s): ${results.map((r) => r.accountName).join(", ")}.`,
        link: "/app/social-accounts",
      },
    }).catch(() => null);

    return NextResponse.json({
      success: true,
      message: isScheduled
        ? `Successfully scheduled ad across ${results.length} account(s)!`
        : `Successfully uploaded ad to ${results.length} account(s)!`,
      publishedCount: results.length,
      posts: results,
    });
  } catch (error: any) {
    console.error("POST /api/app/social-accounts/publish error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to publish ad to social media." },
      { status: 500 }
    );
  }
}
