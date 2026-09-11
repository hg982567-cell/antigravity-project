const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Test password policy directly
function runPasswordTests() {
  console.log("=== 1. Testing Password Policy Validator ===");
  const { validatePasswordPolicy } = require("../lib/security/password-policy");

  const testCases = [
    {
      pwd: "short",
      email: "user@example.com",
      expectedValid: false,
      name: "Short password (<12 chars)",
    },
    {
      pwd: "password1234",
      email: "user@example.com",
      expectedValid: false,
      name: "Common blacklisted password",
    },
    {
      pwd: "NoSpecialChar123",
      email: "user@example.com",
      expectedValid: false,
      name: "Missing special character",
    },
    {
      pwd: "NoNumbersHere!@",
      email: "user@example.com",
      expectedValid: false,
      name: "Missing number",
    },
    {
      pwd: "userstore2026!#A",
      email: "userstore@example.com",
      expectedValid: false,
      name: "Contains email prefix",
    },
    {
      pwd: "SecureDropAI2026!Passphrase",
      email: "alex@example.com",
      expectedValid: true,
      name: "Strong enterprise compliant passphrase (12+ chars, mixed, number, symbol)",
    },
  ];

  let passed = 0;
  for (const tc of testCases) {
    const res = validatePasswordPolicy(tc.pwd, tc.email);
    const ok = res.valid === tc.expectedValid;
    if (ok) {
      console.log(`  ✓ PASSED: ${tc.name} (valid: ${res.valid}, strength: ${res.strength})`);
      passed++;
    } else {
      console.error(`  ✗ FAILED: ${tc.name} (expected ${tc.expectedValid}, got ${res.valid})`);
    }
  }

  console.log(`Password Policy Tests: ${passed}/${testCases.length} passed.\n`);
  return passed === testCases.length;
}

async function runDatabaseTests() {
  console.log("=== 2. Testing Database Models & Schema ===");
  try {
    // Check if user table has firebaseUid and status
    const users = await prisma.user.findMany({ take: 3 });
    console.log(`  ✓ Prisma User query succeeded (${users.length} sample users inspected)`);
    if (users.length > 0) {
      const u = users[0];
      console.log(`  ✓ Sample user columns: id=${u.id}, role=${u.role}, status=${u.status}, firebaseUid=${u.firebaseUid}`);
    }
    return true;
  } catch (err) {
    console.error("  ✗ Database inspection error:", err);
    return false;
  }
}

async function main() {
  const pwdOk = runPasswordTests();
  const dbOk = await runDatabaseTests();
  if (pwdOk && dbOk) {
    console.log("🎉 ALL AUTHENTICATION SYSTEM TESTS PASSED SUCCESSFULLY!");
    process.exit(0);
  } else {
    console.error("❌ Some tests failed.");
    process.exit(1);
  }
}

main().finally(async () => {
  await prisma.$disconnect();
});
