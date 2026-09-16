/**
 * Varied Sam greetings — intro (land) vs full session openers.
 */

const INTRO_GREETINGS = [
  "Hey — I'm Sam with Anik. I'll be here if you need me. When you want to talk, tap Talk with Sam in the left panel.",
  "Hi, I'm Sam. Have a look around — if you want help scoping a site, open Talk with Sam anytime from the left.",
  "Hey there, Sam here. Exploring is free. Hit Talk with Sam on the left when you're ready for a real chat.",
  "Hi — quick hello from Sam. I'll step back so you can browse. Talk with Sam in the left panel if you need me.",
];

const FULL_GREETINGS = [
  "Hey! I'm Sam with Anik — glad you're here. What are you hoping to build?",
  "Hi there — Sam here. What brought you in today?",
  "Hey, welcome. I'm Sam. Are you browsing, or do you have a project in mind?",
  "Hi! I'm Sam. Webflow, redesign, or React-side — what should we dig into?",
  "Hey hey — Sam speaking. Tell me what you're working on and I'll help.",
  "Hi, I'm Sam. What's the main thing you want help with?",
  "Hey! Fresh start — I'm Sam. Quick tour of the work, or shall we talk your project?",
  "Hi there — Sam with Anik's studio. What's on your mind?",
];

const LAST_INTRO_KEY = "sam-last-intro-greeting-idx";
const LAST_FULL_KEY = "sam-last-greeting-idx";

function pickFrom(list, storageKey) {
  let last = -1;
  try {
    last = Number(sessionStorage.getItem(storageKey));
    if (Number.isNaN(last)) last = -1;
  } catch {
    /* ignore */
  }

  let idx = Math.floor(Math.random() * list.length);
  if (list.length > 1 && idx === last) {
    idx = (idx + 1) % list.length;
  }

  try {
    sessionStorage.setItem(storageKey, String(idx));
  } catch {
    /* ignore */
  }

  const hour = new Date().getHours();
  let line = list[idx];
  if (hour < 12 && Math.random() > 0.55) {
    line = line
      .replace(/^Hey!/, "Morning!")
      .replace(/^Hey —/, "Morning —")
      .replace(/^Hi there/, "Morning")
      .replace(/^Hi!/, "Morning!")
      .replace(/^Hi,/, "Morning,")
      .replace(/^Hi —/, "Morning —");
  } else if (hour >= 18 && Math.random() > 0.55) {
    line = line
      .replace(/^Hey!/, "Hey, evening!")
      .replace(/^Hey —/, "Hey tonight —")
      .replace(/^Hi there/, "Hey tonight")
      .replace(/^Hi!/, "Hey!");
  }

  return line;
}

/** Land-only: greet + tip, then Sam goes idle. No name/email ask. */
export function pickIntroGreeting() {
  return pickFrom(INTRO_GREETINGS, LAST_INTRO_KEY);
}

/** Full Talk-with-Sam session opener — help-first, not contact-first. */
export function pickOpeningGreeting() {
  return pickFrom(FULL_GREETINGS, LAST_FULL_KEY);
}

export const OPENING_GREETING = FULL_GREETINGS[0];

export const SITE_PROJECT_HINTS = [
  "Garden Hub",
  "ServiceHub",
  "AppStore",
  "ApnaKey",
  "Human Studio",
  "Airborne",
  "HouseMax",
  "Between",
];

/** Soft phase hint only — not a hard contact push window. */
export const MARKETING_WINDOW_MS = 120_000;
