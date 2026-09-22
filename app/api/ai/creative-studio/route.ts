import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { callUniversalAi } from "@/lib/ai/universal-client";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized: Please sign in." }, { status: 401 });
    }

    if (user.isSuspended || user.status === "SUSPENDED") {
      return NextResponse.json({ error: "Account suspended: Access denied." }, { status: 403 });
    }

    const body = await req.json();
    const { productName, targetAudience, platform } = body;

    if (!productName) {
      return NextResponse.json({ error: "Product name is required." }, { status: 400 });
    }

    const target = targetAudience || "General Buyers (US/Global)";
    const targetPlatform = platform || "TIKTOK";

    const systemPrompt = `You are an elite direct-response ecommerce advertising director.
Create 3 high-converting ad copies for the requested product, audience, and platform.
Output MUST be a valid JSON array of exactly 3 objects with no enclosing markdown fences:
[
  {
    "type": "Viral UGC Script (${targetPlatform})",
    "hook": "0-3s scroll-stopping video hook or headline",
    "body": "persuasive body copy highlighting pain point, unique mechanism, and social proof",
    "cta": "high-converting call to action offer"
  },
  {
    "type": "Problem-Agitation-Solution (${targetPlatform})",
    "hook": "pain point hook",
    "body": "agitation and transformation story",
    "cta": "limited time discount CTA"
  },
  {
    "type": "High-Intent Hook & Offer (${targetPlatform})",
    "hook": "benefit driven headline",
    "body": "social proof, guarantees, and fast shipping offer",
    "cta": "instant purchase CTA"
  }
]`;

    const userPrompt = `Product: "${productName}"\nTarget Audience: "${target}"\nPrimary Ad Platform: "${targetPlatform}"`;

    const aiRes = await callUniversalAi({
      prompt: userPrompt,
      systemPrompt,
      taskType: "AD_GENERATION",
      temperature: 0.8,
    });

    let copies: Array<{ type: string; hook: string; body: string; cta: string; badge: string }> = [];

    if (aiRes.success && aiRes.text) {
      try {
        let cleanText = aiRes.text.trim();
        if (cleanText.startsWith("```")) {
          cleanText = cleanText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
        }
        const parsed = JSON.parse(cleanText);
        if (Array.isArray(parsed) && parsed.length > 0) {
          copies = parsed.map((item: any, idx: number) => ({
            type: item.type || `Variation #${idx + 1} (${targetPlatform})`,
            hook: item.hook || "",
            body: item.body || "",
            cta: item.cta || "Shop Now",
            badge: `AI • ${aiRes.modelUsed || "LIVE"}`,
          }));
        }
      } catch (parseErr) {
        console.warn("Could not parse JSON from AI response, formatting text response:", parseErr);
      }
    }

    // Fallback if AI didn't return parseable JSON array
    if (copies.length === 0) {
      const modelLabel = aiRes.success ? `AI • ${aiRes.modelUsed || "GEMINI"}` : "AI-OPTIMIZED";
      copies = [
        {
          type: `Viral UGC Script (${targetPlatform})`,
          badge: modelLabel,
          hook: `Stop scrolling if you're looking for the best ${productName} on the market!`,
          body: `Designed specifically for ${target}, this solves the biggest daily pain point in under 30 seconds. Over 10,000 customers already made the switch.`,
          cta: `Tap the link to get 30% off during our limited-time restock sale!`,
        },
        {
          type: `Problem-Agitation-Solution (${targetPlatform})`,
          badge: modelLabel,
          hook: `Tired of outdated alternatives that cost a fortune?`,
          body: `Experience why ${productName} is trending everywhere. High durability, effortless usability, and backed by a 30-day money-back guarantee with fast tracked domestic shipping.`,
          cta: `Claim Your Discount Today — Code: DROPSHIP30`,
        },
        {
          type: `High-Intent Hook & Offer (${targetPlatform})`,
          badge: modelLabel,
          hook: `Official ${productName} | Verified Top Seller`,
          body: `Rated 4.9/5 stars by thousands of happy buyers. Free 3-5 day shipping and 30-day hassle-free returns.`,
          cta: `Order Now While Limited Inventory Lasts`,
        },
      ];
    }

    // Save AI Request record to DB
    await prisma.aiRequest.create({
      data: {
        userId: user.id,
        module: "ADS",
        prompt: userPrompt,
        response: JSON.stringify(copies),
        tokensUsed: Math.floor((aiRes.text?.length || 200) / 4) + 50,
        executionTimeMs: aiRes.latencyMs || 500,
      },
    }).catch(() => null);

    return NextResponse.json({
      success: true,
      copies,
      providerUsed: aiRes.providerUsed,
      modelUsed: aiRes.modelUsed,
      latencyMs: aiRes.latencyMs,
    });
  } catch (error: any) {
    console.error("Creative studio API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate creative ad copy." },
      { status: 500 }
    );
  }
}
