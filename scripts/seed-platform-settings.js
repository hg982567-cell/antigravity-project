const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function seedSettings() {
  console.log("🌱 Seeding Subscription Plans, Feature Flags, and System Settings into Neon...");

  // 1. Subscription Plans
  const plans = [
    {
      code: "FREE",
      name: "Free Trial / Starter",
      priceMonthly: 0,
      priceYearly: 0,
      productLimit: 5,
      storeLimit: 1,
      orderLimit: 25,
      aiCreditsLimit: 250,
      automationLimit: 1,
      apiAccess: false,
      supportLevel: "COMMUNITY",
      isActive: true,
    },
    {
      code: "STARTER",
      name: "Merchant Starter",
      priceMonthly: 29,
      priceYearly: 279,
      productLimit: 50,
      storeLimit: 2,
      orderLimit: 250,
      aiCreditsLimit: 2000,
      automationLimit: 5,
      apiAccess: false,
      supportLevel: "EMAIL",
      isActive: true,
    },
    {
      code: "PRO",
      name: "DropAI Professional",
      priceMonthly: 79,
      priceYearly: 759,
      productLimit: 500,
      storeLimit: 5,
      orderLimit: 2500,
      aiCreditsLimit: 10000,
      automationLimit: 25,
      apiAccess: true,
      supportLevel: "PRIORITY_24_7",
      isActive: true,
    },
    {
      code: "BUSINESS",
      name: "Commerce Business Scale",
      priceMonthly: 149,
      priceYearly: 1430,
      productLimit: 2500,
      storeLimit: 15,
      orderLimit: 10000,
      aiCreditsLimit: 35000,
      automationLimit: 100,
      apiAccess: true,
      supportLevel: "PRIORITY_24_7",
      isActive: true,
    },
    {
      code: "ENTERPRISE",
      name: "DropAI Enterprise Dedicated",
      priceMonthly: 299,
      priceYearly: 2870,
      productLimit: 99999,
      storeLimit: 99,
      orderLimit: 999999,
      aiCreditsLimit: 150000,
      automationLimit: 999,
      apiAccess: true,
      supportLevel: "DEDICATED",
      isActive: true,
    },
  ];

  for (const p of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { code: p.code },
      update: p,
      create: p,
    });
  }
  console.log(`✅ Upserted ${plans.length} subscription plans.`);

  // 2. Feature Flags
  const flags = [
    { key: "ai_product_research", name: "AI Product Research", isEnabled: true, description: "AI scoring and product intelligence" },
    { key: "ai_ad_creative_studio", name: "AI Ad Creative Studio", isEnabled: true, description: "Automated video/copy generation" },
    { key: "order_auto_fulfillment", name: "Order Auto Fulfillment", isEnabled: true, description: "Direct dispatch to suppliers" },
    { key: "shopify_app_bridge", name: "Shopify App Bridge", isEnabled: true, description: "Embedded Shopify admin integration" },
    { key: "high_risk_fraud_hold", name: "High Risk Fraud Hold", isEnabled: true, description: "Automatic hold on suspicious transactions" },
    { key: "beta_enterprise_ai_swarm", name: "Enterprise AI Swarm", isEnabled: true, description: "Multi-agent autonomous optimizations" },
  ];

  for (const f of flags) {
    await prisma.featureFlag.upsert({
      where: { key: f.key },
      update: f,
      create: f,
    });
  }
  console.log(`✅ Upserted ${flags.length} feature flags.`);

  // 3. System Settings
  const settings = [
    { key: "platform_name", value: "DropAI Master Enterprise", category: "GENERAL", description: "Platform Title" },
    { key: "default_currency", value: "USD", category: "GENERAL", description: "Default store currency" },
    { key: "public_registration_enabled", value: "true", category: "SECURITY", description: "Allow public merchant signups" },
    { key: "max_sessions_per_user", value: "5", category: "SECURITY", description: "Session concurrency limit" },
    { key: "maintenance_mode", value: "false", category: "MAINTENANCE", description: "Platform wide maintenance flag" },
  ];

  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: s,
      create: s,
    });
  }
  console.log(`✅ Upserted ${settings.length} system settings.`);
}

seedSettings()
  .catch((e) => {
    console.error("❌ Failed to seed settings:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
