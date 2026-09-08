import { getGroqApiKey, missingGroqKeyMessage } from "./utils/localEnv.js";

const headersBase = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function cleanMime(mimeType = "audio/webm") {
  const base = String(mimeType).split(";")[0].trim().toLowerCase() || "audio/webm";
  return base;
}

function extForMime(mime) {
  if (mime.includes("wav")) return "wav";
  if (mime.includes("mpeg") || mime.includes("mp3")) return "mp3";
  if (mime.includes("mp4") || mime.includes("m4a")) return "m4a";
  if (mime.includes("ogg") || mime.includes("opus")) return "ogg";
  if (mime.includes("flac")) return "flac";
  return "webm";
}

export const handler = async (event) => {
  const groqKey = getGroqApiKey();
  const jsonHeaders = { ...headersBase, "Content-Type": "application/json" };

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

  if (!groqKey) {
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({
        error: "Missing GROQ_API_KEY",
        message: missingGroqKeyMessage(),
      }),
    };
  }

  try {
    if (!event.body) throw new Error("Missing request body");

    const rawBody = event.isBase64Encoded
      ? Buffer.from(event.body, "base64").toString("utf8")
      : event.body;

    const { audioBase64, mimeType = "audio/webm" } = JSON.parse(rawBody);
    if (!audioBase64) throw new Error("Missing audioBase64");

    const buffer = Buffer.from(audioBase64, "base64");
    if (!buffer.length) throw new Error("Empty audio payload");

    const mime = cleanMime(mimeType);
    const ext = extForMime(mime);
    const filename = `speech.${ext}`;

    const form = new FormData();
    // Filename extension is required by Groq Whisper.
    form.append("file", new Blob([buffer], { type: mime }), filename);
    form.append("model", "whisper-large-v3-turbo");
    form.append("language", "en");
    form.append("response_format", "json");

    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqKey}`,
        },
        body: form,
      }
    );

    const payload = await groqRes.json().catch(() => ({}));
    if (!groqRes.ok) {
      const detail =
        payload?.error?.message ||
        payload?.message ||
        `Groq STT HTTP ${groqRes.status}`;
      throw new Error(detail);
    }

    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify({ text: payload.text || "" }),
    };
  } catch (error) {
    console.error("STT Error:", error);
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({
        error: "STT failed",
        message: error.message || "Unknown STT error",
      }),
    };
  }
};
