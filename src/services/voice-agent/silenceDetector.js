/**
 * Simple RMS silence detector for turn-based voice calls.
 * Resolves when speech is detected then followed by silence,
 * or when maxMs elapses.
 */
export function watchSilence(stream, {
  onSilence,
  silenceMs = 1650,
  minSpeechMs = 550,
  maxMs = 16000,
  threshold = 0.02,
  /** Ignore loud audio at listen start (TTS echo / room ring). */
  ignoreMs = 450,
} = {}) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) {
    const t = setTimeout(() => onSilence?.({ reason: "no-audiocontext" }), maxMs);
    return () => clearTimeout(t);
  }

  const ctx = new AudioCtx();
  const source = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  source.connect(analyser);

  const data = new Uint8Array(analyser.fftSize);
  let startedAt = performance.now();
  let speechStartedAt = null;
  let lastLoudAt = null;
  let stopped = false;
  let raf = 0;

  const tick = () => {
    if (stopped) return;
    analyser.getByteTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i += 1) {
      const v = (data[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / data.length);
    const now = performance.now();

    // Don't treat speaker echo right after Sam finishes as the user's turn
    if (now - startedAt < ignoreMs) {
      raf = requestAnimationFrame(tick);
      return;
    }

    if (rms >= threshold) {
      if (!speechStartedAt) speechStartedAt = now;
      lastLoudAt = now;
    }

    const spokenLongEnough =
      speechStartedAt && now - speechStartedAt >= minSpeechMs;
    const silentLongEnough =
      lastLoudAt && now - lastLoudAt >= silenceMs;

    if (spokenLongEnough && silentLongEnough) {
      stop("silence");
      return;
    }

    if (now - startedAt >= maxMs) {
      stop("max");
      return;
    }

    raf = requestAnimationFrame(tick);
  };

  const stop = (reason) => {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(raf);
    try {
      source.disconnect();
      ctx.close();
    } catch {
      /* ignore */
    }
    onSilence?.({ reason, hadSpeech: Boolean(speechStartedAt) });
  };

  raf = requestAnimationFrame(tick);

  return () => stop("cancel");
}
