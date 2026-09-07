import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

const headersBase = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DEFAULT_VOICE = "en-US-ChristopherNeural";
const MAX_CHARS = 500;

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
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

  let tts;
  try {
    if (!event.body) throw new Error("Missing request body");
    const { text, voice = DEFAULT_VOICE } = JSON.parse(event.body);
    const cleaned = String(text || "").trim().slice(0, MAX_CHARS);
    if (!cleaned) throw new Error("Missing text");

    tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const { audioStream } = await tts.toStream(cleaned);
    const audio = await streamToBuffer(audioStream);
    if (!audio.length) throw new Error("Empty TTS audio");

    return {
      statusCode: 200,
      headers: {
        ...headersBase,
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
      body: audio.toString("base64"),
      isBase64Encoded: true,
    };
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
  } finally {
    try {
      tts?.close?.();
    } catch {
      /* ignore */
    }
  }
};
