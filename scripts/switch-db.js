const fs = require("fs");
const path = require("path");

const target = (process.argv[2] || "auto").toLowerCase();
const schemaPath = path.join(__dirname, "..", "prisma", "schema.prisma");

if (!fs.existsSync(schemaPath)) {
  console.error("schema.prisma not found at", schemaPath);
  process.exit(1);
}

const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  for (const rawLine of envContent.split("\n")) {
    const line = rawLine.trim();
    if (line && !line.startsWith("#")) {
      const match = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
      if (match) {
        let val = match[2].trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[match[1]]) {
          process.env[match[1]] = val;
        }
      }
    }
  }
}

let schema = fs.readFileSync(schemaPath, "utf8");
const dbUrl = (
  process.env.DROPAI_DATABASE_URL ||
  process.env.NEON_DATABASE_URL ||
  process.env.DATABASE_URL ||
  ""
).trim();

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
  const primaryDbVar = process.env.DROPAI_DATABASE_URL
    ? "DROPAI_DATABASE_URL"
    : process.env.NEON_DATABASE_URL
    ? "NEON_DATABASE_URL"
    : "DATABASE_URL";

  schema = schema.replace(/url\s*=\s*env\("[^"]+"\)/, `url       = env("${primaryDbVar}")`);

  const directVar = process.env.DROPAI_DIRECT_URL
    ? "DROPAI_DIRECT_URL"
    : process.env.NEON_DIRECT_URL
    ? "NEON_DIRECT_URL"
    : process.env.DIRECT_URL
    ? "DIRECT_URL"
    : process.env.DATABASE_URL_UNPOOLED
    ? "DATABASE_URL_UNPOOLED"
    : process.env.POSTGRES_URL_NON_POOLING
    ? "POSTGRES_URL_NON_POOLING"
    : null;

  if (directVar) {
    if (!schema.includes("directUrl")) {
      schema = schema.replace(
        /url\s*=\s*env\("[^"]+"\)/,
        `url       = env("${primaryDbVar}")\n  directUrl = env("${directVar}")`
      );
    } else {
      schema = schema.replace(/directUrl\s*=\s*env\("[^"]+"\)/, `directUrl = env("${directVar}")`);
    }
  } else {
    schema = schema.replace(/\s*directUrl\s*=\s*env\("[^"]+"\)/, "");
  }
  fs.writeFileSync(schemaPath, schema);
  console.log("✅ Configured Prisma for Cloud PostgreSQL (Vercel & Production)");
} else {
  schema = schema.replace(/provider\s*=\s*"postgresql"/, 'provider = "sqlite"');
  schema = schema.replace(/\s*directUrl\s*=\s*env\("[^"]+"\)/, "");
  fs.writeFileSync(schemaPath, schema);
  console.log("✅ Configured Prisma for Local SQLite (file:./dev.db)");
}
