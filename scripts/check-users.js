const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const bcrypt = require("bcryptjs");

async function main() {
  const hash = await bcrypt.hash("password123", 10);
  const updated = await prisma.user.updateMany({
    where: {
      passwordHash: null,
    },
    data: { passwordHash: hash }
  });
  console.log("Updated accounts missing passwordHash:", updated.count);
}

main().catch(console.error).finally(() => prisma.$disconnect());
