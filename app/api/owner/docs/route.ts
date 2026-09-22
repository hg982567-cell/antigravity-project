import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentOwner } from "@/lib/auth/owner-session";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

async function verifyOwnerAccess() {
  const owner = await getCurrentOwner().catch(() => null);
  if (owner) return true;
  const user = await getCurrentUser().catch(() => null);
  return Boolean(user && user.role === "OWNER");
}

export async function GET(req: NextRequest) {
  try {
    const isOwner = await verifyOwnerAccess();
    if (!isOwner) {
      return NextResponse.json(
        { error: "Access Denied: Owner Authorization Required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.trim();

    const where: any = {};
    if (category) where.category = category;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { tags: { contains: search, mode: "insensitive" } },
      ];
    }

    const articles = await prisma.documentationArticle.findMany({
      where,
      orderBy: [
        { category: "asc" },
        { sortOrder: "asc" },
        { updatedAt: "desc" },
      ],
      include: {
        _count: {
          select: { feedbacks: true },
        },
      },
    });

    const stats = {
      total: await prisma.documentationArticle.count(),
      published: await prisma.documentationArticle.count({ where: { status: "PUBLISHED" } }),
      drafts: await prisma.documentationArticle.count({ where: { status: "DRAFT" } }),
      archived: await prisma.documentationArticle.count({ where: { status: "ARCHIVED" } }),
      adminOnly: await prisma.documentationArticle.count({ where: { visibility: "ADMIN_ONLY" } }),
    };

    return NextResponse.json({
      success: true,
      stats,
      articles,
    });
  } catch (error: any) {
    console.error("GET /api/owner/docs error:", error);
    return NextResponse.json({ error: "Failed to fetch articles." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const isOwner = await verifyOwnerAccess();
    if (!isOwner) {
      return NextResponse.json(
        { error: "Access Denied: Owner Authorization Required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      slug,
      description,
      content,
      category,
      subcategory,
      tags,
      status,
      visibility,
      readingTime,
      featured,
      sortOrder,
    } = body;

    if (!title || !slug || !content || !category) {
      return NextResponse.json(
        { error: "Title, slug, content, and category are required." },
        { status: 400 }
      );
    }

    const cleanSlug = String(slug).trim().toLowerCase().replace(/[^a-z0-9-_]/g, "-");

    const existing = await prisma.documentationArticle.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An article with this slug already exists." },
        { status: 409 }
      );
    }

    const article = await prisma.documentationArticle.create({
      data: {
        slug: cleanSlug,
        title: title.trim(),
        description: description?.trim() || "",
        content,
        category: category.trim(),
        subcategory: subcategory?.trim() || null,
        tags: Array.isArray(tags) ? tags.join(", ") : String(tags || ""),
        status: status || "PUBLISHED",
        visibility: visibility || "PUBLIC",
        readingTime: readingTime || "5 min read",
        featured: Boolean(featured),
        sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
        author: "DropAI Engineering",
      },
    });

    return NextResponse.json({ success: true, article });
  } catch (error: any) {
    console.error("POST /api/owner/docs error:", error);
    return NextResponse.json({ error: "Failed to create article." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const isOwner = await verifyOwnerAccess();
    if (!isOwner) {
      return NextResponse.json(
        { error: "Access Denied: Owner Authorization Required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      id,
      title,
      slug,
      description,
      content,
      category,
      subcategory,
      tags,
      status,
      visibility,
      readingTime,
      featured,
      sortOrder,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Article ID is required." }, { status: 400 });
    }

    const cleanSlug = slug ? String(slug).trim().toLowerCase().replace(/[^a-z0-9-_]/g, "-") : undefined;

    const article = await prisma.documentationArticle.update({
      where: { id },
      data: {
        title: title?.trim(),
        slug: cleanSlug,
        description: description?.trim(),
        content,
        category: category?.trim(),
        subcategory: subcategory?.trim() || null,
        tags: Array.isArray(tags) ? tags.join(", ") : (tags ? String(tags) : undefined),
        status,
        visibility,
        readingTime,
        featured,
        sortOrder: typeof sortOrder === "number" ? sortOrder : undefined,
      },
    });

    return NextResponse.json({ success: true, article });
  } catch (error: any) {
    console.error("PUT /api/owner/docs error:", error);
    return NextResponse.json({ error: "Failed to update article." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const isOwner = await verifyOwnerAccess();
    if (!isOwner) {
      return NextResponse.json(
        { error: "Access Denied: Owner Authorization Required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Article ID is required." }, { status: 400 });
    }

    await prisma.documentationArticle.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Article permanently deleted." });
  } catch (error: any) {
    console.error("DELETE /api/owner/docs error:", error);
    return NextResponse.json({ error: "Failed to delete article." }, { status: 500 });
  }
}
