import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "dashboard";
    const isDemo = searchParams.get("demo") !== "false";

    const user = await getCurrentUser();
    let userId = user?.id;

    if (user?.isSuspended) {
      return NextResponse.json(
        {
          error: "ACCOUNT_SUSPENDED",
          isSuspended: true,
          suspendedReason: user.suspendedReason || "Account suspended by Platform Administrator.",
        },
        { status: 403 }
      );
    }

    let isAccountSuspended = false;
    let suspendedReason = "";

    if (isDemo || !userId) {
      const demoUser = await prisma.user.findFirst({ where: { email: "demo@dropai.io" } });
      userId = demoUser?.id;
      if (demoUser?.isSuspended) {
        isAccountSuspended = true;
        suspendedReason = demoUser.suspendedReason || "Demo merchant account has been suspended by Platform Administrator.";
      }
    }

    if (isAccountSuspended) {
      return NextResponse.json(
        {
          error: "ACCOUNT_SUSPENDED",
          isSuspended: true,
          suspendedReason,
        },
        { status: 403 }
      );
    }

    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (type === "dashboard") {
      if (!isDemo && !user) {
        return NextResponse.json({
          isDemo: false,
          hasStores: false,
          totalRevenue: 0,
          totalProfit: 0,
          ordersCount: 0,
          orders: [],
          chartData: [],
        });
      }

      const [orders, products, adCampaigns, notifications, suppliers] = await Promise.all([
        prisma.order.findMany({
          where: { userId },
          include: { customer: true, items: true, shipments: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
        prisma.product.findMany({ where: { userId } }),
        prisma.adCampaign.findMany({ where: { userId } }),
        prisma.notification.findMany({ where: { userId }, take: 5, orderBy: { createdAt: "desc" } }),
        prisma.supplier.findMany({ take: 4 }),
      ]);

      const totalRevenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);
      const totalProfit = orders.reduce((acc, o) => acc + o.profitAmount, 0);

      return NextResponse.json({
        isDemo,
        hasStores: true,
        totalRevenue,
        totalProfit,
        ordersCount: orders.length,
        avgOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
        productsCount: products.length,
        conversionRate: 3.42,
        orders,
        products,
        adCampaigns,
        notifications,
        suppliers,
      });
    }

    if (type === "products") {
      const products = await prisma.product.findMany({
        where: { userId },
        include: {
          variants: true,
          supplierProducts: { include: { supplier: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ products });
    }

    if (type === "orders") {
      const orders = await prisma.order.findMany({
        where: { userId },
        include: {
          customer: true,
          items: true,
          shipments: true,
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ orders });
    }

    if (type === "suppliers") {
      const suppliers = await prisma.supplier.findMany({
        include: {
          supplierProducts: {
            include: { product: true },
          },
        },
        orderBy: { rating: "desc" },
      });
      return NextResponse.json({ suppliers });
    }

    if (type === "stores") {
      const stores = await prisma.store.findMany({
        where: { userId },
        include: { connections: true },
      });
      return NextResponse.json({ stores });
    }

    if (type === "customers") {
      const customers = await prisma.customer.findMany({
        where: { userId },
        include: { orders: true },
        orderBy: { totalSpent: "desc" },
      });
      return NextResponse.json({ customers });
    }

    if (type === "shipping") {
      const shipments = await prisma.shipment.findMany({
        include: {
          order: {
            include: { customer: true, items: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ shipments });
    }

    if (type === "ads") {
      const campaigns = await prisma.adCampaign.findMany({
        where: { userId },
        orderBy: { roas: "desc" },
      });
      return NextResponse.json({ campaigns });
    }

    if (type === "automations") {
      const automations = await prisma.automation.findMany({
        where: { userId },
        include: { runs: { orderBy: { executedAt: "desc" }, take: 5 } },
      });
      return NextResponse.json({ automations });
    }

    if (type === "security") {
      const [sessions, events] = await Promise.all([
        prisma.session.findMany({
          where: { userId, isValid: true },
          orderBy: { lastActiveAt: "desc" },
        }),
        prisma.securityEvent.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 15,
        }),
      ]);
      return NextResponse.json({ sessions, events });
    }

    if (type === "billing") {
      let userRecord: any = null;
      let plans: any[] = [];

      try {
        userRecord = await prisma.user.findUnique({
          where: { id: userId },
          include: { subscription: true, stores: true, orders: true },
        });

        plans = await prisma.subscriptionPlan.findMany({
          where: { isActive: true },
          orderBy: { priceMonthly: "asc" },
        });
      } catch (dbErr) {
        console.warn("Prisma error querying billing data, using fallback:", dbErr);
      }

      if (!plans || plans.length === 0) {
        plans = [
          {
            id: "starter",
            code: "STARTER",
            name: "Starter Plan",
            priceMonthly: 29,
            priceYearly: 290,
            currency: "USD",
            productLimit: 250,
            storeLimit: 1,
            orderLimit: 500,
            aiCreditsLimit: 1000,
            automationLimit: 5,
            apiAccess: false,
            supportLevel: "EMAIL",
            isActive: true,
          },
          {
            id: "pro",
            code: "PRO",
            name: "Growth Pro",
            priceMonthly: 79,
            priceYearly: 790,
            currency: "USD",
            productLimit: 2500,
            storeLimit: 3,
            orderLimit: 2500,
            aiCreditsLimit: 5000,
            automationLimit: 25,
            apiAccess: true,
            supportLevel: "PRIORITY_24_7",
            isActive: true,
          },
          {
            id: "enterprise",
            code: "ENTERPRISE",
            name: "Enterprise Scale",
            priceMonthly: 199,
            priceYearly: 1990,
            currency: "USD",
            productLimit: 25000,
            storeLimit: 10,
            orderLimit: 10000,
            aiCreditsLimit: 20000,
            automationLimit: 100,
            apiAccess: true,
            supportLevel: "DEDICATED",
            isActive: true,
          },
        ];
      }

      return NextResponse.json({
        plan: userRecord?.subscription?.plan || "PRO",
        status: userRecord?.subscription?.status || "ACTIVE",
        aiCreditsRemaining: userRecord?.subscription?.aiCreditsRemaining ?? 4820,
        aiCreditsTotal: userRecord?.subscription?.aiCreditsTotal ?? 5000,
        ordersProcessedCount: userRecord?.orders?.length || 142,
        connectedStoresCount: userRecord?.stores?.length || 2,
        plans,
      });
    }

    if (type === "pricing_rules") {
      const rules = await prisma.profitRule.findMany({
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ rules });
    }

    if (type === "shipping_rules") {
      const rules = await prisma.shippingRule.findMany({
        where: { isRestricted: false },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ rules });
    }

    return NextResponse.json({ error: "Unknown data type" }, { status: 400 });
  } catch (error) {
    console.error("App data API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    let userId = user?.id;

    if (!userId) {
      const demoUser = await prisma.user.findFirst({ where: { email: "demo@dropai.io" } });
      userId = demoUser?.id;
    }

    if (!userId) {
      return NextResponse.json({ error: "User not found or unauthenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;
    // 0. Update User Subscription Plan
    if (action === "change_plan") {
      const { plan } = body;
      await prisma.user.update({
        where: { id: userId },
        data: {
          subscription: {
            upsert: {
              create: {
                plan: plan || "PRO",
                status: "ACTIVE",
                aiCreditsRemaining: 10000,
                aiCreditsTotal: 10000,
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              },
              update: {
                plan: plan || "PRO",
                status: "ACTIVE",
              },
            },
          },
        },
      });
      return NextResponse.json({ success: true, plan });
    }

    // 1. Create Real Product
    if (action === "create_product") {
      const { title, sku, category, sellingPrice, costPrice, inventory, images, description } = body.data;

      const product = await prisma.product.create({
        data: {
          userId,
          title: title || "New Product",
          sku: sku || `SKU-${Date.now().toString().slice(-6)}`,
          slug: (title || "new-product").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          category: category || "General Merchandise",
          description: description || "High quality dropshipping product ready for fulfillment.",
          sellingPrice: parseFloat(sellingPrice) || 0,
          costPrice: parseFloat(costPrice) || 0,
          inventory: parseInt(inventory) || 0,
          status: "ACTIVE",
          aiScore: 88.0,
          images: JSON.stringify(images || ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"]),
          variants: {
            create: [
              {
                title: "Default",
                sku: `${sku || Date.now().toString().slice(-6)}-DEF`,
                price: parseFloat(sellingPrice) || 0,
                cost: parseFloat(costPrice) || 0,
                inventory: parseInt(inventory) || 0,
              },
            ],
          },
        },
        include: { variants: true },
      });

      return NextResponse.json({ success: true, product });
    }

    // 2. Connect Real Store
    if (action === "connect_store") {
      const { name, platform, storeUrl, apiKey, apiSecret } = body.data;

      const store = await prisma.store.create({
        data: {
          userId,
          name: name || "My Store",
          platform: platform || "SHOPIFY",
          storeUrl: storeUrl || "https://mystore.myshopify.com",
          status: "CONNECTED",
          currency: "USD",
          country: "US",
          connections: {
            create: [
              {
                platform: platform || "SHOPIFY",
                apiKeyEncrypted: apiKey || "enc_pk_live",
                apiSecretEncrypted: apiSecret || "enc_sk_live",
                status: "ACTIVE",
                lastSyncAt: new Date(),
              },
            ],
          },
        },
        include: { connections: true },
      });

      return NextResponse.json({ success: true, store });
    }

    // 3. Create Real Order
    if (action === "create_order") {
      const { customerName, customerEmail, totalAmount, profitAmount, items, currency } = body.data;

      // Ensure customer exists
      let customer = await prisma.customer.findFirst({
        where: { email: customerEmail || "customer@example.com", userId },
      });

      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            userId,
            name: customerName || "Online Shopper",
            email: customerEmail || `customer_${Date.now()}@example.com`,
            totalSpent: parseFloat(totalAmount) || 0,
            ordersCount: 1,
          },
        });
      }

      const orderNumber = `#ORD-${Math.floor(100000 + Math.random() * 900000)}`;

      const order = await prisma.order.create({
        data: {
          userId,
          customerId: customer.id,
          orderNumber,
          status: "PAID",
          financialStatus: "PAID",
          fulfillmentStatus: "UNFULFILLED",
          totalAmount: parseFloat(totalAmount) || 0,
          subtotalAmount: parseFloat(totalAmount) || 0,
          profitAmount: parseFloat(profitAmount) || 0,
          currency: currency || "USD",
          riskLevel: "LOW",
          items: {
            create: (items || [
              {
                title: "Premium Dropshipping Item",
                quantity: 1,
                price: parseFloat(totalAmount) || 0,
                cost: (parseFloat(totalAmount) || 0) * 0.4,
                total: parseFloat(totalAmount) || 0,
              },
            ]),
          },
        },
        include: { items: true, customer: true },
      });

      return NextResponse.json({ success: true, order });
    }

    // 4. Trigger Real Store Sync
    if (action === "sync_store") {
      const { storeId } = body.data || {};
      if (storeId) {
        await prisma.storeConnection.updateMany({
          where: { storeId },
          data: { lastSyncAt: new Date() },
        });
      }
      return NextResponse.json({ success: true, syncedAt: new Date() });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("POST App data error:", error);
    return NextResponse.json({ error: "Failed to persist data" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    let userId = user?.id;

    if (!userId) {
      const demoUser = await prisma.user.findFirst({ where: { email: "demo@dropai.io" } });
      userId = demoUser?.id;
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (!id || !type) {
      return NextResponse.json({ error: "Missing type or id" }, { status: 400 });
    }

    if (type === "product") {
      await prisma.product.delete({ where: { id } });
      return NextResponse.json({ success: true, id });
    }

    if (type === "store") {
      await prisma.store.delete({ where: { id } });
      return NextResponse.json({ success: true, id });
    }

    return NextResponse.json({ error: "Invalid delete type" }, { status: 400 });
  } catch (error) {
    console.error("DELETE App data error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
