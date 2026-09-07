/**
 * Client API helpers for the voice call pipeline.
 */

export async function transcribeAudio({ audioBase64, mimeType }) {
  const res = await fetch("/api/stt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ audioBase64, mimeType }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `STT failed (${res.status})`);
  }

  const data = await res.json();
  return (data.text || "").trim();
}

export async function chatVoice(messages) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, mode: "voice" }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Chat failed (${res.status})`);
  }

  const data = await res.json();
  return (data.content || "").trim();
}

/**
 * Returns an Object URL for MPEG audio, or null if TTS is unavailable.
 */
export async function synthesizeSpeech(text) {
  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) return null;

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const data = await res.json();
    if (!data.audioBase64) return null;
    const binary = atob(data.audioBase64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: data.mimeType || "audio/mpeg" });
    return URL.createObjectURL(blob);
  }

  const blob = await res.blob();
  if (!blob.size) return null;
  return URL.createObjectURL(blob);
}

export async function submitCallReport(messages) {
  const res = await fetch("/api/call-report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Call report failed (${res.status})`);
  }

  return res.json();
}
