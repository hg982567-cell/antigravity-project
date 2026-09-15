const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding custom admin credentials...");
  const password = "admin123456";
  const passwordHash = await bcrypt.hash(password, 10);

  const adminEmails = ["admin@123456", "admin@123456.com"];

  for (const email of adminEmails) {
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        role: "OWNER",
        status: "ACTIVE",
        isEmailVerified: true,
        passwordHash,
        isSuspended: false,
        name: "Platform Super Admin",
      },
      create: {
        email,
        name: "Platform Super Admin",
        role: "OWNER",
        status: "ACTIVE",
        isEmailVerified: true,
        passwordHash,
        recoveryCodes: JSON.stringify(["DROPAI-ADMIN-123456", "DROPAI-BACKUP-998822"]),
      },
    });

    // Ensure subscription exists
    await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {
        plan: "ENTERPRISE",
        status: "ACTIVE",
        aiCreditsRemaining: 50000,
        aiCreditsTotal: 50000,
        storesLimit: 100,
      },
      create: {
        userId: user.id,
        plan: "ENTERPRISE",
        status: "ACTIVE",
        aiCreditsRemaining: 50000,
        aiCreditsTotal: 50000,
        storesLimit: 100,
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    }).catch(() => null);

    console.log(`✅ Provisioned Owner Admin account: ${user.email} (Role: ${user.role}, Status: ${user.status})`);
  }
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
