const fs = require("fs");
const path = require("path");

console.log("==================================================");
console.log("       DROPAI DEEP APPLICATION AUDIT SCRIPT       ");
console.log("==================================================\n");

const ROOT_DIR = path.resolve(__dirname, "..");
const APP_DIR = path.join(ROOT_DIR, "app");

// 1. Collect all Page routes and API routes
const pages = [];
const apiRoutes = [];

function scanDirectory(dir, currentRoute = "") {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      // Ignore special Next.js directories like _components
      if (!entry.name.startsWith("_") && !entry.name.startsWith(".")) {
        const nextRoute = currentRoute + "/" + entry.name;
        scanDirectory(path.join(dir, entry.name), nextRoute);
      }
    } else if (entry.isFile()) {
      if (entry.name === "page.tsx" || entry.name === "page.jsx" || entry.name === "page.js") {
        const route = currentRoute === "" ? "/" : currentRoute;
        pages.push(route);
      } else if (entry.name === "route.ts" || entry.name === "route.js") {
        apiRoutes.push(currentRoute);
      }
    }
  }
}

scanDirectory(APP_DIR, "");

console.log(`[1] ROUTE DISCOVERY:`);
console.log(`    Found ${pages.length} frontend pages.`);
console.log(`    Found ${apiRoutes.length} API endpoints.\n`);

// 2. Scan all TSX / JSX files for <Link href="..."> and router.push(...)
const linkIssues = [];
const allTsxFiles = [];

function collectFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".next" && entry.name !== ".git") {
        collectFiles(fullPath);
      }
    } else if (entry.isFile() && (entry.name.endsWith(".tsx") || entry.name.endsWith(".jsx"))) {
      allTsxFiles.push(fullPath);
    }
  }
}

collectFiles(ROOT_DIR);

console.log(`[2] SCANNING ${allTsxFiles.length} REACT FILES FOR INTERNAL LINKS...`);

const linkRegex = /href=[\"'](\/[^\"'#\?]*)/g;
const routerPushRegex = /router\.push\([\"'](\/[^\"'#\?]*)/g;

allTsxFiles.forEach((filePath) => {
  const content = fs.readFileSync(filePath, "utf8");
  const relPath = path.relative(ROOT_DIR, filePath);

  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    const target = match[1];
    checkRoute(target, relPath, "Link href");
  }

  while ((match = routerPushRegex.exec(content)) !== null) {
    const target = match[1];
    checkRoute(target, relPath, "router.push");
  }
});

function checkRoute(target, file, type) {
  // Normalize target
  if (target.endsWith("/") && target.length > 1) target = target.slice(0, -1);

  // Check against static pages or dynamic routes
  const exists = pages.some((page) => {
    if (page === target) return true;
    // Check dynamic routes e.g. /app/orders/[id] matching /app/orders/123
    const pageParts = page.split("/");
    const targetParts = target.split("/");
    if (pageParts.length !== targetParts.length) return false;
    return pageParts.every((p, i) => p.startsWith("[") && p.endsWith("]") || p === targetParts[i]);
  });

  // Check canonical redirects from next.config.mjs or middleware
  const canonicalAliases = [
    "/billing", "/subscription", "/subscriptions",
    "/dashboard/billing", "/dashboard/subscription", "/dashboard/subscriptions",
    "/app/subscription", "/app/subscriptions", "/dashboard",
    "/admin", "/admin/billing", "/admin/subscription", "/admin/subscriptions",
    "/owner/billing", "/owner/subscription"
  ];

  if (!exists && !canonicalAliases.includes(target) && !target.startsWith("/api/")) {
    linkIssues.push({ target, file, type });
  }
}

if (linkIssues.length > 0) {
  console.log(`⚠️  FOUND ${linkIssues.length} UNRESOLVED / POTENTIALLY BROKEN LINKS:`);
  linkIssues.forEach((issue) => {
    console.log(`   - [${issue.type}] Target "${issue.target}" in ${issue.file}`);
  });
} else {
  console.log(`✅ All internal navigation links point to valid pages or canonical redirects!`);
}

// 3. Database connection & models check
console.log(`\n[3] PRISMA DATABASE AUDIT:`);
try {
  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();
  
  async function checkDb() {
    try {
      const userCount = await prisma.user.count();
      const sessionCount = await prisma.session.count();
      const orderCount = await prisma.order.count();
      const productCount = await prisma.product.count();
      console.log(`   ✓ Connected to Prisma successfully.`);
      console.log(`   ✓ Users count: ${userCount}`);
      console.log(`   ✓ Sessions count: ${sessionCount}`);
      console.log(`   ✓ Orders count: ${orderCount}`);
      console.log(`   ✓ Products count: ${productCount}`);

      // Check custom admin
      const customAdmin = await prisma.user.findFirst({
        where: { OR: [{ email: "admin@123456" }, { email: "admin@123456.com" }] }
      });
      if (customAdmin) {
        console.log(`   ✓ Custom Admin '${customAdmin.email}' exists with role: '${customAdmin.role}'`);
      } else {
        console.log(`   ⚠️ Custom Admin admin@123456 not found in active database.`);
      }
    } catch (err) {
      console.error(`   ❌ Database check error:`, err.message);
    } finally {
      await prisma.$disconnect();
    }
  }
  checkDb();
} catch (e) {
  console.error(`   ❌ Failed to initialize PrismaClient:`, e.message);
}
