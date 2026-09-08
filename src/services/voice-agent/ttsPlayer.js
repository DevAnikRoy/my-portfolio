/**
 * Play speech with low perceived latency:
 * race Edge neural TTS vs a warm browser female voice.
 * Prefer Edge when it arrives quickly; otherwise start browser TTS.
 */

let activeAudio = null;
let browserFallbackTimer = null;

export function stopSpeaking() {
  if (browserFallbackTimer) {
    clearTimeout(browserFallbackTimer);
    browserFallbackTimer = null;
  }
  try {
    window.speechSynthesis?.cancel();
  } catch {
    /* ignore */
  }
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.src = "";
    } catch {
      /* ignore */
    }
    activeAudio = null;
  }
}

function pickFemaleVoice(voices) {
  const rank = (name = "") => {
    const n = name.toLowerCase();
    if (n.includes("jenny")) return 100;
    if (n.includes("samantha")) return 92;
    if (n.includes("karen")) return 88;
    if (n.includes("moira")) return 84;
    if (n.includes("aria")) return 80;
    if (n.includes("female")) return 75;
    if (n.includes("zira")) return 70;
    if (n.includes("google us english")) return 55;
    return 0;
  };
  const en = voices.filter((v) => (v.lang || "").toLowerCase().startsWith("en"));
  const pool = en.length ? en : voices;
  return [...pool].sort((a, b) => rank(b.name) - rank(a.name))[0] || voices[0];
}

function speakWithBrowser(text) {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      resolve();
      return;
    }

    const ensureVoices = () => {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const preferred = pickFemaleVoice(voices);
      if (preferred) utterance.voice = preferred;
      utterance.rate = 1.02;
      utterance.pitch = 1.18;
      utterance.volume = 1;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    };

    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        ensureVoices();
      };
      // Fallback if voiceschanged never fires
      setTimeout(ensureVoices, 120);
      return;
    }
    ensureVoices();
  });
}

async function playUrl(audioUrl) {
  const audio = new Audio(audioUrl);
  activeAudio = audio;
  await new Promise((resolve, reject) => {
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error("Audio playback failed"));
    audio.play().catch(reject);
  });
  activeAudio = null;
}

/**
 * @param {{ audioUrl?: string|null, text?: string, edgePromise?: Promise<string|null>, preferEdgeMs?: number }} opts
 */
export async function playSpeech({ audioUrl, text, edgePromise, preferEdgeMs = 420 }) {
  stopSpeaking();

  if (audioUrl) {
    try {
      await playUrl(audioUrl);
      return;
    } catch {
      activeAudio = null;
      if (text) await speakWithBrowser(text);
      return;
    }
  }

  if (edgePromise && text) {
    let edgeUrl = null;

    const edgeTask = edgePromise
      .then((url) => {
        edgeUrl = url;
        return url ? "edge" : "edge-miss";
      })
      .catch(() => "edge-miss");

    const gateTask = new Promise((resolve) => {
      browserFallbackTimer = setTimeout(() => {
        browserFallbackTimer = null;
        resolve("browser-gate");
      }, preferEdgeMs);
    });

    const winner = await Promise.race([edgeTask, gateTask]);

    if (browserFallbackTimer) {
      clearTimeout(browserFallbackTimer);
      browserFallbackTimer = null;
    }

    if (winner === "edge" && edgeUrl) {
      try {
        await playUrl(edgeUrl);
        return;
      } catch {
        activeAudio = null;
        await speakWithBrowser(text);
        return;
      }
    }

    // Edge too slow or failed — use warm browser female voice immediately
    // Still try to use Edge if it arrives before browser starts? We already waited preferEdgeMs.
    // One more short wait if edge almost done:
    if (!edgeUrl) {
      const late = await Promise.race([
        edgeTask.then(() => edgeUrl),
        new Promise((r) => setTimeout(() => r(null), 180)),
      ]);
      if (late) {
        try {
          await playUrl(late);
          return;
        } catch {
          activeAudio = null;
        }
      }
    } else {
      try {
        await playUrl(edgeUrl);
        return;
      } catch {
        activeAudio = null;
      }
    }

    await speakWithBrowser(text);
    return;
  }

  if (text) await speakWithBrowser(text);
}
