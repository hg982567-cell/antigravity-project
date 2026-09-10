const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Ensuring Owner and Seed Data in database...");

  // 1. Ensure Owner account exists
  let owner = await prisma.user.findFirst({ where: { role: "OWNER" } });
  if (!owner) {
    const passwordHash = await bcrypt.hash("DropAIOwner2026!Secure", 12);
    owner = await prisma.user.create({
      data: {
        email: "owner@dropai.io",
        name: "DropAI Master Owner",
        passwordHash,
        role: "OWNER",
        isEmailVerified: true,
        twoFactorEnabled: true,
        recoveryCodes: JSON.stringify(["DROPAI-OWNER-SECURE-9988", "DROPAI-BACKUP-EMERGENCY-1122"]),
      },
    });
    console.log("✅ Created Owner account: owner@dropai.io");
  } else {
    // Update password to ensure it matches
    const passwordHash = await bcrypt.hash("DropAIOwner2026!Secure", 12);
    await prisma.user.update({
      where: { id: owner.id },
      data: {
        email: "owner@dropai.io",
        passwordHash,
        isSuspended: false,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });
    console.log("✅ Updated Owner account: owner@dropai.io");
  }

  // 2. Ensure demo user exists
  let demo = await prisma.user.findFirst({ where: { email: "demo@dropai.io" } });
  if (!demo) {
    const demoPasswordHash = await bcrypt.hash("password123", 10);
    demo = await prisma.user.create({
      data: {
        email: "demo@dropai.io",
        name: "Alex Rivera",
        passwordHash: demoPasswordHash,
        role: "MERCHANT",
        isEmailVerified: true,
      },
    });
    console.log("✅ Created Demo Merchant: demo@dropai.io");
  }

  // 3. Ensure Owner Audit Log entry
  await prisma.ownerAuditLog.create({
    data: {
      ownerId: owner.id,
      action: "SYSTEM_INITIALIZED",
      targetType: "SYSTEM",
      newValue: "DropAI Owner Control Center initialized successfully.",
      severity: "INFO",
    },
  });

  console.log("🚀 Database initialization complete!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
