const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testNeon() {
  console.log("Testing connection to Neon PostgreSQL...");
  const users = await prisma.user.findMany();
  console.log("All users in Neon:", users.map(u => ({ email: u.email, role: u.role, name: u.name })));
  const adminExact = await prisma.user.findUnique({ where: { email: "admin@123456" } });
  console.log("admin@123456 exact match:", adminExact ? "EXISTS" : "MISSING");

  const stores = await prisma.store.count();
  const products = await prisma.product.count();
  const orders = await prisma.order.count();
  const logs = await prisma.ownerAuditLog.count();

  console.log("Connected successfully to Neon Cloud PostgreSQL!");
  console.log("Database Stats:", { stores, products, orders, ownerAuditLogs: logs });
  await prisma.$disconnect();
}

testNeon().catch((err) => {
  console.error("Neon test failed:", err);
  process.exit(1);
});
