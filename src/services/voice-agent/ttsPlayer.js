/**
 * Play Sam's voice — neural TTS from /api/tts (ElevenLabs → Edge Jenny).
 * Browser speechSynthesis is last-resort only (sounds robotic).
 */

let activeAudio = null;
let playResolve = null;

export function stopSpeaking() {
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
  if (playResolve) {
    const resolve = playResolve;
    playResolve = null;
    resolve();
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

    playResolve = resolve;

    const ensureVoices = () => {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const preferred = pickFemaleVoice(voices);
      if (preferred) utterance.voice = preferred;
      utterance.rate = 1.02;
      utterance.pitch = 1.18;
      utterance.volume = 1;
      const done = () => {
        if (playResolve === resolve) playResolve = null;
        resolve();
      };
      utterance.onend = done;
      utterance.onerror = done;
      window.speechSynthesis.speak(utterance);
    };

    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        ensureVoices();
      };
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
    playResolve = resolve;
    audio.onended = () => {
      if (playResolve === resolve) playResolve = null;
      resolve();
    };
    audio.onerror = () => {
      if (playResolve === resolve) playResolve = null;
      reject(new Error("Audio playback failed"));
    };
    audio.play().catch((err) => {
      if (playResolve === resolve) playResolve = null;
      reject(err);
    });
  });
  activeAudio = null;
}

/**
 * Always wait for server neural TTS when possible — never race to robotic browser TTS.
 */
export async function playSpeech({ audioUrl, text, edgePromise }) {
  stopSpeaking();

  if (audioUrl) {
    try {
      await playUrl(audioUrl);
      return;
    } catch {
      activeAudio = null;
    }
  }

  if (edgePromise) {
    try {
      const url = await edgePromise;
      if (url) {
        await playUrl(url);
        return;
      }
    } catch {
      /* fall through */
    }
  }

  if (text) await speakWithBrowser(text);
}
