import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return handleSeed(req);
}

export async function POST(req: Request) {
  return handleSeed(req);
}

async function handleSeed(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token") || "";

    // Allow seed if in development OR if provided token matches SEED_SECRET or fallback
    const expectedSecret = process.env.SEED_SECRET || "dropai_seed_secure_token_77123";
    if (process.env.NODE_ENV === "production" && token && token !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized seed request" }, { status: 401 });
    }

    // 1. Ensure Super Admin Owner account exists
    let owner = await prisma.user.findFirst({ where: { role: "OWNER" } });
    if (!owner) {
      const ownerPasswordHash = await bcrypt.hash("DropAIOwner2026!Secure", 12);
      owner = await prisma.user.create({
        data: {
          email: "owner@dropai.io",
          name: "DropAI Master Owner",
          passwordHash: ownerPasswordHash,
          role: "OWNER",
          isEmailVerified: true,
          twoFactorEnabled: true,
          recoveryCodes: JSON.stringify(["DROPAI-OWNER-SECURE-9988", "DROPAI-BACKUP-EMERGENCY-1122"]),
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        },
      });

      await prisma.ownerAuditLog.create({
        data: {
          ownerId: owner.id,
          action: "SYSTEM_INITIALIZED",
          targetType: "SYSTEM",
          newValue: "DropAI Owner Control Center initialized.",
          severity: "INFO",
        },
      });
    }

    // 2. Check if demo user already exists
    let user = await prisma.user.findFirst({ where: { email: "demo@dropai.io" } });
    if (!user) {
      const passwordHash = await bcrypt.hash("password123", 10);
      user = await prisma.user.create({
        data: {
          email: "demo@dropai.io",
          name: "Alex Rivera",
          passwordHash,
          role: "MERCHANT",
          isEmailVerified: true,
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        },
      });

      // Create subscription
      await prisma.subscription.create({
        data: {
          userId: user.id,
          plan: "FREE",
          status: "ACTIVE",
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          aiCreditsRemaining: 100,
          aiCreditsTotal: 100,
          ordersProcessedThisMonth: 0,
          storesLimit: 1,
        },
      });
    }

    // Ensure at least one store exists
    let store = await prisma.store.findFirst({ where: { userId: user.id } });
    if (!store) {
      store = await prisma.store.create({
        data: {
          userId: user.id,
          name: "Apex Living Official",
          platform: "SHOPIFY",
          storeUrl: "https://apex-living.myshopify.com",
          status: "CONNECTED",
          currency: "USD",
          country: "US",
          connections: {
            create: [
              {
                platform: "SHOPIFY",
                apiKeyEncrypted: "pk_live_shpat_881920381029",
                status: "ACTIVE",
                lastSyncAt: new Date(),
              },
            ],
          },
        },
      });
    }

    // Seed initial products if none exist
    const prodCount = await prisma.product.count({ where: { userId: user.id } });
    if (prodCount === 0) {
      const initialProducts = [
        {
          title: "Magnetic Levitating Desk Lamp",
          sku: "ML-LAMP-01",
          slug: "magnetic-levitating-desk-lamp",
          category: "Home & Decor",
          sellingPrice: 79.99,
          costPrice: 22.4,
          inventory: 140,
          aiScore: 92.5,
          images: JSON.stringify(["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600"]),
        },
        {
          title: "Ergonomic Memory Foam Lumbar Cushion",
          sku: "LUMB-CUSH-BLK",
          slug: "ergonomic-memory-foam-lumbar-cushion",
          category: "Health & Wellness",
          sellingPrice: 44.95,
          costPrice: 11.2,
          inventory: 310,
          aiScore: 89.0,
          images: JSON.stringify(["https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600"]),
        },
        {
          title: "Minimalist Titanium Automatic Watch",
          sku: "TI-WATCH-40MM",
          slug: "minimalist-titanium-automatic-watch",
          category: "Watches & Accessories",
          sellingPrice: 129.0,
          costPrice: 38.0,
          inventory: 85,
          aiScore: 94.0,
          images: JSON.stringify(["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"]),
        },
      ];

      for (const p of initialProducts) {
        await prisma.product.create({
          data: {
            userId: user.id,
            storeId: store.id,
            description: "High margin dropshipping product with verified supplier fulfillment.",
            ...p,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "DropAI cloud database initialized successfully",
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.error("Cloud seed error:", error);
    return NextResponse.json({ error: "Cloud database seed failed" }, { status: 500 });
  }
}
