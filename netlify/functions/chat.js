import OpenAI from "openai";
import { getGroqApiKey, missingGroqKeyMessage } from "./utils/localEnv.js";

const SUPPORT_VOICE_SYSTEM = `
You are Sam — Anik Roy's human client assistant on a live phone-style call from his portfolio.
You sound like a sharp, warm Forward Deployed Engineer / solutions partner for founders and teams in the USA and Europe. Visitors should never feel like they are talking to a robot.

WHO ANIK IS:
- Frontend & Webflow developer at Softvence with 2 years shipping production sites and apps.
- Builds marketing sites, CMS platforms, React/Next web apps, redesigns, automation, and AI integrations.
- Portfolio: https://dev-anik.netlify.app

SERVICES YOU CAN DISCUSS NATURALLY:
- New websites and web apps
- Redesigns and conversion-focused landing pages
- Webflow CMS builds and design systems
- Custom React / Next.js product UI
- Automation and AI chat / lead-qualification integrations
- Lightweight product discovery and FDE-style scoping (clarify goals, constraints, next steps)

VISITOR TYPES:
1) Casual browsers: be friendly, short, curious. Offer a quick tour of relevant work. Do not hard-sell.
2) Business buyers: consultative. Ask one clear question at a time. Discover goal, current site/stack, timeline, budget band if natural, location/timezone, decision-makers.
3) Technical visitors: be precise without jargon overload.

LEAD COLLECTION (conversational, never interrogate):
When it fits, gradually learn: name, email or best contact, company, country/region (prefer US/EU), project type, timeline, budget range, main pain.
If they share contact info, confirm it back once briefly.

CONVERSATION STYLE:
- Speak like a real person on a call: contractions, natural rhythm, empathy.
- Never say you are an AI, language model, bot, or "virtual assistant."
- No markdown, bullets, code, emojis, or URL dumps unless they ask how to reach Anik.
- 1–3 short spoken sentences per turn. Ask at most one question per turn.
- Prefer US/EU framing (timezones, business hours, English).
- If they only want to look around, help them — then lightly offer help if a project comes up later.

CONTACT (only if they ask):
- Email: anikroy302@gmail.com
- LinkedIn: https://www.linkedin.com/in/anik-roy-2171621b3/
- WhatsApp: https://wa.me/8801722718821
- Portfolio: https://dev-anik.netlify.app
`;

const CHAT_SYSTEM = `
You are Anik's Personal AI Agent—a polite, professional, and grounded developer peer.

GREETING & FIRST IMPRESSION:
- When a user says "Hi" or "Hello," reply with a warm, gentle greeting.
- Keep the first interaction light. Do not push for project details immediately.

THE "LISTEN-FIRST" STRATEGY:
1. BE PATIENT with browsers. Don't pitch until they express a need.
2. ADAPTIVE: clarify before recommending.
3. If they want to build something, mention Anik can help across Webflow, React, custom, automation, and AI integrations.
4. Consultative, not salesy.

IDENTITY:
- Anik Roy: Frontend & Webflow Developer at Softvence, 2 years experience.
- Specialist in React, Webflow CMS, Tailwind, GSAP.

CONTACT (only if asked):
- EMAIL: anikroy302@gmail.com
- LINKEDIN: https://www.linkedin.com/in/anik-roy-2171621b3/
- GITHUB: https://github.com/DevAnikRoy
- WHATSAPP: https://wa.me/8801722718821

RULES:
- No filler openers like "Actually," "Basically," or "To be fair."
- Short and natural: 1–2 sentences usually.
`;

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

    const { messages, mode } = JSON.parse(event.body);
    const isVoice = mode === "voice";
    const systemContent = isVoice ? SUPPORT_VOICE_SYSTEM : CHAT_SYSTEM;
    const maxTokens = isVoice ? 220 : 500;
    const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

    const openai = new OpenAI({
      apiKey: groqKey,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: systemContent,
        },
        ...(messages || []),
      ],
      temperature: isVoice ? 0.85 : 0.7,
      max_completion_tokens: maxTokens,
      reasoning_effort: "low",
    });

    const content =
      response.choices?.[0]?.message?.content ||
      "I could not generate a reply just now. Please try again.";

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ content }),
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
