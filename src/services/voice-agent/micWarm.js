/**
 * Shared mic stream so Sam can start speaking/listening without
 * waiting on a cold getUserMedia after the intro click.
 */

let warmedStream = null;

const AUDIO_CONSTRAINTS = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

export async function warmMic() {
  if (warmedStream?.active) return warmedStream;
  warmedStream = await navigator.mediaDevices.getUserMedia({
    audio: AUDIO_CONSTRAINTS,
  });
  return warmedStream;
}

/** Peek without transferring ownership. */
export function getWarmedMic() {
  return warmedStream?.active ? warmedStream : null;
}

/**
 * Hand the warmed stream to the recorder (same object reference).
 * Caller must not stop tracks until session ends.
 */
export function adoptWarmedMic() {
  return getWarmedMic();
}

export function releaseWarmedMic() {
  if (!warmedStream) return;
  try {
    warmedStream.getTracks().forEach((t) => t.stop());
  } catch {
    /* ignore */
  }
  warmedStream = null;
}
