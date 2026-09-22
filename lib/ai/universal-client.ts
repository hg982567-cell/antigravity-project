import { prisma } from "@/lib/prisma";

export type AiProtocol = "OPENAI_COMPATIBLE" | "GOOGLE_GEMINI" | "ANTHROPIC";

export interface UniversalAiCallOptions {
  prompt: string;
  systemPrompt?: string;
  taskType?: string;
  temperature?: number;
  maxTokens?: number;
  providerId?: string;
}

export interface UniversalAiCallResult {
  text: string;
  providerUsed: string;
  modelUsed: string;
  latencyMs: number;
  success: boolean;
  error?: string;
}

export interface TestConnectionOptions {
  provider: string;
  displayName?: string;
  protocol?: AiProtocol;
  apiKey?: string;
  baseUrl?: string;
  modelName?: string;
}

/**
 * Normalizes model names for Google AI Studio
 */
function normalizeGeminiModel(modelName?: string): string {
  const clean = (modelName || "").trim().replace(/^models\//, "");
  if (!clean || clean === "gemini-1.5-flash" || clean === "gemini-pro" || clean === "gemini-2.5-flash") {
    // Current available active Gemini models on AI Studio
    return "gemini-3.6-flash";
  }
  return clean;
}

/**
 * Tests an AI model connection live with a lightweight test prompt
 */
export async function testAiConnection(config: TestConnectionOptions): Promise<{
  success: boolean;
  latencyMs: number;
  message: string;
  sampleOutput?: string;
}> {
  const startTime = Date.now();
  const apiKey = (config.apiKey || "").trim();
  const protocol = config.protocol || (config.provider === "GOOGLE" ? "GOOGLE_GEMINI" : "OPENAI_COMPATIBLE");

  if (!apiKey) {
    return {
      success: false,
      latencyMs: 0,
      message: "API Key is missing or empty.",
    };
  }

  try {
    if (protocol === "GOOGLE_GEMINI") {
      const model = normalizeGeminiModel(config.modelName || process.env.GEMINI_MODEL || "gemini-3.6-flash");
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Hello! Respond with 'AI Connection Successful' in 3 words." }] }],
          generationConfig: {
            maxOutputTokens: 200,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      });

      const latencyMs = Date.now() - startTime;
      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          latencyMs,
          message: data.error?.message || `Google API error: HTTP ${res.status}`,
        };
      }

      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "OK";
      return {
        success: true,
        latencyMs,
        message: `Successfully connected to Google Gemini (${model}) in ${latencyMs}ms!`,
        sampleOutput: reply,
      };
    }

    if (protocol === "ANTHROPIC") {
      const model = config.modelName || "claude-3-5-sonnet-20240620";
      const url = config.baseUrl || "https://api.anthropic.com/v1/messages";

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: 20,
          messages: [{ role: "user", content: "Respond with 'AI Connection Successful' in 3 words." }],
        }),
      });

      const latencyMs = Date.now() - startTime;
      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          latencyMs,
          message: data.error?.message || `Anthropic API error: HTTP ${res.status}`,
        };
      }

      const reply = data.content?.[0]?.text?.trim() || "OK";
      return {
        success: true,
        latencyMs,
        message: `Successfully connected to Anthropic Claude (${model}) in ${latencyMs}ms!`,
        sampleOutput: reply,
      };
    }

    // Default: OPENAI_COMPATIBLE (OpenAI, Groq, DeepSeek, Mistral, Together, OpenRouter, Ollama)
    let baseUrl = (config.baseUrl || "https://api.openai.com/v1").trim().replace(/\/+$/, "");
    if (!baseUrl.endsWith("/chat/completions")) {
      baseUrl = `${baseUrl}/chat/completions`;
    }

    const model = config.modelName || "gpt-4o-mini";

    const res = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: "Respond with 'AI Connection Successful' in 3 words." }],
        max_tokens: 20,
      }),
    });

    const latencyMs = Date.now() - startTime;
    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        latencyMs,
        message: data.error?.message || `API error: HTTP ${res.status}`,
      };
    }

    const reply = data.choices?.[0]?.message?.content?.trim() || "OK";
    return {
      success: true,
      latencyMs,
      message: `Successfully connected to ${config.displayName || "AI Model"} (${model}) in ${latencyMs}ms!`,
      sampleOutput: reply,
    };
  } catch (err: any) {
    return {
      success: false,
      latencyMs: Date.now() - startTime,
      message: err.message || "Failed to reach AI provider endpoint.",
    };
  }
}

/**
 * Universal AI Caller - Routes queries through assigned provider or default active model
 */
