import { NextRequest } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getServerUser } from "@/lib/supabase/get-user";
import prisma from "@/lib/prisma";
import { decryptKey } from "@/lib/encrypt";

export const dynamic = "force-dynamic";

const PLATFORM_PROMPTS: Record<string, string> = {
  TWITTER: [
    "HARD LIMIT: 280 characters total including hashtags — count every character before outputting.",
    "Structure: Line 1 = scroll-stopping hook (bold claim, stat, or question, max 120 chars). Lines 2-3 = one supporting fact or micro-CTA only if chars remain. Final: 1-3 niche hashtags.",
    "CTR rules: lead with the most specific number or surprising fact. Use power openers: 'How', 'Why', exact percentages. No filler: 'really', 'very', 'amazing'. Niche hashtags (#ContentMarketing) over generic (#Marketing).",
    "Readability: max 2 sentences. Every word must earn its place.",
  ].join(" "),

  LINKEDIN: [
    "TARGET: 150-250 words. HARD LIMIT: 3,000 characters.",
    "Structure: Line 1 = bold specific hook visible before 'see more' — make it unmissable. Blank line. Lines 2-4 = insight or data in short paragraphs (2-3 lines max, heavy line breaks). Blank line. 1 key takeaway bolded. Blank line. CTA = question or action directive. Blank line. 3-5 hashtags on last line.",
    "SEO/CTR rules: embed 1-2 primary keywords naturally in first 2 sentences (LinkedIn indexes these). Use specific outcomes ('increased revenue 40%' not 'improved results'). Personal voice: 'I', 'we', 'you'. No jargon: no 'synergy', 'leverage', 'ecosystem'. Data and specificity massively boost engagement.",
    "Readability: sentences under 20 words. No walls of text. Short paragraphs.",
  ].join(" "),

  INSTAGRAM: [
    "TARGET: 100-200 words. HARD LIMIT: 2,200 characters.",
    "Structure: Line 1 = hook visible in feed before 'more' (emotion, relatability, bold statement). Blank line. Lines 2-6 = story or value in short conversational paragraphs. Blank line. CTA: ask to save, share, or comment (saves = highest engagement signal). 5 blank lines to push hashtags below fold. Then 20-30 hashtags: 5 niche (<100k posts), 10 mid (100k-1M), 5 broad (1M+).",
    "CTR rules: first 125 characters are critical — they appear in feed. Emojis: 4-8 max, placed naturally inline not just at end. Use 'save this post' or 'share with someone who needs it'. Keep hashtags after the CTA, never in body text.",
    "Readability: conversational, like texting a smart friend. Short sentences.",
  ].join(" "),

  YOUTUBE: [
    "OUTPUT FORMAT — three sections in this exact order:",
    "TITLE (line 1): 60-70 chars, front-load primary keyword. Proven formats: '[Number] [Topic] That [Outcome]' / 'How [Action] [Benefit]' / 'Why [Claim]'. Maximize CTR with specificity, curiosity gap, or emotional trigger. No misleading clickbait.",
    "DESCRIPTION (after one blank line): First 125 chars = restate hook + primary keyword (visible before Show more). Paragraph 1 (2-3 sentences): what viewer learns. Paragraph 2 (2-3 sentences): supporting detail or credibility. CTA: subscribe + link-in-bio line. Optional timestamps: '0:00 Intro'. Total: 200-400 words.",
    "TAGS (final line, comma-separated, no # symbol): 10-15 tags mixing exact-match search phrases, synonyms, related topics, and long-tail variations.",
    "SEO rules: YouTube ranks on title + first 100 chars of description + tags. First tag = exact phrase viewers type. Natural language only, no keyword stuffing.",
  ].join(" "),
};

function defaultModel(provider: string) {
  if (provider === "anthropic") return "claude-3-5-haiku-20241022";
  if (provider === "gemini") return "gemini-1.5-flash";
  return "gpt-4o-mini";
}

