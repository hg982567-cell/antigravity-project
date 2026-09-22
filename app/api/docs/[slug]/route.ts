import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { getCurrentOwner } from "@/lib/auth/owner-session";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug?.trim();
    if (!slug) {
      return NextResponse.json({ error: "Slug is required." }, { status: 400 });
    }

    // Determine caller authorization
    const user = await getCurrentUser().catch(() => null);
    const owner = await getCurrentOwner().catch(() => null);

    const isOwner = Boolean(owner || user?.role === "OWNER");
    const isAuthenticated = Boolean(user || owner);

    // Look up article
    const article = await prisma.documentationArticle.findUnique({
      where: { slug },
    });

    if (!article || article.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Article not found or currently unavailable." },
        { status: 404 }
      );
    }

    // Enforce Visibility Guard
    if (article.visibility === "AUTHENTICATED" && !isAuthenticated) {
      return NextResponse.json(
        {
          error: "Authentication required to view developer documentation.",
          requiresAuth: true,
          visibility: "AUTHENTICATED",
        },
        { status: 401 }
      );
    }

    if (article.visibility === "ADMIN_ONLY" && !isOwner) {
      return NextResponse.json(
        {
          error: "Access Denied: Platform Owner privileges required to view internal administration guides.",
          requiresOwner: true,
          visibility: "ADMIN_ONLY",
        },
        { status: 403 }
      );
    }

    // Permitted visibility scope for surrounding articles
    let allowedVisibilities: string[] = ["PUBLIC"];
    if (isOwner) {
      allowedVisibilities = ["PUBLIC", "AUTHENTICATED", "ADMIN_ONLY"];
    } else if (isAuthenticated) {
      allowedVisibilities = ["PUBLIC", "AUTHENTICATED"];
    }

    // Fetch sibling articles in the same category for navigation & TOC
    const categoryArticles = await prisma.documentationArticle.findMany({
      where: {
        category: article.category,
        status: "PUBLISHED",
        visibility: { in: allowedVisibilities },
      },
      select: {
        id: true,
        slug: true,
        title: true,
        readingTime: true,
        sortOrder: true,
      },
      orderBy: { sortOrder: "asc" },
    });

    const currentIndex = categoryArticles.findIndex((a) => a.slug === article.slug);
    const prevArticle = currentIndex > 0 ? categoryArticles[currentIndex - 1] : null;
    const nextArticle =
      currentIndex >= 0 && currentIndex < categoryArticles.length - 1
        ? categoryArticles[currentIndex + 1]
        : null;

    // Related articles (from other categories or matching tags)
    const relatedArticles = await prisma.documentationArticle.findMany({
      where: {
        slug: { not: article.slug },
        status: "PUBLISHED",
        visibility: { in: allowedVisibilities },
        OR: [
          { category: article.category },
          { tags: { contains: article.category } },
        ],
      },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        category: true,
        readingTime: true,
      },
      take: 3,
    });

    return NextResponse.json({
      success: true,
      article,
      prevArticle,
      nextArticle,
      categoryArticles,
      relatedArticles,
      authStatus: {
        isAuthenticated,
        isOwner,
      },
    });
  } catch (error: any) {
    console.error("GET /api/docs/[slug] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch documentation article." },
      { status: 500 }
    );
  }
}
