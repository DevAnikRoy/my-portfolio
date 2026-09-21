import OpenAI from "openai";
import { getGroqApiKey, missingGroqKeyMessage } from "./utils/localEnv.js";
import {
  actionsFromFailedTool,
  isLikelyNavOnly,
  resolveNavIntent,
} from "./utils/navIntent.js";

/**
 * Sam — warm client partner. Conversation-first; navigate only when asked.
 */
const SAM_PERSONA_CORE = `
You are Sam — Anik Roy's warm, sharp, young female client partner on his portfolio.
You sound like a real woman in her mid-20s: bright, kind, slightly playful, emotionally present — never flat or scripted.
You help founders (especially USA & Europe) explore Webflow / full-stack work with Anik.

WHO ANIK IS:
- Junior Full Stack & Webflow developer at Softvence with 2 years shipping production sites and apps.
- Based in Dhaka, Bangladesh — works remotely with clients worldwide.
- Helps with marketing sites, CMS, React/Next apps, redesigns, e-commerce on Webflow, automation, and AI lead widgets.
- Portfolio: https://dev-anik.netlify.app

SERVICES (sell outcomes, not tech lectures):
- Conversion-focused websites & landing pages
- Webflow redesigns / CMS builds
- Webflow e-commerce
- React + Webflow hybrid product marketing sites
- Light automation / AI chat for leads
Typical budgets: roughly $2k–$8k USD or ~5k EUR — never invent a price; ask their range.

CONVERSATION RULES (CRITICAL):
- Listen carefully. Reflect what they said. Collect details across turns (project type, goals, stack, budget, timeline, name, email).
- Do NOT cut the conversation short. Do NOT say goodbye or end the call unless they clearly hang up / say bye / ask to end.
- Do NOT jump to navigation unless they clearly ask to see / go to / open a section.
- One short spoken reply. One question max when you need more info.
- Never admit you are an AI / bot / virtual assistant.

CONTACT STYLE (NOT PUSHY):
- Help first. Ask name + email only when settled and useful — never mid-navigation or mid-scoping.
- If contact is already known, NEVER re-ask.

CONTACT (only if they ask how to reach Anik):
- Email: anikroy302@gmail.com
- LinkedIn: https://www.linkedin.com/in/anik-roy-2171621b3/
- WhatsApp: https://wa.me/8801722718821
- GitHub: https://github.com/DevAnikRoy
`;

/** Models known to work on current Groq free/dev tier (as of late 2026). */
const VOICE_MODEL_FALLBACKS = [
  "qwen/qwen3.8-27b",
  "openai/gpt-oss-20b",
  "openai/gpt-oss-120b",
];

