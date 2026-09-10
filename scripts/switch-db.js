const fs = require("fs");
const path = require("path");

const target = (process.argv[2] || "postgres").toLowerCase();
const schemaPath = path.join(__dirname, "..", "prisma", "schema.prisma");

if (!fs.existsSync(schemaPath)) {
  console.error("schema.prisma not found at", schemaPath);
  process.exit(1);
}

let schema = fs.readFileSync(schemaPath, "utf8");

if (target === "postgres" || target === "postgresql") {
  schema = schema.replace(/provider\s*=\s*"sqlite"/, 'provider = "postgresql"');
  fs.writeFileSync(schemaPath, schema);
  console.log("✅ Configured Prisma for Cloud PostgreSQL (Vercel & Production)");
} else {
  schema = schema.replace(/provider\s*=\s*"postgresql"/, 'provider = "sqlite"');
  schema = schema.replace(/\s*directUrl\s*=\s*env\("DIRECT_URL"\)/, "");
  fs.writeFileSync(schemaPath, schema);
  console.log("✅ Configured Prisma for Local SQLite (file:./dev.db)");
}
