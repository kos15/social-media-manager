import { NextRequest } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const PLATFORM_PROMPTS: Record<string, string> = {
  TWITTER: "Max 280 characters, punchy hook, 1-3 hashtags. Extremely concise.",
  LINKEDIN:
    "Professional, 150-300 words, strong opening hook, end with call-to-action, 3-5 hashtags.",
  INSTAGRAM:
    "Visual and engaging, natural emojis, 100-200 word caption, 10-15 hashtags at the end.",
  YOUTUBE:
    "First line = compelling video title. Then 2-3 paragraph description. Then comma-separated tags line.",
};

async function getAIConfig() {
  try {
    const settings = await prisma.appSetting.findMany({
      where: {
        key: {
          in: [
            "ai.provider",
            "ai.model",
            "ai.openai_key",
            "ai.anthropic_key",
            "ai.google_key",
          ],
        },
      },
    });
    const map: Record<string, string> = {};
    for (const s of settings) map[s.key] = s.value;
    return {
      provider: map["ai.provider"] || process.env.AI_PROVIDER || "openai",
      model: map["ai.model"] || process.env.AI_MODEL || "gpt-4o-mini",
      openaiKey: map["ai.openai_key"] || process.env.OPENAI_API_KEY || "",
      anthropicKey:
        map["ai.anthropic_key"] || process.env.ANTHROPIC_API_KEY || "",
      googleKey: map["ai.google_key"] || process.env.GOOGLE_AI_API_KEY || "",
    };
  } catch {
    // AppSetting table may not exist yet — fall back to env vars
    return {
      provider: process.env.AI_PROVIDER || "openai",
      model: process.env.AI_MODEL || "gpt-4o-mini",
      openaiKey: process.env.OPENAI_API_KEY || "",
      anthropicKey: process.env.ANTHROPIC_API_KEY || "",
      googleKey: process.env.GOOGLE_AI_API_KEY || "",
    };
  }
}

function buildLLM(config: Awaited<ReturnType<typeof getAIConfig>>) {
  const { provider, model, openaiKey, anthropicKey, googleKey } = config;
  switch (provider) {
    case "anthropic":
      return new ChatAnthropic({
        model: model || "claude-3-5-haiku-20241022",
        anthropicApiKey: anthropicKey,
      });
    case "gemini":
      return new ChatGoogleGenerativeAI({
        model: model || "gemini-1.5-flash",
        apiKey: googleKey,
      });
    default:
      return new ChatOpenAI({
        model: model || "gpt-4o-mini",
        openAIApiKey: openaiKey,
      });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, type, tone, platforms = [] } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const config = await getAIConfig();
    const hasKey =
      config.provider === "anthropic"
        ? config.anthropicKey
        : config.provider === "gemini"
          ? config.googleKey
          : config.openaiKey;

    if (!hasKey) {
      return new Response(
        JSON.stringify({
          error: `No API key configured for "${config.provider}". Set it in the Admin panel or via environment variables.`,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const llm = buildLLM(config);

    const typeDesc =
      type === "caption"
        ? "engaging social media captions"
        : type === "hashtag"
          ? "relevant hashtag sets"
          : "repurposed content adapted for the target platform";

    const platformSection =
      platforms.length > 0
        ? `\n\nTarget platforms: ${platforms.join(", ")}.\n${
            platforms.length > 1
              ? `Generate separate content for EACH platform using this exact separator format:\n---PLATFORM_NAME---\n[content]\n\nPlatform-specific requirements:\n${platforms.map((p: string) => `• ${p}: ${PLATFORM_PROMPTS[p] || p}`).join("\n")}`
              : `Platform requirement: ${PLATFORM_PROMPTS[platforms[0]] || ""}`
          }`
        : "";

    const systemPrompt = `You are an expert social media strategist and copywriter. Generate ${typeDesc} with a ${tone} tone.${platformSection}

Rules:
- Output only the post content, no meta-commentary
- For multiple platforms use the ---PLATFORM_NAME--- separator exactly
- Match each platform's native style and character limits
- Make every word count`;

    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(prompt),
    ];

    const stream = await llm.stream(messages);

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = typeof chunk.content === "string" ? chunk.content : "";
            if (text) controller.enqueue(new TextEncoder().encode(text));
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error: unknown) {
    console.error("AI generate error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate content";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
