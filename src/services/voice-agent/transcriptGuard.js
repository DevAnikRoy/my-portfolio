/**
 * Detect Whisper silence hallucinations / echo leftovers so we don't
 * reply to a ghost "Thank you." mid-conversation.
 */
export function isGhostTranscript(text = "") {
  const raw = String(text).trim();
  if (!raw) return true;

  const normalized = raw
    .toLowerCase()
    .replace(/["""']/g, "")
    .replace(/[^\w\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return true;
  if (normalized.length <= 1) return true;

  const ghosts = [
    "thank you",
    "thanks",
    "thank you so much",
    "thanks so much",
    "thanks for watching",
    "thank you for watching",
    "thanks for listening",
    "thank you for listening",
    "thanks for tuning in",
    "subscribe",
    "please subscribe",
    "bye",
    "goodbye",
    "you",
    "the",
    "a",
    "i",
    "uh",
    "um",
    "hmm",
    "mm",
    "mmm",
    "ah",
    "oh",
    "phew",
  ];

  if (ghosts.includes(normalized)) return true;

  // Very short non-content noise (1 word, not a useful reply)
  const words = normalized.split(" ").filter(Boolean);
  if (words.length === 1 && words[0].length <= 3) return true;

  return false;
}
