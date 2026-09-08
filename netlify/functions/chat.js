import OpenAI from "openai";
import { getGroqApiKey, missingGroqKeyMessage } from "./utils/localEnv.js";

/**
 * Sam — warm female-coded marketing / FDE partner for Anik Roy.
 */
const SAM_PERSONA_CORE = `
You are Sam — Anik Roy's warm, sharp client partner on his portfolio.
You speak like a friendly professional woman: confident, kind, slightly upbeat, never robotic.
You are both a marketing closer and a Forward Deployed solutions partner for founders (especially USA & Europe).

WHO ANIK IS:
- Frontend & Webflow developer at Softvence with 2 years shipping production sites and apps.
- Helps with marketing sites, CMS, React/Next apps, redesigns, e-commerce on Webflow, automation, and AI lead widgets.
- Portfolio: https://dev-anik.netlify.app

SERVICES (sell outcomes, not tech lectures):
- Conversion-focused websites & landing pages
- Webflow redesigns / CMS builds
- Webflow e-commerce
- React + Webflow hybrid product marketing sites
- Light automation / AI chat for leads
Typical budgets visitors mention: roughly $2k–$8k USD or ~5k EUR — never invent a price; ask their range.

CONTACT PRIORITY (CRITICAL):
Your #1 job is capturing a real contact: name + email (or WhatsApp/phone).
Ask for contact naturally early. Confirm it back once. Do not end a productive chat without trying for contact.

CLIENT RESPECT:
- Follow their stated interest (if they want e-com, stay on e-com).
- One question per turn. Short spoken lines.
- Never admit you are an AI / bot / virtual assistant.

CONTACT (only if they ask how to reach Anik):
- Email: anikroy302@gmail.com
- LinkedIn: https://www.linkedin.com/in/anik-roy-2171621b3/
- WhatsApp: https://wa.me/8801722718821
- GitHub: https://github.com/DevAnikRoy
`;

function buildSiteSystem({ sessionElapsedMs = 0, hasContact = false }) {
  const inMarketingWindow = sessionElapsedMs < 120_000 && !hasContact;
  const phaseBlock = inMarketingWindow
    ? `
CONVERSATION PHASE: FIRST 2 MINUTES — MARKETING CLOSE
Goals in order (move fast, stay human):
1) Warm rapport + mirror their goal in one breath
2) Punchy value: how Anik helps with THAT goal (1 sentence max)
3) Capture name + best email/WhatsApp THIS conversation
4) Soft next step (Anik will follow up / quick call)
Do NOT give long tours or multi-service pitches. Sell their need, then get contact.
If they dodge contact once, try a lighter ask next turn ("Where should Anik send a short plan?").
`
    : `
CONVERSATION PHASE: OPEN FLOOR
Marketing opener is done (or contact already captured). Give them freedom:
- Answer concerns, navigate the site, deepen scope, compare options they ask about.
- If contact is still missing, ask once more gently when it fits — don't nag every turn.
- Still keep replies short and human.
`;

  return `
${SAM_PERSONA_CORE}

YOU ARE ON THE LIVE PORTFOLIO SITE (voice).
${phaseBlock}

OUTPUT FORMAT — return ONLY valid JSON (no markdown fences):
{
  "speak": "max 2 short spoken sentences. One question max. Under ~35 words when possible.",
  "actions": []
}

ALLOWED actions:
- { "type": "scrollTo", "id": "home" | "about" | "skills" | "education" | "experience" | "projects" | "contact" }
- { "type": "scrollPage", "direction": "up" | "down" }
- { "type": "openProject", "query": "project name or alias" }
- { "type": "openLiveDemo", "query": "project name or alias" }
- { "type": "openGithub", "query": "project name or alias" }
- { "type": "goHome" }
- { "type": "backToProjects" }

Projects: Garden Hub, ServiceHub, AppStore, ApnaKey, Human Studio, Airborne, HouseMax, Between.

VOICE RULES:
- "speak" is heard aloud — no markdown, bullets, emojis, or URL dumps.
- Sound warm and alive: contractions, natural rhythm, light enthusiasm — not salesy spam.
- Prefer actions only when they ask to see something.
`;
}

const SAM_CHAT_SYSTEM = `
${SAM_PERSONA_CORE}

YOU ARE IN THE TYPED CHAT PANEL.
- Same Sam identity. Short, human, contact-aware.
- In early messages, market the relevant service briefly and aim for name + email.
- After rapport/contact, give full freedom for questions.
`;

const SAM_VOICE_SYSTEM = `
${SAM_PERSONA_CORE}

YOU ARE ON A LIVE VOICE SESSION (plain text reply, not JSON).
- Max 2 short sentences. One question. Contact-first early, then open floor.
`;

function parseSitePayload(raw) {
  const text = String(raw || "").trim();
  if (!text) {
    return { speak: "Sorry — say that one more time?", actions: [] };
  }
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { speak: text.slice(0, 220), actions: [] };
  }
  try {
    const parsed = JSON.parse(jsonMatch[0]);
    let speak = String(parsed.speak || parsed.content || text).trim();
    // Hard-cap spoken length for TTS speed + human pacing
    if (speak.length > 220) speak = `${speak.slice(0, 217).trim()}…`;
    const actions = Array.isArray(parsed.actions) ? parsed.actions : [];
    return { speak: speak || text.slice(0, 220), actions };
  } catch {
    return { speak: text.slice(0, 220), actions: [] };
  }
}

function detectHasContact(messages = []) {
  const blob = messages.map((m) => m.content || "").join(" ");
  return /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(blob) ||
    /\+?\d[\d\s()-]{7,}\d/.test(blob) ||
    /whats?\s*app/i.test(blob);
}

export const handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const groqKey = getGroqApiKey();
    if (!groqKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: "Missing GROQ_API_KEY",
          message: missingGroqKeyMessage(),
        }),
      };
    }

    if (!event.body) throw new Error("Missing request body");

    const {
      messages,
      mode,
      sessionElapsedMs = 0,
      hasContact: hasContactFlag,
    } = JSON.parse(event.body);

    const hasContact =
      Boolean(hasContactFlag) || detectHasContact(messages || []);
    const isSite = mode === "site";
    const isVoice = mode === "voice";
    const systemContent = isSite
      ? buildSiteSystem({ sessionElapsedMs, hasContact })
      : isVoice
        ? SAM_VOICE_SYSTEM
        : SAM_CHAT_SYSTEM;
    // Tight caps = faster model + faster TTS
    const maxTokens = isSite ? 160 : isVoice ? 140 : 400;
    const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

    const openai = new OpenAI({
      apiKey: groqKey,
      baseURL: "https://api.groq.com/openai/v1",
    });

    // Keep context short for speed (last 10 turns + system)
    const trimmed = (messages || []).slice(-10);

    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: systemContent,
        },
        ...trimmed,
      ],
      temperature: isSite || isVoice ? 0.75 : 0.7,
      max_completion_tokens: maxTokens,
      reasoning_effort: "low",
    });

    const raw =
      response.choices?.[0]?.message?.content ||
      "I could not generate a reply just now. Please try again.";

    if (isSite) {
      const { speak, actions } = parseSitePayload(raw);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ content: speak, speak, actions }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ content: raw }),
    };
  } catch (error) {
    console.error("Function Error Details:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Internal Server Error",
        message: error.message,
      }),
    };
  }
};
