const fs = require("fs");
const path = require("path");

const target = (process.argv[2] || "auto").toLowerCase();
const schemaPath = path.join(__dirname, "..", "prisma", "schema.prisma");

if (!fs.existsSync(schemaPath)) {
  console.error("schema.prisma not found at", schemaPath);
  process.exit(1);
}

let schema = fs.readFileSync(schemaPath, "utf8");
const dbUrl = (process.env.DATABASE_URL || "").trim();

let isPostgres = false;
if (target === "postgres" || target === "postgresql") {
  isPostgres = true;
} else if (target === "sqlite") {
  isPostgres = false;
} else {
  // auto-detect based on connection string or Vercel production deployment
  if (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://")) {
    isPostgres = true;
  } else if (process.env.VERCEL === "1" && !dbUrl.startsWith("file:")) {
    isPostgres = true;
  } else {
    isPostgres = false;
  }
}

if (isPostgres) {
  schema = schema.replace(/provider\s*=\s*"sqlite"/, 'provider = "postgresql"');
  if (process.env.DIRECT_URL && !schema.includes("directUrl")) {
    schema = schema.replace(
      /url\s*=\s*env\("DATABASE_URL"\)/,
      'url       = env("DATABASE_URL")\n  directUrl = env("DIRECT_URL")'
    );
  }
  fs.writeFileSync(schemaPath, schema);
  console.log("✅ Configured Prisma for Cloud PostgreSQL (Vercel & Production)");
} else {
  schema = schema.replace(/provider\s*=\s*"postgresql"/, 'provider = "sqlite"');
  schema = schema.replace(/\s*directUrl\s*=\s*env\("DIRECT_URL"\)/, "");
  fs.writeFileSync(schemaPath, schema);
  console.log("✅ Configured Prisma for Local SQLite (file:./dev.db)");
}
