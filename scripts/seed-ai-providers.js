const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seedAi() {
  console.log("🌱 Seeding AI Provider Configurations into Neon...");

  const geminiKey = process.env.GEMINI_API_KEY || "";
  const openaiKey = process.env.OPENAI_API_KEY || "";

  // 1. Google Gemini (Active Default)
  await prisma.aiProviderConfig.upsert({
    where: { provider: "GOOGLE" },
    update: {
      displayName: "Google Gemini 3.6 Flash",
      protocol: "GOOGLE_GEMINI",
      apiKeyEncrypted: geminiKey,
      baseUrl: "https://generativelanguage.googleapis.com/v1beta",
      status: "ACTIVE",
      priority: 1,
      isDefault: true,
      modelsJson: JSON.stringify(["gemini-3.6-flash", "gemini-2.5-pro", "gemini-2.5-flash-lite"]),
      rateLimitPerMin: 150,
      dailyTokenLimit: 10000000,
    },
    create: {
      provider: "GOOGLE",
      displayName: "Google Gemini 3.6 Flash",
      protocol: "GOOGLE_GEMINI",
      apiKeyEncrypted: geminiKey,
      baseUrl: "https://generativelanguage.googleapis.com/v1beta",
      status: "ACTIVE",
      priority: 1,
      isDefault: true,
      modelsJson: JSON.stringify(["gemini-3.6-flash", "gemini-2.5-pro", "gemini-2.5-flash-lite"]),
      rateLimitPerMin: 150,
      dailyTokenLimit: 10000000,
    },
  });
  console.log("✅ Seeded Google Gemini (Default Active Provider)");

  // 2. OpenAI
  await prisma.aiProviderConfig.upsert({
    where: { provider: "OPENAI" },
    update: {
      displayName: "OpenAI GPT-4o Enterprise",
      protocol: "OPENAI_COMPATIBLE",
      apiKeyEncrypted: openaiKey,
      baseUrl: "https://api.openai.com/v1",
      status: "ACTIVE",
      priority: 2,
      isDefault: false,
      modelsJson: JSON.stringify(["gpt-4o-mini", "gpt-4o", "gpt-4-turbo"]),
      rateLimitPerMin: 120,
      dailyTokenLimit: 5000000,
    },
    create: {
      provider: "OPENAI",
      displayName: "OpenAI GPT-4o Enterprise",
      protocol: "OPENAI_COMPATIBLE",
      apiKeyEncrypted: openaiKey,
      baseUrl: "https://api.openai.com/v1",
      status: "ACTIVE",
      priority: 2,
      isDefault: false,
      modelsJson: JSON.stringify(["gpt-4o-mini", "gpt-4o", "gpt-4-turbo"]),
      rateLimitPerMin: 120,
      dailyTokenLimit: 5000000,
    },
  });
  console.log("✅ Seeded OpenAI (GPT-4o Mini)");

  // 3. Anthropic (Pre-configured placeholder)
  await prisma.aiProviderConfig.upsert({
    where: { provider: "ANTHROPIC" },
    update: {
      displayName: "Anthropic Claude 3.5 Sonnet",
      protocol: "ANTHROPIC",
      baseUrl: "https://api.anthropic.com/v1",
      status: "ACTIVE",
      priority: 3,
      isDefault: false,
      modelsJson: JSON.stringify(["claude-3-5-sonnet-20240620", "claude-3-haiku-20240307"]),
      rateLimitPerMin: 80,
      dailyTokenLimit: 3000000,
    },
    create: {
      provider: "ANTHROPIC",
      displayName: "Anthropic Claude 3.5 Sonnet",
      protocol: "ANTHROPIC",
      baseUrl: "https://api.anthropic.com/v1",
      status: "ACTIVE",
      priority: 3,
      isDefault: false,
      modelsJson: JSON.stringify(["claude-3-5-sonnet-20240620", "claude-3-haiku-20240307"]),
      rateLimitPerMin: 80,
      dailyTokenLimit: 3000000,
    },
  });
  console.log("✅ Seeded Anthropic Claude Config");

  // 4. Update Task Routing Rules to use Google Gemini 3.6 Flash by default
  const tasks = [
    { taskType: "PRODUCT_RESEARCH", providerName: "GOOGLE", modelName: "gemini-3.6-flash" },
    { taskType: "AD_GENERATION", providerName: "GOOGLE", modelName: "gemini-3.6-flash" },
    { taskType: "CUSTOMER_SUPPORT", providerName: "GOOGLE", modelName: "gemini-3.6-flash" },
    { taskType: "PRICING_OPTIMIZATION", providerName: "GOOGLE", modelName: "gemini-3.6-flash" },
    { taskType: "FRAUD_RISK_TRIAGE", providerName: "GOOGLE", modelName: "gemini-3.6-flash" },
    { taskType: "AUTONOMOUS_WORKFLOWS", providerName: "GOOGLE", modelName: "gemini-3.6-flash" },
  ];

  for (const t of tasks) {
    await prisma.aiRoutingRule.upsert({
      where: { taskType: t.taskType },
      update: {
        providerName: t.providerName,
        modelName: t.modelName,
        isEnabled: true,
      },
      create: {
        taskType: t.taskType,
        providerName: t.providerName,
        modelName: t.modelName,
        isEnabled: true,
      },
    });
  }
  console.log(`✅ Upserted ${tasks.length} task routing rules to Gemini 3.6 Flash`);
}

seedAi()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
