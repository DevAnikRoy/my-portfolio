/**
 * MediaRecorder helper for voice-call turns (with optional silence auto-stop).
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

  async function start({ onAutoStop } = {}) {
    if (recorder && recorder.state === "recording") return;

    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    mimeType = pickMimeType();
    chunks = [];
    recorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream);

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    recorder.start(100);

    if (typeof onAutoStop === "function") {
      stopSilenceWatch = watchSilence(stream, {
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
        cleanup();
        reject(new Error("Recorder is not active."));
        return;
      }

      recorder.onstop = () => {
        const type = recorder.mimeType || mimeType || "audio/webm";
        const blob = new Blob(chunks, { type });
        cleanup();
        if (!blob.size) {
          reject(new Error("No audio captured."));
          return;
        }
        resolve({ blob, mimeType: type });
      };

      try {
        recorder.stop();
      } catch (err) {
        cleanup();
        reject(err);
      }
    });
  }

  function cleanup() {
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
    cleanup();
  }

  return { start, stop, cancel };
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