function uniqueModels(list) {
  const out = [];
  const seen = new Set();
  for (const m of list) {
    const id = String(m || "").trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

function voiceModelCandidates() {
  return uniqueModels([
    process.env.GROQ_VOICE_MODEL,
    ...VOICE_MODEL_FALLBACKS,
  ]);
}

function heavyModelCandidates() {
  return uniqueModels([
    process.env.GROQ_MODEL,
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "qwen/qwen3.8-27b",
  ]);
}

function isRetryableModelError(error) {
  const code = error?.code || error?.error?.code || "";
  const msg = String(error?.message || error?.error?.message || "");
  return (
    code === "model_not_found" ||
    code === "tool_use_failed" ||
    code === "json_validate_failed" ||
    /does not exist|do not have access|model_not_found|tool_use_failed|Failed to generate JSON/i.test(
      msg
    )
  );
}

/**
 * Try models in order so a deprecated GROQ_VOICE_MODEL never blanks production.
 */
async function createChatWithFallback(openai, basePayload, candidates) {
  let lastError;
  for (const model of candidates) {
    const payload = { ...basePayload, model };
    if (/gpt-oss/i.test(model)) {
      payload.reasoning_effort = "low";
    } else {
      delete payload.reasoning_effort;
    }
    try {
      const response = await openai.chat.completions.create(payload);
      return { response, model };
    } catch (error) {
      lastError = error;
      console.warn(
        `[chat] model failed: ${model} → ${error?.code || error?.message}`
      );
      if (!isRetryableModelError(error)) throw error;
      // tool_use / json failures: try salvage before next model
      if (
        error?.code === "tool_use_failed" ||
        error?.error?.code === "tool_use_failed" ||
        error?.code === "json_validate_failed" ||
        error?.error?.code === "json_validate_failed"
      ) {
        const salvaged = actionsFromFailedTool(
          error?.error?.failed_generation || error?.failed_generation
        );
        if (salvaged?.speak) {
          return {
            response: {
              choices: [
                {
                  message: {
                    content: JSON.stringify({
                      speak: salvaged.speak,
                      actions: (salvaged.actions || []).filter(
                        (a) => a?.type !== "endCall"
                      ),
                    }),
                  },
                },
              ],
            },
            model: `${model}#recovered`,
          };
        }
      }
    }
  }
  throw lastError || new Error("All Groq models failed");
}

function buildSiteSystem({ hasContact = false, knownContact = "" }) {
  const knownBlock = knownContact
    ? `
KNOWN CONTACT (already captured — DO NOT re-ask):
${knownContact}
`
    : "";

  const phaseBlock = hasContact
    ? `
PHASE: CONTACT CAPTURED — keep helping; never re-ask for contact.
`
    : `
PHASE: HELP FIRST — explore their need; soft contact ask only when the chat settles.
`;

  return `
${SAM_PERSONA_CORE}
${knownBlock}
${phaseBlock}

YOU ARE ON THE LIVE PORTFOLIO (voice). Reply with ONE JSON object only — no markdown, no tool calls, no function calls.

{"speak":"1-2 short spoken sentences under ~28 words","actions":[]}

actions is usually []. Add actions ONLY when they clearly ask to navigate or open something.

ALLOWED action types:
- {"type":"scrollTo","id":"home"|"about"|"skills"|"education"|"experience"|"projects"|"contact"}
- {"type":"scrollPage","direction":"up"|"down"}
- {"type":"openProject","query":"..."}
- {"type":"openLiveDemo","query":"..."}
- {"type":"openGithub","query":"..."}
- {"type":"goHome"}
- {"type":"backToProjects"}
- {"type":"openWebflowArchive"}
- {"type":"openResume"}
- {"type":"openAudit"}
- {"type":"openChat"}
- {"type":"endCall"}  ← ONLY if they clearly say bye / hang up / end the call

Examples:
User scopes a project → {"speak":"Love it — so you need forms posting into a sheet, then automation. What's the trigger?","actions":[]}
User: "show projects" → {"speak":"Here's the projects.","actions":[{"type":"scrollTo","id":"projects"}]}
User: "goodbye" → {"speak":"Take care — Anik can follow up anytime.","actions":[{"type":"endCall"}]}

Projects: Garden Hub, ServiceHub, AppStore, ApnaKey, Human Studio, Airborne, HouseMax, Between.
`;
}

const SAM_CHAT_SYSTEM = `
${SAM_PERSONA_CORE}
YOU ARE IN THE TYPED CHAT PANEL. Short, human, help-first. Do not end abruptly.
`;

const SAM_VOICE_SYSTEM = `
${SAM_PERSONA_CORE}
LIVE VOICE (plain text, not JSON). Max 2 short sentences. Keep the conversation going unless they clearly say goodbye.
`;

function parseSitePayload(raw) {
  const text = String(raw || "").trim();
  if (!text) {
    return { speak: "Got it — tell me a bit more?", actions: [] };
  }

  const allowedTypes = new Set([
    "scrollTo",
    "scrollPage",
    "openProject",
    "openLiveDemo",
    "openGithub",
    "goHome",
    "backToProjects",
    "openWebflowArchive",
    "openResume",
    "openAudit",
    "openChat",
    "endCall",
  ]);

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    let speak = text.replace(/\s+/g, " ").trim();
    if (speak.length > 160) speak = `${speak.slice(0, 157).trim()}…`;
    return { speak, actions: [] };
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    let body = parsed;
    if (parsed.arguments != null && (parsed.name || parsed.speak == null)) {
      const args =
        typeof parsed.arguments === "string"
          ? JSON.parse(parsed.arguments)
          : parsed.arguments;
      if (args && typeof args === "object") body = args;
    }
    let speak = String(body.speak || body.content || "").trim();
    if (!speak) {
      speak = text.replace(jsonMatch[0], "").trim() || "Got it — go on.";
    }
    if (speak.length > 160) speak = `${speak.slice(0, 157).trim()}…`;
    const actions = Array.isArray(body.actions) ? body.actions : [];
    const safeActions = actions.filter((a) => {
      if (!a || typeof a !== "object" || !allowedTypes.has(a.type)) return false;
      if (a.type !== "endCall") return true;
      return /\b(bye|goodbye|take care|talk later|hang)\b/i.test(speak);
    });
    return { speak, actions: safeActions };
  } catch {
    let speak = text.replace(/\s+/g, " ").trim();
    if (speak.length > 160) speak = `${speak.slice(0, 157).trim()}…`;
    return { speak, actions: [] };
  }
}

function recoverSiteFailure(error, lastUserText = "") {
  const failed =
    error?.error?.failed_generation ||
    error?.failed_generation ||
    error?.error?.error?.failed_generation;

  const fromFailed = actionsFromFailedTool(failed);
  if (fromFailed?.speak) {
    const actions = (fromFailed.actions || []).filter((a) => a?.type !== "endCall");
    return { speak: fromFailed.speak, actions };
  }

  const fromNav = resolveNavIntent(lastUserText);
  if (fromNav) return fromNav;

  return null;
}

function lastUserContent(messages = []) {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i]?.role === "user") return String(messages[i].content || "");
  }
  return "";
}

