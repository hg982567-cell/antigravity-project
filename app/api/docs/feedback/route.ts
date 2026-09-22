import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { getClientIp, checkRateLimit } from "@/lib/security/rate-limiter";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    // Rate limit: 20 feedback submissions per minute
    const rateCheck = checkRateLimit(`docs_feedback_${ip}`, { max: 20, windowMs: 60 * 1000 });
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many feedback submissions. Please slow down." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { articleSlug, isHelpful, comment } = body;

    if (!articleSlug || typeof isHelpful !== "boolean") {
      return NextResponse.json(
        { error: "articleSlug and isHelpful (boolean) are required." },
        { status: 400 }
      );
    }

    const article = await prisma.documentationArticle.findUnique({
      where: { slug: articleSlug },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found." }, { status: 404 });
    }

    const user = await getCurrentUser().catch(() => null);

    // Record feedback in database
    await prisma.articleFeedback.create({
      data: {
        articleId: article.id,
        userId: user?.id || null,
        isHelpful,
        comment: comment ? String(comment).slice(0, 500) : null,
        ipAddress: ip,
      },
    });

    // Increment article tally
    const updatedArticle = await prisma.documentationArticle.update({
      where: { id: article.id },
      data: {
        helpfulYes: isHelpful ? { increment: 1 } : undefined,
        helpfulNo: !isHelpful ? { increment: 1 } : undefined,
      },
      select: {
        id: true,
        helpfulYes: true,
        helpfulNo: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Thank you for your feedback! It helps us improve our documentation.",
      stats: {
        helpfulYes: updatedArticle.helpfulYes,
        helpfulNo: updatedArticle.helpfulNo,
      },
    });
  } catch (error: any) {
    console.error("POST /api/docs/feedback error:", error);
    return NextResponse.json(
      { error: "Failed to record article feedback." },
      { status: 500 }
    );
  }
}