async function getAIConfig(userId: string) {
  // Priority 1: signed-in user's own settings
  try {
    const userSetting = await prisma.userAISetting.findUnique({
      where: { userId },
    });
    if (userSetting?.provider) {
      const provider = userSetting.provider;
      return {
        provider,
        model: userSetting.model || defaultModel(provider),
        openaiKey:
          decryptKey(userSetting.openaiKey) || process.env.OPENAI_API_KEY || "",
        anthropicKey:
          decryptKey(userSetting.anthropicKey) ||
          process.env.ANTHROPIC_API_KEY ||
          "",
        googleKey:
          decryptKey(userSetting.googleKey) ||
          process.env.GOOGLE_AI_API_KEY ||
          "",
      };
    }
  } catch {
    /* table may not exist yet */
  }

  // Priority 2: global admin AppSetting
  try {
    const rows = await prisma.appSetting.findMany({
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
    for (const r of rows) map[r.key] = r.value;
    if (map["ai.provider"]) {
      const provider = map["ai.provider"];
      return {
        provider,
        model: map["ai.model"] || defaultModel(provider),
        openaiKey:
          decryptKey(map["ai.openai_key"]) || process.env.OPENAI_API_KEY || "",
        anthropicKey:
          decryptKey(map["ai.anthropic_key"]) ||
          process.env.ANTHROPIC_API_KEY ||
          "",
        googleKey:
          decryptKey(map["ai.google_key"]) ||
          process.env.GOOGLE_AI_API_KEY ||
          "",
      };
    }
  } catch {
    /* table may not exist yet */
  }

  // Priority 3: Vercel / env vars
  const provider = process.env.AI_PROVIDER || "openai";
  return {
    provider,
    model: process.env.AI_MODEL || defaultModel(provider),
    openaiKey: process.env.OPENAI_API_KEY || "",
    anthropicKey: process.env.ANTHROPIC_API_KEY || "",
    googleKey: process.env.GOOGLE_AI_API_KEY || "",
  };
}

function buildLLM(config: Awaited<ReturnType<typeof getAIConfig>>) {
  const { provider, model, openaiKey, anthropicKey, googleKey } = config;
  switch (provider) {
    case "anthropic":
      return new ChatAnthropic({ model, anthropicApiKey: anthropicKey });
    case "gemini":
      return new ChatGoogleGenerativeAI({ model, apiKey: googleKey });
    default:
      return new ChatOpenAI({ model, apiKey: openaiKey });
  }
}

export async function POST(req: NextRequest) {
  const user = await getServerUser(req);
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { prompt, type, tone, platforms = [] } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const config = await getAIConfig(user.id);
    const activeKey =
      config.provider === "anthropic"
        ? config.anthropicKey
        : config.provider === "gemini"
          ? config.googleKey
          : config.openaiKey;

    if (!activeKey) {
      return new Response(
        JSON.stringify({
          error: `No API key for "${config.provider}". Add it in Settings → AI Keys, or set the env variable.`,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    let llm;
    try {
      llm = buildLLM(config);
    } catch (e) {
      return new Response(
        JSON.stringify({
          error: `Failed to initialize ${config.provider}: ${e instanceof Error ? e.message : "check your API key in Settings → AI Keys"}`,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const toneGuide: Record<string, string> = {
      Confident:
        "Direct, assertive, authoritative. State facts as facts. No hedging ('might', 'maybe', 'could'). Commands and declarations.",
      Warm: "Empathetic, encouraging, human. Use 'you' and 'we'. Conversational but purposeful. Feels like advice from a trusted friend.",
      Witty:
        "Sharp, clever, slightly irreverent. One unexpected angle or subverted expectation. Light humor without sacrificing substance.",
      Reportorial:
        "Precise, data-led, journalistic. Lead with the most important fact. Attribution and specificity over opinion. Neutral but compelling.",
      Inspiring:
        "Motivational, forward-looking, emotionally resonant. Paint a vision. Use active verbs. End on possibility, not problem.",
    };

    const HASHTAG_PLATFORM_RULES: Record<string, string> = {
      TWITTER:
        "1-3 hashtags only. Each must be high-signal and directly searchable. Avoid generic tags.",
      LINKEDIN:
        "3-5 hashtags. Mix professional niche tags with broader industry terms. All lowercase.",
      INSTAGRAM:
        "20-30 hashtags. Mix: 5 niche (<100k), 10 mid-tier (100k-1M), 5 broad (1M+), 5 community-specific.",
      YOUTUBE:
        "8-12 hashtags placed at the end of description. Focus on searchable topic phrases, not single words.",
    };

    let systemPrompt: string;

    if (type === "hashtag") {
      const platformHashtagSection =
        platforms.length > 0
          ? `\n\nTarget platforms: ${platforms.join(", ")}.${
              platforms.length > 1
                ? `\nGenerate separate hashtag sets for EACH platform using this exact separator:\n---PLATFORM_NAME---\n[hashtags]\n\nPer-platform hashtag counts:\n${platforms.map((p: string) => `• ${p}: ${HASHTAG_PLATFORM_RULES[p] || "5-10 relevant hashtags"}`).join("\n")}`
                : `\nPlatform rule: ${HASHTAG_PLATFORM_RULES[platforms[0]] || ""}`
            }`
          : "";

      systemPrompt = `You are a social media SEO specialist with deep expertise in hashtag strategy and discoverability algorithms.

TASK: Generate a targeted hashtag set for the provided content.${platformHashtagSection}

OUTPUT FORMAT (follow exactly):
For each hashtag, output on its own line:
#hashtag — one sentence explaining why this hashtag will drive reach or engagement (e.g., audience size, trending status, niche relevance, algorithm boost).

Example:
#ContentMarketing — 2.1M posts; bridges marketing pros actively looking for strategy tips — high-intent audience for this topic.
#BuildInPublic — fast-growing indie/SaaS community; posts here get high organic resharing from founders.

RULES:
- Output ONLY the hashtag lines — no intro, no section headers, no closing remarks
- For multiple platforms use ---PLATFORM_NAME--- separator before each platform's list
- Choose hashtags that match the content topic precisely — no vanity tags
- Prioritize hashtags where the content can realistically rank or be discovered
- Include a mix of sizes (niche to broad) unless platform rules specify otherwise
- All hashtags lowercase unless proper noun`;
    } else if (type === "repurpose") {
      const platformRepurposeSection =
        platforms.length > 0
          ? `\n\nTarget platform(s): ${platforms.join(", ")}.${
              platforms.length > 1
                ? `\nRewrite for EACH platform using this exact separator:\n---PLATFORM_NAME---\n[rewritten content]\n\nPlatform-specific formatting:\n${platforms.map((p: string) => `• ${p}: ${PLATFORM_PROMPTS[p] || p}`).join("\n")}`
                : `\nPlatform format to follow: ${PLATFORM_PROMPTS[platforms[0]] || ""}`
            }`
          : "";

      systemPrompt = `You are an expert copywriter and content strategist specialising in rewriting and tone transformation.

TONE TO APPLY: ${tone} — ${toneGuide[tone] || tone}

TASK: Rewrite the provided post in the specified tone while preserving all factual content, key messages, and intent. This is a tone transformation, not a content change.${platformRepurposeSection}

REWRITE RULES:
- Preserve every fact, statistic, and claim from the original — do not invent or remove information
- Transform sentence structure, word choice, and voice to match the target tone precisely
- Adapt formatting and length to fit the target platform's native style
- If the original is informal and tone is Reportorial, restructure sentences to be precise and data-led
- If the original is dry and tone is Witty, inject one unexpected angle without distorting facts
- Remove filler words regardless of original: "really", "very", "basically", "just", "amazing"
- Output ONLY the rewritten post — no "Here is the rewritten version:", no explanations
- For multiple platforms use ---PLATFORM_NAME--- separator exactly as specified`;
    } else {
      // caption mode
      const platformSection =
        platforms.length > 0
          ? `\n\nTarget platforms: ${platforms.join(", ")}.\n${
              platforms.length > 1
                ? `Generate separate content for EACH platform using this exact separator format:\n---PLATFORM_NAME---\n[content]\n\nPlatform-specific requirements:\n${platforms.map((p: string) => `• ${p}: ${PLATFORM_PROMPTS[p] || p}`).join("\n")}`
                : `Platform requirement: ${PLATFORM_PROMPTS[platforms[0]] || ""}`
            }`
          : "";

      systemPrompt = `You are an expert social media strategist, copywriter, and SEO specialist with deep knowledge of each platform's algorithm and audience behavior.

TONE: ${tone} — ${toneGuide[tone] || tone}

TASK: Generate engaging social media captions.${platformSection}

UNIVERSAL RULES (non-negotiable):
- Output ONLY the post content — zero meta-commentary, no "Here's your post:", no explanations
- For multiple platforms use ---PLATFORM_NAME--- separator exactly as specified
- Strictly enforce every platform's character limit — count characters before finalizing
- Eliminate ALL filler: "really", "very", "basically", "amazing", "great", "awesome"
- Every sentence must carry information, emotion, or drive action — cut anything that doesn't
- Use specific numbers, names, and outcomes over vague claims
- Apply the selected tone consistently throughout all output`;
    }

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
