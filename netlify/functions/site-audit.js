import OpenAI from "openai";
import { getGroqApiKey, missingGroqKeyMessage } from "./utils/localEnv.js";
import { corsHeaders, crawlSite } from "./utils/siteCrawl.js";

const jsonHeaders = { ...corsHeaders(), "Content-Type": "application/json" };

const AUDIT_SYSTEM = `You are a senior conversion-focused web consultant writing a client-facing website inspection for Anik Roy (Frontend & Webflow developer at Softvence).

RULES:
- Use ONLY the JSON facts provided. Never invent pages, tools, traffic numbers, Core Web Vitals, screenshots, or issues that are not evidenced.
- If something was not measured (Lighthouse, CrUX, real-user metrics, visual design QA beyond HTML), say it was not in this crawl.
- Be specific: quote titles, H1s, URLs, status codes, and counts from the facts.
- Do not use filler ("leverage", "delightful", "in today's digital landscape").
- Do not claim the crawl saw the whole site. It saw the homepage plus a few same-origin links.
- Tone: direct, calm, useful to a founder or marketing lead.

Return ONLY valid JSON with this shape:
{
  "headline": "one sentence verdict naming the site",
  "executiveSummary": "3-5 sentences",
  "whatIsWorking": ["...", "..."],
  "priorityWork": [
    { "title": "...", "why": "...", "where": "URL or homepage element", "impact": "conversion|seo|trust|performance|accessibility" }
  ],
  "roadmap": {
    "now": ["this week"],
    "next": ["this month"],
    "later": ["after the basics"]
  },
  "positioningNotes": "1-3 sentences on offer clarity from the actual copy sample",
  "limitations": "one sentence on what this audit could not see"
}`;

function fallbackNarrative(crawl) {
  const top = crawl.findings.filter((f) => f.severity !== "pass").slice(0, 5);
  return {
    headline: `${new URL(crawl.finalUrl).hostname} scores ${crawl.scores.overall}/100 on this HTML inspection.`,
    executiveSummary: `This report is built from a live fetch of ${crawl.finalUrl} plus ${crawl.extraPages.length} extra same-origin page(s). ${top.length ? `The strongest issues are: ${top.map((f) => f.title).join("; ")}.` : "No blocking issues were flagged in the automated checks."} Scores are deducted from observed HTML, headers, and status codes — not from demo data.`,
    whatIsWorking: crawl.findings
      .filter((f) => f.severity === "pass")
      .map((f) => f.title)
      .slice(0, 6),
    priorityWork: top.map((f) => ({
      title: f.title,
      why: f.evidence,
      where: crawl.home.url,
      impact: f.area.toLowerCase(),
    })),
    roadmap: {
      now: top.filter((f) => f.severity === "critical" || f.severity === "high").map((f) => f.recommendation).filter(Boolean).slice(0, 4),
      next: top.filter((f) => f.severity === "medium").map((f) => f.recommendation).filter(Boolean).slice(0, 4),
      later: ["Run a design/UX pass in the browser after the HTML issues above are fixed.", "Add analytics events on the primary CTA once the label is clear."],
    },
    positioningNotes: crawl.home.textSample
      ? `Copy sample starts: “${crawl.home.textSample.slice(0, 220)}…”`
      : "Almost no visible text was extracted, so positioning cannot be judged from HTML alone.",
    limitations:
      "This crawl does not run Lighthouse, does not execute JavaScript-heavy routes, and does not review visual design beyond the HTML that was returned.",
  };
}

async function writeNarrative(crawl) {
  const key = getGroqApiKey();
  if (!key) return { narrative: fallbackNarrative(crawl), llm: false, llmError: missingGroqKeyMessage() };

  const openai = new OpenAI({
    apiKey: key,
    baseURL: "https://api.groq.com/openai/v1",
  });

  const facts = {
    scores: crawl.scores,
    home: crawl.home,
    extraPages: crawl.extraPages,
    probes: crawl.probes,
    findings: crawl.findings.filter((f) => f.severity !== "pass"),
    passes: crawl.findings.filter((f) => f.severity === "pass").map((f) => f.title),
  };

  try {
    const response = await openai.chat.completions.create({
      model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
      temperature: 0.3,
      max_completion_tokens: 1400,
      reasoning_effort: "low",
      messages: [
        { role: "system", content: AUDIT_SYSTEM },
        {
          role: "user",
          content: `Write the inspection narrative from these crawl facts:\n${JSON.stringify(facts)}`,
        },
      ],
    });
    const raw = response.choices?.[0]?.message?.content || "{}";
    const match = raw.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(match ? match[0] : raw);
    return { narrative: { ...fallbackNarrative(crawl), ...parsed }, llm: true };
  } catch (err) {
    return { narrative: fallbackNarrative(crawl), llm: false, llmError: err.message };
  }
}

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: jsonHeaders, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: jsonHeaders,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    if (!event.body) throw new Error("Missing request body");
    const { url } = JSON.parse(event.body);
    if (!url || typeof url !== "string") throw new Error("Provide a website URL.");
    if (url.length > 500) throw new Error("URL is too long.");

    const crawl = await crawlSite(url.trim());
    const { narrative, llm, llmError } = await writeNarrative(crawl);

    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify({
        ok: true,
        llm,
        llmError: llmError || null,
        crawl,
        narrative,
      }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers: jsonHeaders,
      body: JSON.stringify({
        ok: false,
        error: error.message || "Audit failed",
      }),
    };
  }
};