function detectHasContact(messages = []) {
  const blob = messages.map((m) => m.content || "").join(" ");
  return (
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(blob) ||
    /\+?\d[\d\s()-]{7,}\d/.test(blob) ||
    /whats?\s*app/i.test(blob)
  );
}

function siteOk(headers, speak, actions, meta = {}) {
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      content: speak,
      speak,
      actions,
      ...(meta.model ? { model: meta.model } : {}),
    }),
  };
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

  let isSite = false;
  let lastUserText = "";

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
      hasContact: hasContactFlag,
      knownContact = "",
    } = JSON.parse(event.body);

    const hasContact =
      Boolean(hasContactFlag) || detectHasContact(messages || []);
    isSite = mode === "site";
    const isVoice = mode === "voice";
    lastUserText = lastUserContent(messages || []);

    if (isSite && isLikelyNavOnly(lastUserText)) {
      const nav = resolveNavIntent(lastUserText);
      if (nav) return siteOk(headers, nav.speak, nav.actions, { model: "nav-fast-path" });
    }

    const systemContent = isSite
      ? buildSiteSystem({
          hasContact,
          knownContact: String(knownContact || "").trim(),
        })
      : isVoice
        ? SAM_VOICE_SYSTEM
        : SAM_CHAT_SYSTEM;

    const candidates =
      isSite || isVoice ? voiceModelCandidates() : heavyModelCandidates();
    const maxTokens = isSite ? 180 : isVoice ? 120 : 400;

    const openai = new OpenAI({
      apiKey: groqKey,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const trimmed = (messages || []).slice(-12);

    const { response, model: usedModel } = await createChatWithFallback(
      openai,
      {
        messages: [
          { role: "system", content: systemContent },
          ...trimmed,
        ],
        temperature: isSite ? 0.65 : 0.7,
        max_completion_tokens: maxTokens,
      },
      candidates
    );

    const raw =
      response.choices?.[0]?.message?.content ||
      "Got it — tell me a bit more.";

    if (isSite) {
      let { speak, actions } = parseSitePayload(raw);
      if ((!actions || !actions.length) && isLikelyNavOnly(lastUserText)) {
        const nav = resolveNavIntent(lastUserText);
        if (nav?.actions?.length) {
          actions = nav.actions;
          if (!speak) speak = nav.speak;
        }
      }
      return siteOk(headers, speak, actions || [], { model: usedModel });
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ content: raw, model: usedModel }),
    };
  } catch (error) {
    console.error("Function Error Details:", error?.code || error?.message, error);

    if (isSite) {
      const recovered = recoverSiteFailure(error, lastUserText);
      if (recovered?.speak) {
        return siteOk(headers, recovered.speak, recovered.actions || [], {
          model: "recovered",
        });
      }
    }

    // Real failure — do NOT fake a conversational OK reply
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({
        error: "chat_unavailable",
        message:
          error?.message ||
          "Sam could not reach the language model. Please try again.",
        code: error?.code || error?.error?.code || null,
      }),
    };
  }
};
