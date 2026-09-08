/**
 * MediaRecorder helper for voice-call turns (with optional silence auto-stop).
 * Reuses the mic stream across turns to cut getUserMedia latency.
 */

import { watchSilence } from "./silenceDetector";

function pickMimeType() {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  if (typeof MediaRecorder === "undefined") return "";
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) || "";
}

export function createAudioRecorder() {
  let stream = null;
  let recorder = null;
  let chunks = [];
  let mimeType = "";
  let stopSilenceWatch = null;

  async function ensureStream() {
    if (stream?.active) return stream;
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    return stream;
  }

  async function start({ onAutoStop } = {}) {
    if (recorder && recorder.state === "recording") return;

    await ensureStream();

    mimeType = pickMimeType();
    chunks = [];
    recorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream);

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    recorder.start(80);

    if (typeof onAutoStop === "function") {
      // Give the user time to pause mid-thought without cutting them off.
      stopSilenceWatch = watchSilence(stream, {
        silenceMs: 1650,
        minSpeechMs: 550,
        maxMs: 16000,
        threshold: 0.02,
        onSilence: ({ hadSpeech }) => {
          if (!hadSpeech) {
            onAutoStop({ empty: true });
            return;
          }
          onAutoStop({ empty: false });
        },
      });
    }
  }

  function stop() {
    return new Promise((resolve, reject) => {
      if (stopSilenceWatch) {
        stopSilenceWatch();
        stopSilenceWatch = null;
      }

      if (!recorder || recorder.state === "inactive") {
        reject(new Error("Recorder is not active."));
        return;
      }

      recorder.onstop = () => {
        const type = recorder.mimeType || mimeType || "audio/webm";
        const blob = new Blob(chunks, { type });
        recorder = null;
        chunks = [];
        if (!blob.size) {
          reject(new Error("No audio captured."));
          return;
        }
        resolve({ blob, mimeType: type });
      };

      try {
        recorder.stop();
      } catch (err) {
        recorder = null;
        chunks = [];
        reject(err);
      }
    });
  }

  function releaseStream() {
    if (stopSilenceWatch) {
      stopSilenceWatch();
      stopSilenceWatch = null;
    }
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }
    recorder = null;
    chunks = [];
  }

  function cancel() {
    try {
      if (recorder && recorder.state !== "inactive") recorder.stop();
    } catch {
      /* ignore */
    }
    releaseStream();
  }

  /** End turn recording but keep mic stream warm for the next listen. */
  function softCancel() {
    if (stopSilenceWatch) {
      stopSilenceWatch();
      stopSilenceWatch = null;
    }
    try {
      if (recorder && recorder.state !== "inactive") recorder.stop();
    } catch {
      /* ignore */
    }
    recorder = null;
    chunks = [];
  }

  return { start, stop, cancel, softCancel, releaseStream };
}

export async function blobToBase64(blob) {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

/** Strip codec params so APIs accept a clean MIME type. */
export function cleanAudioMime(mimeType = "audio/webm") {
  return String(mimeType).split(";")[0].trim() || "audio/webm";
}
