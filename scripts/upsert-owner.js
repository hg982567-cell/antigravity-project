const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function run() {
  const hash = await bcrypt.hash('admin123456', 10);
  const user = await prisma.user.upsert({
    where: { email: 'owner@dropai.com' },
    update: { passwordHash: hash, role: 'OWNER', status: 'ACTIVE', isEmailVerified: true },
    create: {
      email: 'owner@dropai.com',
      name: 'DropAI Platform Owner',
      role: 'OWNER',
      status: 'ACTIVE',
      isEmailVerified: true,
      passwordHash: hash
    }
  });
  console.log('Successfully upserted owner@dropai.com:', user.email, user.role);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
