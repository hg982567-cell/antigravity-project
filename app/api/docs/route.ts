import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { getCurrentOwner } from "@/lib/auth/owner-session";

export const dynamic = "force-dynamic";

const CATEGORIES_CONFIG = [
  { id: "getting-started", name: "Getting Started", icon: "Rocket", description: "Essential guides for launching, configuring, and connecting your DropAI store." },
  { id: "product-research-ai", name: "Product Research & AI", icon: "Search", description: "Discover high-margin winning products, run AI market analysis, and generate high-converting ads." },
  { id: "shopify-integrations", name: "Shopify & Store Integrations", icon: "Store", description: "Connect official store bridges using OAuth PKCE, manage webhooks, and automate catalog sync." },
  { id: "automations-fulfillment", name: "Automations & Fulfillment", icon: "Zap", description: "Configure autonomous supplier fallback, carrier tracking sync, and fraud hold thresholds." },
  { id: "orders", name: "Orders & Lifecycle", icon: "ShoppingCart", description: "Understand order state machines, timelines, carrier fulfillment, and customer return workflows." },
  { id: "payments-currency", name: "Payments, Currency & Profit", icon: "DollarSign", description: "Master base vs display currencies, live exchange rates, fee deductions, and net profit margins." },
  { id: "security-account", name: "Security & Account", icon: "Shield", description: "Secure your account with TOTP 2FA, review active device sessions, and understand data isolation." },
  { id: "troubleshooting", name: "Troubleshooting Center", icon: "HelpCircle", description: "Step-by-step diagnostic workflows for Shopify connections, missing syncs, webhooks, and auth." },
  { id: "developer-api", name: "Developer & Technical API", icon: "Code", description: "Technical documentation covering REST APIs, webhook HMAC signatures, and multi-tenant design." },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const tag = searchParams.get("tag")?.trim() || "";
    const featuredOnly = searchParams.get("featured") === "true";

    // Determine authorization tier
    const user = await getCurrentUser().catch(() => null);
    const owner = await getCurrentOwner().catch(() => null);
    const isAuthenticated = Boolean(user || owner);
    const isOwner = Boolean(owner);

    // Permitted visibilities: strictly merchant & customer-facing guides
    const allowedVisibilities: string[] = isAuthenticated
      ? ["PUBLIC", "AUTHENTICATED"]
      : ["PUBLIC"];

    // Build Prisma query filter - never show admin-system on public help center
    const whereClause: any = {
      status: "PUBLISHED",
      visibility: { in: allowedVisibilities },
      category: { not: "admin-system" },
    };

    if (category) {
      whereClause.category = category;
    }

    if (featuredOnly) {
      whereClause.featured = true;
    }

    if (tag) {
      whereClause.tags = {
        contains: tag,
        mode: "insensitive",
      };
    }

    if (query) {
      whereClause.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { tags: { contains: query, mode: "insensitive" } },
        { category: { contains: query, mode: "insensitive" } },
        { content: { contains: query, mode: "insensitive" } },
      ];
    }

    // Query matching articles
    const articles = await prisma.documentationArticle.findMany({
      where: whereClause,
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        category: true,
        subcategory: true,
        tags: true,
        readingTime: true,
        featured: true,
        visibility: true,
        sortOrder: true,
        helpfulYes: true,
        helpfulNo: true,
        version: true,
        updatedAt: true,
      },
      orderBy: [
        { sortOrder: "asc" },
        { updatedAt: "desc" },
      ],
    });

    // Compute category counts
    const categoryCounts: Record<string, number> = {};
    const allCounts = await prisma.documentationArticle.groupBy({
      by: ["category"],
      where: {
        status: "PUBLISHED",
        visibility: { in: allowedVisibilities },
      },
      _count: { id: true },
    });

    allCounts.forEach((c) => {
      categoryCounts[c.category] = c._count.id;
    });

    const enrichedCategories = CATEGORIES_CONFIG.map((cat) => ({
      ...cat,
      articleCount: categoryCounts[cat.id] || 0,
      accessible: cat.id === "developer-api" ? isAuthenticated : true,
    }));

    // Popular articles (featured or highest positive feedback, strictly customer-facing)
    const popularArticles = articles
      .filter((a) => (a.featured || a.helpfulYes > 0) && a.visibility !== "ADMIN_ONLY")
      .slice(0, 6);

    // Recently updated articles (strictly customer-facing)
    const recentArticles = [...articles]
      .filter((a) => a.visibility !== "ADMIN_ONLY")
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      query,
      category,
      total: articles.length,
      articles,
      categories: enrichedCategories,
      popularArticles,
      recentArticles,
      authStatus: {
        isAuthenticated,
        isOwner,
        role: owner ? "OWNER" : (user?.role || "GUEST"),
      },
    });
  } catch (error: any) {
    console.error("GET /api/docs error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load documentation articles." },
      { status: 500 }
    );
  }
}
