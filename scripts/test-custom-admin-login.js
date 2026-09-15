const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function runTests() {
  console.log("=== Testing Custom Admin (admin@123456 / admin123456) ===");

  // 1. Verify user exists in database
  const user = await prisma.user.findFirst({
    where: { email: "admin@123456" },
    include: { subscription: true },
  });

  if (!user) {
    console.error("❌ Test Failed: admin@123456 user not found in database.");
    process.exit(1);
  }

  console.log("✓ Found admin@123456 user in DB:", {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    isEmailVerified: user.isEmailVerified,
  });

  if (user.role !== "OWNER") {
    console.error("❌ Test Failed: User role is not OWNER.");
    process.exit(1);
  }

  // 2. Verify password comparison
  const passwordMatches = await bcrypt.compare("admin123456", user.passwordHash);
  if (!passwordMatches) {
    console.error("❌ Test Failed: Bcrypt password compare failed.");
    process.exit(1);
  }
  console.log("✓ Bcrypt password verification succeeded for 'admin123456'");

  // 3. Verify .com mirror
  const userCom = await prisma.user.findFirst({
    where: { email: "admin@123456.com" },
  });
  if (!userCom) {
    console.error("❌ Test Failed: admin@123456.com mirror not found.");
    process.exit(1);
  }
  console.log("✓ Found admin@123456.com mirror in DB (Role: OWNER)");

  console.log("🎉 Custom Admin validation completed successfully!");
}

runTests()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