export async function callUniversalAi(options: UniversalAiCallOptions): Promise<UniversalAiCallResult> {
  const startTime = Date.now();
  const taskType = options.taskType || "GENERAL";
  const systemPrompt = options.systemPrompt || "You are DropAI Brain, an elite ecommerce intelligence copilot. Be concise, strategic, and data-driven.";
  const maxTokens = options.maxTokens || 2048;
  const temperature = options.temperature ?? 0.7;

  // 1. Resolve Provider & Model from DB or Env
  let activeProvider: any = null;
  let targetModel = "";

  try {
    // Check specific routing rule for task
    if (taskType && taskType !== "GENERAL") {
      const rule = await prisma.aiRoutingRule.findUnique({ where: { taskType } });
      if (rule && rule.isEnabled) {
        targetModel = rule.modelName;
        activeProvider = await prisma.aiProviderConfig.findUnique({
          where: { provider: rule.providerName },
        });
      }
    }

    // If no task rule or provider inactive, resolve default provider
    if (!activeProvider || activeProvider.status !== "ACTIVE") {
      activeProvider = await prisma.aiProviderConfig.findFirst({
        where: { isDefault: true, status: "ACTIVE" },
      });
    }

    // If still no default, pick any active provider with an API key
    if (!activeProvider) {
      activeProvider = await prisma.aiProviderConfig.findFirst({
        where: { status: "ACTIVE", apiKeyEncrypted: { not: null } },
        orderBy: { priority: "asc" },
      });
    }
  } catch (dbErr) {
    console.warn("Could not query AI provider config from DB, using env fallback:", dbErr);
  }

  // 2. Fallback to Env variables if no DB config
  const geminiEnvKey = process.env.GEMINI_API_KEY || "";
  const openaiEnvKey = process.env.OPENAI_API_KEY || "";

  // Prioritize Google Gemini if available in env and active
  const candidateList: Array<{
    protocol: AiProtocol;
    apiKey: string;
    baseUrl?: string;
    model: string;
    name: string;
  }> = [];

  if (activeProvider && activeProvider.apiKeyEncrypted) {
    let models: string[] = [];
    try {
      models = JSON.parse(activeProvider.modelsJson || "[]");
    } catch {
      models = [];
    }
    candidateList.push({
      protocol: (activeProvider.protocol as AiProtocol) || (activeProvider.provider === "GOOGLE" ? "GOOGLE_GEMINI" : "OPENAI_COMPATIBLE"),
      apiKey: activeProvider.apiKeyEncrypted,
      baseUrl: activeProvider.baseUrl || undefined,
      model: targetModel || models[0] || (activeProvider.provider === "GOOGLE" ? "gemini-3.6-flash" : "gpt-4o-mini"),
      name: activeProvider.displayName || activeProvider.provider,
    });
  }

  // Always add Google Gemini as robust candidate if key exists
  if (geminiEnvKey && !candidateList.some((c) => c.apiKey === geminiEnvKey)) {
    candidateList.push({
      protocol: "GOOGLE_GEMINI",
      apiKey: geminiEnvKey,
      model: process.env.GEMINI_MODEL || "gemini-3.6-flash",
      name: "Google Gemini 3.6 Flash",
    });
  }

  // Add OpenAI as candidate if key exists
  if (openaiEnvKey && !candidateList.some((c) => c.apiKey === openaiEnvKey)) {
    candidateList.push({
      protocol: "OPENAI_COMPATIBLE",
      apiKey: openaiEnvKey,
      baseUrl: "https://api.openai.com/v1",
      model: "gpt-4o-mini",
      name: "OpenAI GPT-4o Mini",
    });
  }

  // 3. Attempt candidates sequentially (automatic fallback)
  let lastError = "";
  for (const candidate of candidateList) {
    try {
      if (candidate.protocol === "GOOGLE_GEMINI") {
        const model = normalizeGeminiModel(candidate.model);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${candidate.apiKey}`;

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
            contents: [{ role: "user", parts: [{ text: options.prompt }] }],
            generationConfig: {
              temperature,
              maxOutputTokens: maxTokens,
              thinkingConfig: { thinkingBudget: 0 },
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (text) {
            return {
              text,
              providerUsed: candidate.name,
              modelUsed: model,
              latencyMs: Date.now() - startTime,
              success: true,
            };
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          lastError = errData.error?.message || `Google API error HTTP ${res.status}`;
          console.warn(`Provider ${candidate.name} failed, trying next fallback:`, lastError);
        }
      } else if (candidate.protocol === "OPENAI_COMPATIBLE") {
        let endpoint = (candidate.baseUrl || "https://api.openai.com/v1").trim().replace(/\/+$/, "");
        if (!endpoint.endsWith("/chat/completions")) {
          endpoint = `${endpoint}/chat/completions`;
        }

        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${candidate.apiKey}`,
          },
          body: JSON.stringify({
            model: candidate.model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: options.prompt },
            ],
            temperature,
            max_tokens: maxTokens,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const text = data.choices?.[0]?.message?.content || "";
          if (text) {
            return {
              text,
              providerUsed: candidate.name,
              modelUsed: candidate.model,
              latencyMs: Date.now() - startTime,
              success: true,
            };
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          lastError = errData.error?.message || `OpenAI-compatible error HTTP ${res.status}`;
          console.warn(`Provider ${candidate.name} failed, trying next fallback:`, lastError);
        }
      }
    } catch (callErr: any) {
      lastError = callErr.message || "Network error";
      console.warn(`Call to ${candidate.name} threw error:`, lastError);
    }
  }

  return {
    text: "",
    providerUsed: "NONE",
    modelUsed: "NONE",
    latencyMs: Date.now() - startTime,
    success: false,
    error: lastError || "No active AI providers available.",
  };
}
