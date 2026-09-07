/**
 * Play TTS audio URL, with browser speechSynthesis fallback.
 */

let activeAudio = null;

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
}

function speakWithBrowser(text) {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      resolve();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find((v) => v.name.includes("Google US English")) ||
      voices.find((v) => v.lang?.startsWith("en")) ||
      voices[0];
    if (preferred) utterance.voice = preferred;
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

export async function playSpeech({ audioUrl, text }) {
  stopSpeaking();

  if (audioUrl) {
    try {
      const audio = new Audio(audioUrl);
      activeAudio = audio;
      await new Promise((resolve, reject) => {
        audio.onended = () => resolve();
        audio.onerror = () => reject(new Error("Audio playback failed"));
        audio.play().catch(reject);
      });
      activeAudio = null;
      return;
    } catch {
      activeAudio = null;
      // fall through to browser TTS
    }
  }

  if (text) await speakWithBrowser(text);
}
