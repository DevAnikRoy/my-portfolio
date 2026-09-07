import OpenAI from "openai";
import { toFile } from "openai";

const headersBase = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export const handler = async (event) => {
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

  if (!process.env.GROQ_API_KEY) {
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({ error: "Missing GROQ_API_KEY" }),
    };
  }

  try {
    if (!event.body) throw new Error("Missing request body");

    const { audioBase64, mimeType = "audio/webm" } = JSON.parse(event.body);
    if (!audioBase64) throw new Error("Missing audioBase64");

    const buffer = Buffer.from(audioBase64, "base64");
    if (!buffer.length) throw new Error("Empty audio payload");

    const ext = mimeType.includes("mp4")
      ? "mp4"
      : mimeType.includes("ogg")
        ? "ogg"
        : mimeType.includes("mpeg") || mimeType.includes("mp3")
          ? "mp3"
          : "webm";

    const openai = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const file = await toFile(buffer, `speech.${ext}`, { type: mimeType });

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "whisper-large-v3-turbo",
      language: "en",
      response_format: "json",
    });

    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify({ text: transcription.text || "" }),
    };
  } catch (error) {
    console.error("STT Error:", error);
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({
        error: "STT failed",
        message: error.message,
      }),
    };
  }
};
