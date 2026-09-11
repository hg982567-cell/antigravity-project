/**
 * DropAI Admin Privilege Provisioning Script
 * 
 * Sets Firebase custom user claims { role: 'OWNER', admin: true }
 * and updates the corresponding Prisma User record to OWNER role.
 * 
 * Usage:
 *   node scripts/set-admin.js <email-or-firebase-uid>
 * Example:
 *   node scripts/set-admin.js owner@dropai.io
 */

const { PrismaClient } = require("@prisma/client");
const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

// Load local .env if available
try {
  const envPath = path.resolve(__dirname, "../.env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    envContent.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const idx = trimmed.indexOf("=");
        if (idx > 0) {
          const key = trimmed.substring(0, idx).trim();
          let val = trimmed.substring(idx + 1).trim();
          if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
          if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
          if (!process.env[key]) process.env[key] = val;
        }
      }
    });
  }
} catch (e) {
  // Ignore env read errors
}

const prisma = new PrismaClient();

async function main() {
  const target = process.argv[2];

  if (!target) {
    console.error("\n❌ Error: Please provide an email or Firebase UID.");
    console.log("Usage: node scripts/set-admin.js <email-or-uid>\n");
    process.exit(1);
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.error("\n⚠️ Warning: Firebase Admin credentials not found in environment.");
    console.error("Please ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set.");
    console.log("Updating local Prisma database record only...\n");

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: target.toLowerCase() }, { firebaseUid: target }, { id: target }],
      },
    });

    if (!user) {
      console.error(`❌ No local user found matching "${target}".`);
      process.exit(1);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { role: "OWNER", status: "ACTIVE", isEmailVerified: true },
    });

    console.log(`✅ User ${user.email} (ID: ${user.id}) upgraded to role: 'OWNER' in Prisma database.`);
    console.log("Note: Add Firebase Admin keys to .env to also set Firebase Custom Claims.");
    process.exit(0);
  }

  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  privateKey = privateKey.replace(/\\n/g, "\n");

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  const auth = admin.auth();
  let firebaseUser = null;

  try {
    if (target.includes("@")) {
      firebaseUser = await auth.getUserByEmail(target.toLowerCase().trim());
    } else {
      firebaseUser = await auth.getUser(target.trim());
    }
  } catch (err) {
    console.error(`\n❌ Could not find Firebase user "${target}":`, err.message);
    process.exit(1);
  }

  console.log(`\nFound Firebase user: ${firebaseUser.email} (UID: ${firebaseUser.uid})`);

  // 1. Set custom claims on Firebase
  const claims = {
    role: "OWNER",
    admin: true,
  };

  await auth.setCustomUserClaims(firebaseUser.uid, claims);
  console.log("✅ Set Firebase Custom Claims: { role: 'OWNER', admin: true }");

  // 2. Ensure email is marked verified in Firebase
  if (!firebaseUser.emailVerified) {
    await auth.updateUser(firebaseUser.uid, { emailVerified: true });
    console.log("✅ Marked email as verified in Firebase Auth.");
  }

  // 3. Update or create user in Prisma DB
  const email = firebaseUser.email.toLowerCase().trim();
  let dbUser = await prisma.user.findFirst({
    where: {
      OR: [{ firebaseUid: firebaseUser.uid }, { email }],
    },
  });

  if (dbUser) {
    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        firebaseUid: firebaseUser.uid,
        role: "OWNER",
        status: "ACTIVE",
        isEmailVerified: true,
      },
    });
    console.log(`✅ Updated existing database user ${dbUser.id} to role: 'OWNER'.`);
  } else {
    dbUser = await prisma.user.create({
      data: {
        firebaseUid: firebaseUser.uid,
        email,
        name: firebaseUser.displayName || "DropAI Administrator",
        role: "OWNER",
        status: "ACTIVE",
        isEmailVerified: true,
      },
    });
    console.log(`✅ Created database user ${dbUser.id} with role: 'OWNER'.`);
  }

  console.log(`\n🎉 SUCCESS: ${email} is now a verified Platform Owner!`);
  console.log("They can now log into /owner/login using their Firebase credentials.\n");
}

main()
  .catch((e) => {
    console.error("Script execution failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
