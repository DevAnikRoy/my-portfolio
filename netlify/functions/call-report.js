/**
 * Analyze a finished voice call, send Telegram report, append Google Sheet row.
 *
 * Env:
 * - GROQ_API_KEY (required for analysis)
 * - TELEGRAM_BOT_TOKEN
 * - TELEGRAM_CHAT_ID
 * - GOOGLE_SHEETS_WEBHOOK_URL  (Google Apps Script web app URL that accepts JSON POST)
 */

import OpenAI from "openai";
import { ensureLocalEnv } from "./utils/localEnv.js";

ensureLocalEnv();

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

function formatTranscript(messages = []) {
  return messages
    .map((m) => `${m.role === "assistant" ? "Sam" : "Visitor"}: ${m.content}`)
    .join("\n");
}

function emptyReport() {
  return {
    summary: "",
    visitor_intent: "unclear",
    interest: "none",
    sentiment: "neutral",
    next_steps: "",
    requirements: "",
    scope: "",
    contact: {
      name: "",
      email: "",
      phone: "",
      company: "",
      country: "",
      timezone: "",
    },
    project: {
      type: "",
      timeline: "",
      budget: "",
      notes: "",
    },
    qualified: false,
  };
}

async function analyzeCall(openai, messages) {
  const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
  const transcript = formatTranscript(messages);

  const response = await openai.chat.completions.create({
    model,
    temperature: 0.2,
    max_completion_tokens: 1200,
    reasoning_effort: "low",
    messages: [
      {
        role: "system",
        content: `You analyze sales/support voice calls for Anik Roy (frontend/Webflow/FDE services, US & EU clients).
Return ONLY valid JSON with this shape:
{
  "summary": "3-6 sentence report of the call",
  "visitor_intent": "browsing | discovery | qualified_lead | support | unclear",
  "interest": "website | webapp | redesign | automation | ai_integration | other | none",
  "sentiment": "positive | neutral | negative",
  "next_steps": "recommended follow-up",
  "requirements": "bullet-like plain text of what the visitor asked for / needs",
  "scope": "plain text project scope if discussed (pages, CMS, integrations, timeline constraints)",
  "contact": {
    "name": "",
    "email": "",
    "phone": "",
    "company": "",
    "country": "",
    "timezone": ""
  },
  "project": {
    "type": "",
    "timeline": "",
    "budget": "",
    "notes": ""
  },
  "qualified": true
}
Use empty strings when unknown. Never invent contact details.`,
      },
      {
        role: "user",
        content: `Call transcript:\n\n${transcript}`,
      },
    ],
  });

  const raw = response.choices?.[0]?.message?.content || "{}";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  try {
    return { ...emptyReport(), ...JSON.parse(jsonMatch ? jsonMatch[0] : raw) };
  } catch {
    return {
      ...emptyReport(),
      summary: raw.slice(0, 800) || "Could not parse structured analysis.",
      project: { type: "", timeline: "", budget: "", notes: transcript.slice(0, 500) },
    };
  }
}

async function sendTelegram(report, messages) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return { ok: false, skipped: true, reason: "Telegram env not configured" };
  }

  const contact = report.contact || {};
  const project = report.project || {};
  // Plain text only — Markdown parse_mode breaks on underscores in intents like qualified_lead.
  const text = [
    "📞 New Voice Call Report",
    "",
    `Intent: ${report.visitor_intent || "unclear"}`,
    `Interest: ${report.interest || "none"}`,
    `Sentiment: ${report.sentiment || "neutral"}`,
    `Qualified: ${report.qualified ? "Yes" : "No"}`,
    "",
    "— Contact —",
    `Name: ${contact.name || "—"}`,
    `Email: ${contact.email || "—"}`,
    `Phone: ${contact.phone || "—"}`,
    `Company: ${contact.company || "—"}`,
    `Country: ${contact.country || "—"}`,
    "",
    "— Project —",
    `Type: ${project.type || "—"}`,
    `Timeline: ${project.timeline || "—"}`,
    `Budget: ${project.budget || "—"}`,
    `Scope: ${report.scope || project.notes || "—"}`,
    `Requirements: ${report.requirements || "—"}`,
    "",
    `Summary:\n${report.summary || "—"}`,
    "",
    `Next steps:\n${report.next_steps || "—"}`,
    "",
    `Turns: ${messages.length}`,
  ].join("\n");

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: text.slice(0, 4000),
      disable_web_page_preview: true,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) {
    throw new Error(data.description || `Telegram failed (${res.status})`);
  }
  return { ok: true };
}

async function appendSheet(report, messages) {
  const webhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhook) {
    return { ok: false, skipped: true, reason: "Google Sheets webhook not configured" };
  }

  const contact = report.contact || {};
  const project = report.project || {};
  const payload = {
    timestamp: new Date().toISOString(),
    name: contact.name || "",
    email: contact.email || "",
    phone: contact.phone || "",
    company: contact.company || "",
    country: contact.country || "",
    timezone: contact.timezone || "",
    intent: report.visitor_intent || "",
    interest: report.interest || "",
    project_type: project.type || "",
    timeline: project.timeline || "",
    budget: project.budget || "",
    qualified: Boolean(report.qualified),
    sentiment: report.sentiment || "",
    summary: report.summary || "",
    next_steps: report.next_steps || "",
    requirements: report.requirements || "",
    scope: report.scope || "",
    notes: project.notes || "",
    turns: messages.length,
  };

  // Apps Script web apps often 302; fetch follows redirects by default.
  const res = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    redirect: "follow",
  });

  const body = await res.text().catch(() => "");
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        "Sheets webhook unauthorized. Redeploy the Apps Script as Web App with access: Anyone, then update GOOGLE_SHEETS_WEBHOOK_URL."
      );
    }
    throw new Error(`Sheets webhook failed (${res.status}): ${body.slice(0, 200)}`);
  }

  return { ok: true };
}

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: cors, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: cors,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("Missing GROQ_API_KEY");
    }
    if (!event.body) throw new Error("Missing request body");

    const { messages } = JSON.parse(event.body);
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error("No messages to report");
    }

    const openai = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const report = await analyzeCall(openai, messages);

    // Deliver independently — Telegram Markdown failures used to block Sheets entirely.
    const delivery = { telegram: null, sheet: null };
    const errors = [];

    try {
      delivery.telegram = await sendTelegram(report, messages);
    } catch (err) {
      delivery.telegram = { ok: false, error: err.message };
      errors.push(`telegram: ${err.message}`);
      console.error("Telegram delivery failed:", err);
    }

    try {
      delivery.sheet = await appendSheet(report, messages);
    } catch (err) {
      delivery.sheet = { ok: false, error: err.message };
      errors.push(`sheet: ${err.message}`);
      console.error("Sheets delivery failed:", err);
    }

    const anyOk = delivery.telegram?.ok || delivery.sheet?.ok;
    return {
      statusCode: anyOk || errors.length === 0 ? 200 : 502,
      headers: cors,
      body: JSON.stringify({
        ok: anyOk,
        report,
        delivery,
        errors,
      }),
    };
  } catch (error) {
    console.error("Call report error:", error);
    return {
      statusCode: 500,
      headers: cors,
      body: JSON.stringify({
        error: "Call report failed",
        message: error.message,
      }),
    };
  }
};
