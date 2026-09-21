const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function seedStoreData() {
  console.log("🌱 Seeding Demo Store Data for Neon PostgreSQL...");

  // 1. Get or create demo user
  let user = await prisma.user.findUnique({ where: { email: "demo@dropai.io" } });
  if (!user) {
    const passwordHash = await bcrypt.hash("password123", 10);
    user = await prisma.user.create({
      data: {
        email: "demo@dropai.io",
        name: "Alex Rivera",
        passwordHash,
        role: "MERCHANT",
        status: "ACTIVE",
        isEmailVerified: true,
      },
    });
  }

  // 2. Subscription
  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {
      plan: "PRO",
      status: "ACTIVE",
      aiCreditsRemaining: 4820,
      aiCreditsTotal: 5000,
      ordersProcessedThisMonth: 142,
      storesLimit: 5,
    },
    create: {
      userId: user.id,
      plan: "PRO",
      status: "ACTIVE",
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      aiCreditsRemaining: 4820,
      aiCreditsTotal: 5000,
      ordersProcessedThisMonth: 142,
      storesLimit: 5,
    },
  });

  // Check if stores already exist
  const existingStores = await prisma.store.count({ where: { userId: user.id } });
  if (existingStores > 0) {
    console.log("Demo stores already populated.");
    return;
  }

  // 3. Stores
  const store1 = await prisma.store.create({
    data: {
      userId: user.id,
      name: "Apex Living USA",
      platform: "SHOPIFY",
      storeUrl: "https://apex-living-usa.myshopify.com",
      status: "CONNECTED",
      currency: "USD",
      country: "US",
    },
  });

  const store2 = await prisma.store.create({
    data: {
      userId: user.id,
      name: "Nordic Haven EU",
      platform: "WOOCOMMERCE",
      storeUrl: "https://nordichaven.eu",
      status: "CONNECTED",
      currency: "EUR",
      country: "DE",
    },
  });

  // Store Connections
  await prisma.storeConnection.create({
    data: {
      storeId: store1.id,
      platform: "SHOPIFY",
      apiKeyEncrypted: "shpa_live_key_99381",
      apiSecretEncrypted: "shpss_secret_39102",
      accessTokenEncrypted: "shpat_live_access_token_8849",
      webhookSecret: "whsec_shopify_884920",
      scopes: "read_products,write_products,read_orders,write_orders,read_inventory",
      lastSyncAt: new Date(),
      status: "ACTIVE",
    },
  });

  // 4. Suppliers
  const sup1 = await prisma.supplier.create({
    data: {
      name: "CJ Dropshipping Global",
      platform: "CJ_DROPSHIPPING",
      rating: 4.9,
      fulfillmentSpeedDays: 6,
      returnPolicy: "30-day replacement on damaged items",
      country: "CN",
      websiteUrl: "https://cjdropshipping.com",
      contactEmail: "support@cjdropshipping.com",
      reliabilityScore: 98.2,
      totalOrdersFulfilled: 14200,
    },
  });

  const sup2 = await prisma.supplier.create({
    data: {
      name: "Zendrop US Direct",
      platform: "ZENDROP",
      rating: 4.8,
      fulfillmentSpeedDays: 4,
      returnPolicy: "Custom automated returns portal",
      country: "US",
      websiteUrl: "https://zendrop.com",
      contactEmail: "partners@zendrop.com",
      reliabilityScore: 96.5,
      totalOrdersFulfilled: 8900,
    },
  });

  const sup3 = await prisma.supplier.create({
    data: {
      name: "Spocket Verified EU",
      platform: "SPOCKET",
      rating: 4.7,
      fulfillmentSpeedDays: 5,
      returnPolicy: "14-day European return guarantee",
      country: "DE",
      websiteUrl: "https://spocket.co",
      contactEmail: "suppliers@spocket.co",
      reliabilityScore: 94.0,
      totalOrdersFulfilled: 5120,
    },
  });

  const sup4 = await prisma.supplier.create({
    data: {
      name: "AliExpress Top-Brand Hub",
      platform: "ALIEXPRESS",
      rating: 4.6,
      fulfillmentSpeedDays: 8,
      returnPolicy: "Standard buyer protection",
      country: "CN",
      websiteUrl: "https://aliexpress.com",
      contactEmail: "merchant-service@aliexpress.com",
      reliabilityScore: 91.8,
      totalOrdersFulfilled: 28400,
    },
  });

  // 5. Products
  const productsData = [
    {
      title: "Ultra-Quiet Neck Fan 360° Airflow",
      slug: "ultra-quiet-neck-fan-360",
      description: "Bladeless portable personal neck fan with 3 turbine speeds, 4000mAh rechargeable USB-C battery, and ultra-lightweight design.",
      sku: "DROPAI-NF-001",
      category: "Personal Electronics",
      status: "ACTIVE",
      sellingPrice: 42.99,
      costPrice: 11.50,
      compareAtPrice: 69.99,
      inventory: 340,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80"
      ]),
      tags: "summer, trending, gadget, portable, electronics",
      countryTarget: "US",
      aiScore: 94.5,
      demandScore: 96.0,
      competitionScore: 35.0,
      marginScore: 88.0,
      trendScore: 97.0,
      supplierId: sup1.id,
    },
    {
      title: "Orthopedic Memory Foam Lumbar Cushion",
      slug: "orthopedic-memory-foam-lumbar-cushion",
      description: "Ergonomic back support pillow for home office desk chairs and car seats. Contoured high-density memory foam with breathable 3D mesh.",
      sku: "DROPAI-LUM-002",
      category: "Home & Office",
      status: "ACTIVE",
      sellingPrice: 49.95,
      costPrice: 13.80,
      compareAtPrice: 79.99,
      inventory: 215,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80"
      ]),
      tags: "ergonomic, office, posture, health",
      countryTarget: "US",
      aiScore: 91.2,
      demandScore: 89.0,
      competitionScore: 40.0,
      marginScore: 86.0,
      trendScore: 92.0,
      supplierId: sup2.id,
    },
    {
      title: "Aura Sunset RGB Ambient Projection Lamp",
      slug: "aura-sunset-rgb-projection-lamp",
      description: "16-color rotating sunset projection lamp with smartphone app control and 360-degree aluminum alloy gimbal. Viral TikTok sensation.",
      sku: "DROPAI-SUN-003",
      category: "Home Decor",
      status: "ACTIVE",
      sellingPrice: 34.99,
      costPrice: 7.20,
      compareAtPrice: 54.99,
      inventory: 480,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80"
      ]),
      tags: "lighting, rgb, aesthetic, room decor",
      countryTarget: "US",
      aiScore: 88.5,
      demandScore: 87.0,
      competitionScore: 55.0,
      marginScore: 92.0,
      trendScore: 89.0,
      supplierId: sup1.id,
    },
    {
      title: "Magnetic Wireless 3-in-1 Fast Charger",
      slug: "magnetic-wireless-3-in-1-fast-charger",
      description: "Foldable travel charging station for iPhone, Apple Watch, and AirPods. 15W Qi-certified fast magnetic alignment.",
      sku: "DROPAI-CHG-004",
      category: "Phone Accessories",
      status: "ACTIVE",
      sellingPrice: 59.99,
      costPrice: 16.40,
      compareAtPrice: 89.99,
      inventory: 190,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80"
      ]),
      tags: "charger, wireless, apple, tech",
      countryTarget: "US",
      aiScore: 92.8,
      demandScore: 94.0,
      competitionScore: 48.0,
      marginScore: 85.0,
      trendScore: 95.0,
      supplierId: sup2.id,
    },
    {
      title: "Self-Cleaning Pet Deshedding Steam Brush",
      slug: "self-cleaning-pet-deshedding-steam-brush",
      description: "Nano-mist pet steam groomer that reduces flying hair while massaging cats and dogs. One-click hair ejection button.",
      sku: "DROPAI-PET-005",
      category: "Pet Supplies",
      status: "ACTIVE",
      sellingPrice: 28.50,
      costPrice: 5.90,
      compareAtPrice: 45.00,
      inventory: 620,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&auto=format&fit=crop&q=80"
      ]),
      tags: "pets, grooming, viral, dogs, cats",
      countryTarget: "US",
      aiScore: 96.0,
      demandScore: 98.0,
      competitionScore: 32.0,
      marginScore: 93.0,
      trendScore: 98.0,
      supplierId: sup1.id,
    },
    {
      title: "Stainless Steel Acoustic Smart Water Bottle",
      slug: "smart-uv-insulated-water-bottle",
      description: "Vacuum insulated 750ml flask with built-in Bluetooth speaker, hourly hydration chime reminders, and LCD temperature lid.",
      sku: "DROPAI-BOT-006",
      category: "Fitness & Outdoor",
      status: "ACTIVE",
      sellingPrice: 54.00,
      costPrice: 17.20,
      compareAtPrice: 85.00,
      inventory: 130,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80"
      ]),
      tags: "hydration, fitness, tech, travel",
      countryTarget: "US",
      aiScore: 86.4,
      demandScore: 84.0,
      competitionScore: 45.0,
      marginScore: 82.0,
      trendScore: 88.0,
      supplierId: sup3.id,
    }
  ];

  const createdProducts = [];
  for (const p of productsData) {
    const product = await prisma.product.create({
      data: {
        userId: user.id,
        storeId: store1.id,
        title: p.title,
        slug: p.slug,
        description: p.description,
        sku: p.sku,
        category: p.category,
        status: p.status,
        sellingPrice: p.sellingPrice,
        costPrice: p.costPrice,
        compareAtPrice: p.compareAtPrice,
        inventory: p.inventory,
        images: p.images,
        tags: p.tags,
        countryTarget: p.countryTarget,
        aiScore: p.aiScore,
        demandScore: p.demandScore,
        competitionScore: p.competitionScore,
        marginScore: p.marginScore,
        trendScore: p.trendScore,
      },
    });

    const variant = await prisma.productVariant.create({
      data: {
        productId: product.id,
        title: "Standard / Default",
        sku: `${product.sku}-STD`,
        price: product.sellingPrice,
        cost: product.costPrice,
        inventory: product.inventory,
        options: JSON.stringify({ Edition: "Standard" }),
      },
    });

    await prisma.supplierProduct.create({
      data: {
        supplierId: p.supplierId,
        productId: product.id,
        unitCost: product.costPrice,
        shippingCost: 3.50,
        stockQuantity: product.inventory * 5,
        deliveryDays: 6,
      },
    });

    createdProducts.push({ ...product, variantId: variant.id });
  }

  // 6. Customers
  const customersData = [
    { name: "Sarah Jenkins", email: "sarah.j@gmail.com", country: "US", city: "Austin, TX", totalSpent: 184.97, ordersCount: 3, riskScore: 2.0 },
    { name: "David Chen", email: "david.chen@outlook.com", country: "US", city: "Seattle, WA", totalSpent: 99.95, ordersCount: 2, riskScore: 4.0 },
    { name: "Emma Watson", email: "emma.w@btinternet.co.uk", country: "GB", city: "London", totalSpent: 128.98, ordersCount: 2, riskScore: 1.5 },
    { name: "Marco Rossi", email: "marco.rossi@libero.it", country: "IT", city: "Milan", totalSpent: 42.99, ordersCount: 1, riskScore: 3.0 },
    { name: "Chloe Dupont", email: "chloe.dupont@orange.fr", country: "FR", city: "Paris", totalSpent: 87.94, ordersCount: 2, riskScore: 5.0 },
    { name: "Liam O'Connor", email: "liam.oc@eircom.net", country: "IE", city: "Dublin", totalSpent: 59.99, ordersCount: 1, riskScore: 2.5 },
  ];

  const createdCustomers = [];
  for (const c of customersData) {
    const cust = await prisma.customer.create({
      data: {
        userId: user.id,
        storeId: store1.id,
        name: c.name,
        email: c.email,
        country: c.country,
        city: c.city,
        totalSpent: c.totalSpent,
        ordersCount: c.ordersCount,
        riskScore: c.riskScore,
      },
    });
    createdCustomers.push(cust);
  }

  // 7. Orders & Shipments
  const sampleOrders = [
    {
      orderNumber: "ORD-1042",
      customerIdx: 0,
      productIdx: 0,
      quantity: 1,
      status: "PAID",
      fulfillmentStatus: "DELIVERED",
      daysAgo: 1,
      carrier: "USPS",
      trackingNumber: "9400111899223199847101",
      shipmentStatus: "DELIVERED",
    },
    {
      orderNumber: "ORD-1041",
      customerIdx: 1,
      productIdx: 1,
      quantity: 2,
      status: "PAID",
      fulfillmentStatus: "SHIPPED",
      daysAgo: 2,
      carrier: "USPS",
      trackingNumber: "9400111899223199847102",
      shipmentStatus: "IN_TRANSIT",
    },
    {
      orderNumber: "ORD-1040",
      customerIdx: 2,
      productIdx: 3,
      quantity: 1,
      status: "PAID",
      fulfillmentStatus: "PROCESSING",
      daysAgo: 3,
      carrier: "DHL",
      trackingNumber: "DHL9982314992",
      shipmentStatus: "LABEL_CREATED",
    },
    {
      orderNumber: "ORD-1039",
      customerIdx: 3,
      productIdx: 4,
      quantity: 1,
      status: "PAID",
      fulfillmentStatus: "UNFULFILLED",
      daysAgo: 4,
      carrier: "YUNEXPRESS",
      trackingNumber: "YT24018899214",
      shipmentStatus: "LABEL_CREATED",
    },
    {
      orderNumber: "ORD-1038",
      customerIdx: 4,
      productIdx: 2,
      quantity: 2,
      status: "PAID",
      fulfillmentStatus: "DELIVERED",
      daysAgo: 5,
      carrier: "FEDEX",
      trackingNumber: "788910293812",
      shipmentStatus: "DELIVERED",
    },
    {
      orderNumber: "ORD-1037",
      customerIdx: 5,
      productIdx: 3,
      quantity: 1,
      status: "PAID",
      fulfillmentStatus: "DELIVERED",
      daysAgo: 6,
      carrier: "USPS",
      trackingNumber: "9400111899223199847103",
      shipmentStatus: "DELIVERED",
    },
  ];

  for (const so of sampleOrders) {
    const cust = createdCustomers[so.customerIdx];
    const prod = createdProducts[so.productIdx];
    const totalAmount = prod.sellingPrice * so.quantity;
    const totalCost = prod.costPrice * so.quantity;
    const profitAmount = totalAmount - totalCost;
    const orderDate = new Date(Date.now() - so.daysAgo * 24 * 60 * 60 * 1000);

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        storeId: store1.id,
        customerId: cust.id,
        orderNumber: so.orderNumber,
        status: so.status,
        financialStatus: "PAID",
        fulfillmentStatus: so.fulfillmentStatus,
        totalAmount,
        subtotalAmount: totalAmount,
        profitAmount,
        currency: "USD",
        riskLevel: "LOW",
        createdAt: orderDate,
        updatedAt: orderDate,
      },
    });

    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: prod.id,
        variantId: prod.variantId,
        title: prod.title,
        quantity: so.quantity,
        price: prod.sellingPrice,
        cost: prod.costPrice,
        total: totalAmount,
      },
    });

    if (so.fulfillmentStatus !== "UNFULFILLED") {
      await prisma.shipment.create({
        data: {
          orderId: order.id,
          carrier: so.carrier,
          trackingNumber: so.trackingNumber,
          trackingUrl: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${so.trackingNumber}`,
          status: so.shipmentStatus,
          shippingCost: 3.50,
          estimatedDelivery: new Date(orderDate.getTime() + 5 * 24 * 60 * 60 * 1000),
          eventsJson: JSON.stringify([
            { timestamp: orderDate.toISOString(), status: "Electronic Shipping Info Received", location: "Warehouse" },
            { timestamp: new Date(orderDate.getTime() + 24 * 3600 * 1000).toISOString(), status: "Departed Sort Facility", location: "Regional Hub" },
          ]),
          createdAt: orderDate,
        },
      });
    }
  }

  // 8. Ad Campaigns
  await prisma.adCampaign.createMany({
    data: [
      {
        userId: user.id,
        storeId: store1.id,
        platform: "META",
        campaignName: "TOF - Neck Fan Viral Video - US Broad",
        status: "ACTIVE",
        dailyBudget: 120.0,
        totalSpend: 1840.50,
        impressions: 94200,
        clicks: 3410,
        conversions: 114,
        roas: 2.85,
        revenue: 5245.43,
        cpc: 0.54,
        cpm: 19.54,
        ctr: 3.62,
      },
      {
        userId: user.id,
        storeId: store1.id,
        platform: "TIKTOK",
        campaignName: "TOF - Pet Steam Brush UGC Hook 3",
        status: "ACTIVE",
        dailyBudget: 90.0,
        totalSpend: 1120.00,
        impressions: 112000,
        clicks: 4890,
        conversions: 152,
        roas: 3.42,
        revenue: 3830.40,
        cpc: 0.23,
        cpm: 10.00,
        ctr: 4.36,
      },
      {
        userId: user.id,
        storeId: store1.id,
        platform: "GOOGLE",
        campaignName: "Search - High-Intent Orthopedic Cushion",
        status: "ACTIVE",
        dailyBudget: 75.0,
        totalSpend: 920.00,
        impressions: 21500,
        clicks: 1420,
        conversions: 58,
        roas: 3.15,
        revenue: 2897.10,
        cpc: 0.65,
        cpm: 42.79,
        ctr: 6.60,
      }
    ],
  });

  // 9. Automations
  const auto1 = await prisma.automation.create({
    data: {
      userId: user.id,
      storeId: store1.id,
      name: "Low Inventory Supplier Auto-Fallback",
      triggerType: "LOW_INVENTORY",
      conditionsJson: JSON.stringify({ threshold: 50, notify: true }),
      aiPrompt: "Evaluate alternate suppliers with >=4.7 rating and <=7 day fulfillment speed.",
      actionType: "SWITCH_SUPPLIER",
      actionPayloadJson: JSON.stringify({ fallbackSupplierId: sup2.id }),
      isEnabled: true,
      runCount: 14,
      lastRunAt: new Date(Date.now() - 3 * 3600 * 1000),
    },
  });

  await prisma.automationRun.create({
    data: {
      automationId: auto1.id,
      status: "SUCCESS",
      triggerDataJson: JSON.stringify({ sku: "DROPAI-NF-001", currentStock: 48 }),
      resultDataJson: JSON.stringify({ switchedTo: sup2.name, newCost: 12.20, leadTimeDays: 4 }),
      executedAt: new Date(Date.now() - 3 * 3600 * 1000),
    },
  });

  await prisma.automation.create({
    data: {
      userId: user.id,
      storeId: store1.id,
      name: "High Fraud Risk Order Immediate Hold",
      triggerType: "HIGH_RISK_ORDER",
      conditionsJson: JSON.stringify({ riskScoreThreshold: 60 }),
      actionType: "HOLD_ORDER",
      actionPayloadJson: JSON.stringify({ requireMerchantReview: true }),
      isEnabled: true,
      runCount: 3,
      lastRunAt: new Date(Date.now() - 24 * 3600 * 1000),
    },
  });

  // 10. Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: user.id,
        type: "SUCCESS",
        title: "Order Fulfillment Batch Complete",
        message: "18 orders were successfully dispatched via CJ Dropshipping YunExpress line.",
        link: "/app/orders",
      },
      {
        userId: user.id,
        type: "ALERT",
        title: "TikTok Ad Scaling Opportunity",
        message: "UGC Hook 3 for Pet Steam Brush reached a 3.42 ROAS. AI recommends a 20% budget boost.",
        link: "/app/ads",
      },
      {
        userId: user.id,
        type: "WARNING",
        title: "Supplier Shipping Rate Adjustment",
        message: "USPS regional rate updated for 400g parcels ($3.20 -> $3.50). Margins remain above 78%.",
        link: "/app/suppliers",
      }
    ],
  });

  console.log("✅ Demo store data successfully seeded into Neon PostgreSQL!");
}

seedStoreData()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
