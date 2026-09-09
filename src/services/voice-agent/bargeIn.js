/**
 * Detect user speech while Sam is talking (barge-in / interruption).
 * Returns a stop() function.
 */
export function watchBargeIn(stream, {
  onBarge,
  /** Ignore TTS attack / room ring */
  ignoreMs = 380,
  /** How long user must stay loud to count as interrupt */
  holdMs = 260,
  threshold = 0.028,
} = {}) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx || !stream) {
    return () => {};
  }

  const ctx = new AudioCtx();
  const source = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  source.connect(analyser);

  const data = new Uint8Array(analyser.fftSize);
  const startedAt = performance.now();
  let loudSince = null;
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

    if (now - startedAt < ignoreMs) {
      raf = requestAnimationFrame(tick);
      return;
    }

    if (rms >= threshold) {
      if (!loudSince) loudSince = now;
      if (now - loudSince >= holdMs) {
        stop(true);
        return;
      }
    } else {
      loudSince = null;
    }

    raf = requestAnimationFrame(tick);
  };

  const stop = (fired = false) => {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(raf);
    try {
      source.disconnect();
      ctx.close();
    } catch {
      /* ignore */
    }
    if (fired) onBarge?.();
  };

  raf = requestAnimationFrame(tick);
  return () => stop(false);
}
