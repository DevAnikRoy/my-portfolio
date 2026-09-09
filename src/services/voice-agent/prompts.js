/**
 * Varied, young, warm Sam greetings — same niche, never same line twice in a row.
 */

const GREETINGS = [
  "Hey! I'm Sam with Anik — glad you stopped by. What's your name, and what are you hoping to build?",
  "Hi there — Sam here. Anik helps teams ship sites that actually convert. What brought you in today?",
  "Hey, welcome. I'm Sam, Anik's partner on this site. Quick one — are you browsing, or do you have a project in mind?",
  "Hi! I'm Sam. If you need a Webflow site, redesign, or something React-side, I can help scope it. What should we call you?",
  "Hey hey — Sam speaking. Love that you're here. Tell me what you're working on and I'll point you the right way.",
  "Hi, I'm Sam. Anik's the builder — I'm here to make this easy. What's the main thing you want help with?",
  "Hey! Fresh visit, fresh start. I'm Sam. Want a quick tour of the work, or shall we talk about your project?",
  "Hi there — Sam with Anik's studio. Whether it's a landing page or a full redesign, we can map it. What's on your mind?",
  "Hey, good to meet you. I'm Sam. Drop your name and what you're after — website, e-com, redesign, whatever — and we'll go from there.",
  "Hi! I'm Sam, and I keep things human. Anik ships clean Webflow and product sites. What would make this visit useful for you?",
];

const LAST_KEY = "sam-last-greeting-idx";

export function pickOpeningGreeting() {
  let last = -1;
  try {
    last = Number(sessionStorage.getItem(LAST_KEY));
    if (Number.isNaN(last)) last = -1;
  } catch {
    /* ignore */
  }

  let idx = Math.floor(Math.random() * GREETINGS.length);
  if (GREETINGS.length > 1 && idx === last) {
    idx = (idx + 1) % GREETINGS.length;
  }

  try {
    sessionStorage.setItem(LAST_KEY, String(idx));
  } catch {
    /* ignore */
  }

  // Light time-of-day color without changing the pitch
  const hour = new Date().getHours();
  let line = GREETINGS[idx];
  if (hour < 12 && Math.random() > 0.55) {
    line = line.replace(/^Hey!/, "Morning!").replace(/^Hi there/, "Morning").replace(/^Hi!/, "Morning!");
  } else if (hour >= 18 && Math.random() > 0.55) {
    line = line.replace(/^Hey!/, "Hey, evening!").replace(/^Hi there/, "Hey tonight").replace(/^Hi!/, "Hey!");
  }

  return line;
}

export const OPENING_GREETING = GREETINGS[0];

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

export const MARKETING_WINDOW_MS = 120_000;
