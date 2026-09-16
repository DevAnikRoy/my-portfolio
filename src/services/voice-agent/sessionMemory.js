/**
 * Tab-session contact memory for Sam (name / email / phone).
 * Survives Talk-with-Sam reopen in the same browser tab.
 */

const KEY = "sam-session-contact";

function readRaw() {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeRaw(data) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ ...data, updatedAt: Date.now() }));
  } catch {
    /* ignore */
  }
}

export function loadContactMemory() {
  const data = readRaw();
  return {
    name: typeof data.name === "string" ? data.name.trim() : "",
    email: typeof data.email === "string" ? data.email.trim() : "",
    phone: typeof data.phone === "string" ? data.phone.trim() : "",
  };
}

export function saveContactMemory(partial = {}) {
  const prev = loadContactMemory();
  const next = {
    name: (partial.name ?? prev.name) || "",
    email: (partial.email ?? prev.email) || "",
    phone: (partial.phone ?? prev.phone) || "",
  };
  writeRaw(next);
  return next;
}

export function memoryHasContact(mem = loadContactMemory()) {
  return Boolean(mem.email || mem.phone);
}

export function formatKnownContact(mem = loadContactMemory()) {
  const parts = [];
  if (mem.name) parts.push(`name: ${mem.name}`);
  if (mem.email) parts.push(`email: ${mem.email}`);
  if (mem.phone) parts.push(`phone: ${mem.phone}`);
  return parts.join(", ");
}

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PHONE_RE = /\+?\d[\d\s()-]{7,}\d/;
const NAME_RE =
  /(?:(?:my name is|i(?:'| a)?m|this is|call me)\s+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i;

/**
 * Pull contact fields from a single user utterance and merge into memory.
 */
export function ingestUserUtterance(text = "") {
  const t = String(text || "").trim();
  if (!t) return loadContactMemory();

  const patch = {};
  const email = t.match(EMAIL_RE)?.[0];
  if (email) patch.email = email;

  const phone = t.match(PHONE_RE)?.[0];
  if (phone && !email) patch.phone = phone.replace(/\s+/g, " ").trim();

  const name = t.match(NAME_RE)?.[1];
  if (name && name.length < 40) patch.name = name.trim();

  if (Object.keys(patch).length) return saveContactMemory(patch);
  return loadContactMemory();
}

export function transcriptHasContact(messages = []) {
  const mem = loadContactMemory();
  if (memoryHasContact(mem)) return true;
  const blob = messages.map((m) => m.content || "").join(" ");
  return EMAIL_RE.test(blob) || PHONE_RE.test(blob) || /whats?\s*app/i.test(blob);
}
