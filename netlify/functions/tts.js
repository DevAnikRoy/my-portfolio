import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

const headersBase = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/** Young, bright US female neural voice (Edge) — Aria tends to feel snappier than Jenny */
const DEFAULT_EDGE_VOICE = "en-US-AriaNeural";
const MAX_CHARS = 180;
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

function canUseElevenLabs() {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  const voiceId = process.env.ELEVENLABS_VOICE_ID?.trim();
  return Boolean(apiKey && voiceId && Date.now() >= elevenlabsSkipUntil);
}

/**
 * ElevenLabs neural TTS. Returns Buffer or null if skipped/failed.
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

/**
 * Race ElevenLabs ∥ Edge — first successful audio wins (lower latency).
 */
async function synthesizeRaced(text, edgeOpts) {
  if (!canUseElevenLabs()) {
    const edge = await synthesizeEdge(text, edgeOpts);
    return { audio: edge, provider: "edge" };
  }

  return new Promise((resolve, reject) => {
    let settled = false;
    let edgeAudio = null;
    let elevenDone = false;
    let edgeDone = false;

    const finish = (audio, provider) => {
      if (settled || !audio?.length) return;
      settled = true;
      resolve({ audio, provider });
    };

    synthesizeElevenLabs(text)
      .then((audio) => {
        elevenDone = true;
        if (audio?.length) finish(audio, "elevenlabs");
        else if (edgeDone && edgeAudio) finish(edgeAudio, "edge");
        else if (edgeDone && !edgeAudio) reject(new Error("TTS unavailable"));
      })
      .catch(() => {
        elevenDone = true;
        if (edgeDone && edgeAudio) finish(edgeAudio, "edge");
        else if (edgeDone) reject(new Error("TTS unavailable"));
      });

    synthesizeEdge(text, edgeOpts)
      .then((audio) => {
        edgeDone = true;
        edgeAudio = audio;
        finish(audio, "edge");
      })
      .catch((err) => {
        edgeDone = true;
        if (elevenDone && !settled) reject(err);
      });
  });
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
      rate = "+12%",
      pitch = "+6Hz",
      volume = "+10%",
    } = JSON.parse(event.body);
    const cleaned = String(text || "").trim().slice(0, MAX_CHARS);
    if (!cleaned) throw new Error("Missing text");

    const { audio, provider } = await synthesizeRaced(cleaned, {
      voice,
      rate,
      pitch,
      volume,
    });
    return audioResponse(audio, provider);
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
