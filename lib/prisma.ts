import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Priority database connection resolution: DROPAI_DATABASE_URL > NEON_DATABASE_URL > DATABASE_URL
const activeDbUrl =
  process.env.DROPAI_DATABASE_URL ||
  process.env.NEON_DATABASE_URL ||
  process.env.DATABASE_URL ||
  undefined;

export const prisma =
  global.prisma ||
  new PrismaClient({
    datasources: activeDbUrl ? { db: { url: activeDbUrl } } : undefined,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
