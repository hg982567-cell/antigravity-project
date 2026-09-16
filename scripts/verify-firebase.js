const fs = require("fs");
const https = require("https");

const env = fs.readFileSync(".env", "utf8");
const config = {};
env.split("\n").forEach((line) => {
  const idx = line.indexOf("=");
  if (idx > 0 && !line.trim().startsWith("#")) {
    const key = line.substring(0, idx).trim();
    let val = line.substring(idx + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    config[key] = val;
  }
});

console.log("=== FIREBASE INTEGRATION HEALTH CHECK ===");
console.log("Project ID  :", config.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log("Auth Domain :", config.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
console.log("App ID      :", config.NEXT_PUBLIC_FIREBASE_APP_ID);
console.log("API Key     :", config.NEXT_PUBLIC_FIREBASE_API_KEY ? config.NEXT_PUBLIC_FIREBASE_API_KEY.substring(0, 12) + "..." : "MISSING");

const apiKey = config.NEXT_PUBLIC_FIREBASE_API_KEY;
if (!apiKey) {
  console.error("❌ No API key found in .env");
  process.exit(1);
}

// Check Google Identity Toolkit API directly with the API Key
const testUrl = "https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri?key=" + apiKey;
const postData = JSON.stringify({
  providerId: "google.com",
  continueUri: "http://localhost:3000"
});

const req = https.request(testUrl, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(postData)
  }
}, (res) => {
  let data = "";
  res.on("data", (chunk) => data += chunk);
  res.on("end", () => {
    console.log("\n=== GOOGLE IDENTITY API LIVE TEST ===");
    console.log("HTTP Status Code:", res.statusCode);
    try {
      const parsed = JSON.parse(data);
      if (parsed.error) {
        console.log("Status  : ⚠️ ATTENTION NEEDED IN FIREBASE CONSOLE");
        console.log("Message :", parsed.error.message);
        if (parsed.error.message.includes("OPERATION_NOT_ALLOWED")) {
          console.log("\n👉 ACTION REQUIRED: Google provider is currently DISABLED in Firebase Console.");
          console.log("Please go to https://console.firebase.google.com/project/" + config.NEXT_PUBLIC_FIREBASE_PROJECT_ID + "/authentication/providers and click Google -> Enable -> Save.");
        } else if (parsed.error.message.includes("API_KEY_INVALID")) {
          console.log("\n👉 ACTION REQUIRED: The API Key in .env is not recognized by Google.");
        }
      } else {
        console.log("Status  : ✅ ACTIVE & WORKING 100%!");
        console.log("Auth URI: Successfully generated Google OAuth flow.");
        console.log("Your Firebase Google Sign-In backend is LIVE and ready!");
      }
    } catch (e) {
      console.log("Raw Response:", data);
    }
  });
});

req.on("error", (e) => {
  console.error("Network request failed:", e.message);
});

req.write(postData);
req.end();
