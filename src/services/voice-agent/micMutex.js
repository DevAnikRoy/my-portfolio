/**
 * Shared mic mutex so Hey Agent continuous STT, Chatbot mic,
 * and Voice Call do not fight for the browser microphone.
 */

let pauseHandler = null;
let resumeHandler = null;
let pauseDepth = 0;

export function registerMicController({ pause, resume }) {
  pauseHandler = pause;
  resumeHandler = resume;
}

export function pauseNavMic() {
  pauseDepth += 1;
  if (pauseDepth === 1) {
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* ignore */
    }
    pauseHandler?.();
  }
}

export function resumeNavMic() {
  pauseDepth = Math.max(0, pauseDepth - 1);
  if (pauseDepth === 0) {
    resumeHandler?.();
  }
}

export function resetMicMutex() {
  pauseDepth = 0;
}
