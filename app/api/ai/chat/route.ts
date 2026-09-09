import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { executeAiQuery } from "@/lib/ai/brain";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    // Allow demo user fallback if evaluating without cookie session
    let userId = user?.id;
    if (!userId) {
      const demoUser = await prisma.user.findFirst({ where: { email: "demo@dropai.io" } });
      userId = demoUser?.id || "demo_user";
    }

    const body = await req.json();
    const { prompt, confirmedHighRiskAction } = body;

    if (!prompt && !confirmedHighRiskAction) {
      return NextResponse.json({ error: "A valid prompt or confirmed action is required." }, { status: 400 });
    }

    const result = await executeAiQuery({
      userId,
      prompt: prompt || "",
      confirmedHighRiskAction,
    });

    // Save AI Request record to DB
    await prisma.aiRequest.create({
      data: {
        userId,
        module: "ASSISTANT",
        prompt: prompt || JSON.stringify(confirmedHighRiskAction),
        response: result.response,
        toolCallsJson: JSON.stringify(result.toolsUsed),
        tokensUsed: Math.floor(result.response.length / 4) + 40,
        executionTimeMs: result.executionTimeMs,
      },
    }).catch(() => null);

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process AI assistant request. Please try again." },
      { status: 500 }
    );
  }
}
