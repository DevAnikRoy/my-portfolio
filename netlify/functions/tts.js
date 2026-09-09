import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

const headersBase = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/** Young, bright US female neural voice (Edge fallback) */
const DEFAULT_EDGE_VOICE = "en-US-JennyNeural";
const MAX_CHARS = 220;
const ELEVEN_MODEL = "eleven_turbo_v2_5";

/** Skip ElevenLabs after quota/auth failure for this long (ms). */
const QUOTA_COOLDOWN_MS = 60 * 60 * 1000;

/** @type {number} */
let elevenlabsSkipUntil = 0;

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

function isQuotaOrAuthError(status, bodyText = "") {
  if (status === 401 || status === 402 || status === 429) return true;
  const t = bodyText.toLowerCase();
  return (
    t.includes("quota") ||
    t.includes("credit") ||
    t.includes("limit") ||
    t.includes("payment") ||
    t.includes("insufficient") ||
    t.includes("subscription")
  );
}

/**
 * ElevenLabs neural TTS. Returns Buffer or null if skipped/failed.
 * On quota-style errors, sets a cooldown so we don't keep hitting the API.
 */
async function synthesizeElevenLabs(text) {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  const voiceId = process.env.ELEVENLABS_VOICE_ID?.trim();
  if (!apiKey || !voiceId) return null;

  if (Date.now() < elevenlabsSkipUntil) return null;

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(
    voiceId
  )}?output_format=mp3_44100_128`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: ELEVEN_MODEL,
      voice_settings: {
        stability: 0.42,
        similarity_boost: 0.78,
        style: 0.28,
        use_speaker_boost: true,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.warn("ElevenLabs TTS failed:", res.status, errText.slice(0, 200));
    if (isQuotaOrAuthError(res.status, errText)) {
      elevenlabsSkipUntil = Date.now() + QUOTA_COOLDOWN_MS;
      console.warn(
        `ElevenLabs cooldown until ${new Date(elevenlabsSkipUntil).toISOString()}`
      );
    }
    return null;
  }

  const ab = await res.arrayBuffer();
  const audio = Buffer.from(ab);
  if (!audio.length) return null;
  return audio;
}

async function synthesizeEdge(text, { voice, rate, pitch, volume }) {
  const tts = new MsEdgeTTS();
  try {
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const { audioStream } = await tts.toStream(text, { rate, pitch, volume });
    const audio = await streamToBuffer(audioStream);
    if (!audio.length) throw new Error("Empty Edge TTS audio");
    return audio;
  } finally {
    try {
      tts.close?.();
    } catch {
      /* ignore */
    }
  }
}

function audioResponse(audio, provider) {
  return {
    statusCode: 200,
    headers: {
      ...headersBase,
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store",
      "X-TTS-Provider": provider,
    },
    body: audio.toString("base64"),
    isBase64Encoded: true,
  };
}

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

  try {
    if (!event.body) throw new Error("Missing request body");
    const {
      text,
      voice = DEFAULT_EDGE_VOICE,
      rate = "+6%",
      pitch = "+14Hz",
      volume = "+10%",
    } = JSON.parse(event.body);
    const cleaned = String(text || "").trim().slice(0, MAX_CHARS);
    if (!cleaned) throw new Error("Missing text");

    // Primary: ElevenLabs (while quota / key works)
    try {
      const eleven = await synthesizeElevenLabs(cleaned);
      if (eleven) return audioResponse(eleven, "elevenlabs");
    } catch (err) {
      console.warn("ElevenLabs TTS error:", err?.message || err);
    }

    // Fallback: Edge neural (Jenny) — current system
    const edge = await synthesizeEdge(cleaned, { voice, rate, pitch, volume });
    return audioResponse(edge, "edge");
  } catch (error) {
    console.error("TTS Error:", error);
    return {
      statusCode: 503,
      headers: jsonHeaders,
      body: JSON.stringify({
        error: "TTS unavailable",
        message: error.message,
      }),
    };
  }
};
