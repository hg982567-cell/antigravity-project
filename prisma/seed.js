const { execSync } = require("child_process");
const path = require("path");

console.log("🌱 Running DropAI Master Database Seeder...");
const root = path.join(__dirname, "..");

try {
  execSync(`node "${path.join(root, "scripts", "seed-custom-admin.js")}"`, { stdio: "inherit" });
  execSync(`node "${path.join(root, "scripts", "seed-owner.js")}"`, { stdio: "inherit" });
  execSync(`node "${path.join(root, "scripts", "seed-store-data.js")}"`, { stdio: "inherit" });
  execSync(`node "${path.join(root, "scripts", "seed-platform-settings.js")}"`, { stdio: "inherit" });
  console.log("🚀 DropAI Master Seeding completed successfully!");
} catch (err) {
  console.error("❌ Seeding failed:", err.message);
  process.exit(1);
}
