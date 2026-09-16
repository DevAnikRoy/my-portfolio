/**
 * Deterministic site navigation — ONLY for clear, short UI commands.
 * Must NOT hijack normal conversation (e.g. "I'm thinking about a project…").
 */

const NAV_CUE =
  /\b(go\s+to|take\s+me|show\s+me|open|scroll|jump\s+to|navigate|bring\s+me|head\s+to|switch\s+to)\b/;

function hasNavCue(t) {
  return NAV_CUE.test(t) || /^(projects?|skills?|experience|about|education|contact|home)\b/.test(t);
}

const SECTION_RULES = [
  {
    id: "projects",
    speak: "Taking you to the projects.",
    // Require cue OR short command — bare "project" in long chat is NOT enough
    match: (t, short) =>
      (/\bprojects?\b/.test(t) || /\bportfolio\b/.test(t) || /\bcase\s*stud/.test(t)) &&
      (hasNavCue(t) || short || /\b(your|his)\s+work\b/.test(t) || /\bexplore\s+(the\s+)?(projects?|portfolio|work)\b/.test(t)),
  },
  {
    id: "skills",
    speak: "Here's the skills section.",
    match: (t, short) =>
      (/\bskills?\b/.test(t) || /\b(tech\s+)?stack\b/.test(t)) &&
      (hasNavCue(t) || short),
  },
  {
    id: "experience",
    speak: "Jumping to experience.",
    match: (t, short) =>
      (/\bexperience\b/.test(t) || /\bwork\s+history\b/.test(t) || /\bsoftvence\b/.test(t)) &&
      (hasNavCue(t) || short),
  },
  {
    id: "about",
    speak: "Here's a bit about Anik.",
    match: (t, short) =>
      (/\babout\s+(anik|him|you|section)\b/.test(t) ||
        /\bwho\s+(is|are)\s+(anik|he)\b/.test(t) ||
        /\btell\s+me\s+about\s+(anik|him|yourself)\b/.test(t) ||
        (short && /\babout\b/.test(t))) &&
      !/\bthinking\s+about\b/.test(t) &&
      !/\babout\s+(a|my|the)\s+(project|site|budget)/.test(t),
  },
  {
    id: "education",
    speak: "Opening education.",
    match: (t, short) =>
      (/\beducation\b/.test(t) || /\buniversity\b/.test(t) || /\bdegree\b/.test(t)) &&
      (hasNavCue(t) || short),
  },
  {
    id: "contact",
    speak: "Here's how to reach Anik.",
    match: (t, short) =>
      (/\bcontact\s+(section|page|info)?\b/.test(t) ||
        /\bget\s+in\s+touch\b/.test(t) ||
        (short && (/\bcontact\b/.test(t) || /\bhire\b/.test(t)))) &&
      (hasNavCue(t) || short),
  },
  {
    id: "home",
    speak: "Back to the top.",
    match: (t) =>
      /\b(go\s+)?home\b/.test(t) || /\btop\s+of\s+(the\s+)?(page|site)\b/.test(t),
  },
];

const SPECIAL = [
  {
    test: (t, short) =>
      (/\b(free\s+)?audit\b/.test(t) || /\bsite\s+audit\b/.test(t)) &&
      (hasNavCue(t) || short || /\bget\s+(a\s+)?free\s+audit\b/.test(t)),
    speak: "Opening the free site audit.",
    actions: [{ type: "openAudit" }],
  },
  {
    test: (t, short) =>
      (/\b(ai\s+)?chat(bot)?\b/.test(t) || /\btype\s+instead\b/.test(t) || /\bask\s+ai\b/.test(t)) &&
      (hasNavCue(t) || short || /\bopen\s+chat\b/.test(t)),
    speak: "Opening the chat panel.",
    actions: [{ type: "openChat" }],
  },
  {
    test: (t) =>
      /\b(webflow\s+)?archive\b/.test(t) ||
      /\bmore\s+webflow\b/.test(t) ||
      /\ball\s+webflow\b/.test(t),
    speak: "Opening the Webflow work archive.",
    actions: [{ type: "openWebflowArchive" }],
  },
  {
    test: (t) =>
      /\bback\s+to\s+projects?\b/.test(t) ||
      /\bleave\s+(this\s+)?(project|case\s*study)\b/.test(t) ||
      /\bexit\s+(project|case\s*study)\b/.test(t),
    speak: "Heading back to the projects.",
    actions: [{ type: "backToProjects" }],
  },
  {
    test: (t, short) =>
      (/\bresume\b/.test(t) || /\bcv\b/.test(t)) && (hasNavCue(t) || short),
    speak: "Opening the resume.",
    actions: [{ type: "openResume" }],
  },
  {
    test: (t) => /\bscroll\s+down\b/.test(t) || /\bpage\s+down\b/.test(t),
    speak: "Scrolling down.",
    actions: [{ type: "scrollPage", direction: "down" }],
  },
  {
    test: (t) => /\bscroll\s+up\b/.test(t) || /\bpage\s+up\b/.test(t),
    speak: "Scrolling up.",
    actions: [{ type: "scrollPage", direction: "up" }],
  },
];

/** Explicit goodbye only — never mid-conversation phrases like "that's all I need for now about X". */
export function resolveGoodbyeIntent(text = "") {
  const t = String(text || "").toLowerCase().trim();
  if (
    /^(bye|goodbye|bye bye|see you|talk later)[\s!.]*$/.test(t) ||
    /\b(hang\s*up|end\s+(the\s+)?(call|session)|goodbye)\b/.test(t)
  ) {
    return {
      speak: "Thanks for chatting — take care!",
      actions: [{ type: "endCall" }],
    };
  }
  return null;
}

export function resolveRegionReply(text = "") {
  const t = String(text || "").toLowerCase();
  const short = t.split(/\s+/).length <= 14;
  if (!short && t.length > 100) return null;
  if (
    /\b(where\s+(is|are)\s+(he|anik|you)|where\s+(is\s+he\s+)?based|what\s+(city|country|region)|location|timezone)\b/.test(
      t
    ) ||
    (short && /\b(dhaka|bangladesh)\b/.test(t) && /\b(where|from|based|live)\b/.test(t))
  ) {
    return {
      speak: "Anik is based in Dhaka, Bangladesh, and works with clients worldwide.",
      actions: [],
    };
  }
  return null;
}

/**
 * @param {string} text
 * @returns {{ speak: string, actions: object[] } | null}
 */
export function resolveNavIntent(text = "") {
  const t = String(text || "")
    .toLowerCase()
    .replace(/[^\w\s'+]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!t || t.length < 2) return null;

  const goodbye = resolveGoodbyeIntent(t);
  if (goodbye) return goodbye;

  // Conversational / long turns → never force-nav
  const words = t.split(/\s+/).filter(Boolean);
  // "short command" = brief AND looks like a command, not a question about content
  const looksLikeCommand =
    hasNavCue(t) ||
    /^(please\s+)?(the\s+)?(projects?|skills?|experience|about|education|contact|home|portfolio|audit|chat|resume|cv)(\s+section)?\s*(please)?$/.test(
      t
    );
  const short = words.length <= 8 && looksLikeCommand;

  // Questions / scoping ("what kind of project experience…") stay in chat
  if (
    /\b(what|how|why|when|which|can\s+you\s+tell|do\s+you\s+have|kind\s+of|looking\s+for|thinking\s+about|i\s+(want|need|have|am)|we\s+(want|need))\b/.test(
      t
    ) &&
    !hasNavCue(t)
  ) {
    return resolveRegionReply(t) || resolveGoodbyeIntent(t);
  }

  for (const rule of SPECIAL) {
    if (rule.test(t, short)) {
      return { speak: rule.speak, actions: rule.actions };
    }
  }

  for (const section of SECTION_RULES) {
    if (section.match(t, short)) {
      return {
        speak: section.speak,
        actions: [{ type: "scrollTo", id: section.id }],
      };
    }
  }

  return resolveRegionReply(t);
}

/**
 * Map Groq failed_generation tool-call OR plain-text into site payload.
 */
export function actionsFromFailedTool(failed) {
  if (failed == null) return null;

  if (typeof failed === "string") {
    const trimmed = failed.trim();
    // Plain conversational text (json_validate_failed)
    if (trimmed && !trimmed.startsWith("{") && !trimmed.startsWith("[")) {
      let speak = trimmed.replace(/\s+/g, " ").trim();
      if (speak.length > 160) speak = `${speak.slice(0, 157).trim()}…`;
      return { speak: speak || "Got it — tell me a bit more.", actions: [] };
    }
    try {
      return actionsFromFailedTool(JSON.parse(trimmed));
    } catch {
      // Salvage speak from broken JSON-ish text
      const speakMatch = trimmed.match(/"speak"\s*:\s*"((?:\\.|[^"\\])*)"/);
      if (speakMatch) {
        return {
          speak: speakMatch[1].replace(/\\"/g, '"').slice(0, 160),
          actions: [],
        };
      }
      let speak = trimmed.replace(/^[{[\s]+/, "").replace(/[}\]\s]+$/, "");
      if (speak.length > 20) {
        return { speak: speak.slice(0, 160), actions: [] };
      }
      return null;
    }
  }

  const parsed = failed;
  if (!parsed || typeof parsed !== "object") return null;

  if (parsed.speak || Array.isArray(parsed.actions)) {
    return {
      speak: String(parsed.speak || "On it.").trim() || "On it.",
      actions: Array.isArray(parsed.actions) ? parsed.actions : [],
    };
  }

  let args = parsed.arguments ?? {};
  if (typeof args === "string") {
    try {
      args = JSON.parse(args);
    } catch {
      // arguments was plain speak text
      if (args.trim()) {
        return { speak: String(args).trim().slice(0, 160), actions: [] };
      }
      args = {};
    }
  }
  if (!args || typeof args !== "object") args = {};

  if (args.speak || Array.isArray(args.actions)) {
    return {
      speak: String(args.speak || "On it.").trim() || "On it.",
      actions: Array.isArray(args.actions) ? args.actions : [],
    };
  }

  const rawName = String(parsed.name || "")
    .replace(/^browser\./i, "")
    .replace(/^assistant\.?/i, "")
    .trim();
  const name = rawName.toLowerCase();
  const speakFallback = "Sure — doing that now.";

  if (name === "scrollpage" || name === "scroll_page") {
    const direction = args.direction === "up" ? "up" : "down";
    return {
      speak: direction === "up" ? "Scrolling up." : "Scrolling down.",
      actions: [{ type: "scrollPage", direction }],
    };
  }

  if (name === "scrollto" || name === "scroll_to" || name === "navigateto") {
    const id = String(args.id || args.section || args.target || "").toLowerCase();
    if (id) {
      return {
        speak: `Taking you to ${id}.`,
        actions: [{ type: "scrollTo", id }],
      };
    }
  }

  if (name === "action" || name === "siteaction" || name === "navigate") {
    const type = args.type || args.action;
    if (type) {
      const action = { type, ...args };
      delete action.action;
      return { speak: speakFallback, actions: [action] };
    }
  }

  const typeMap = {
    gohome: "goHome",
    backtoprojects: "backToProjects",
    openwebflowarchive: "openWebflowArchive",
    openresume: "openResume",
    openaudit: "openAudit",
    openchat: "openChat",
    endcall: "endCall",
    openproject: "openProject",
    openlivedemo: "openLiveDemo",
    opengithub: "openGithub",
  };
  const compact = name.replace(/[_\s-]/g, "");
  if (typeMap[compact]) {
    const action = { type: typeMap[compact] };
    if (args.query) action.query = args.query;
    if (args.id) action.id = args.id;
    if (args.direction) action.direction = args.direction;
    return { speak: speakFallback, actions: [action] };
  }

  if (args.type) {
    return { speak: speakFallback, actions: [args] };
  }

  return null;
}

/** True only for short, clear navigation commands — not chat. */
export function isLikelyNavOnly(text = "") {
  const t = String(text || "").toLowerCase().trim();
  if (!t || t.length > 90) return false;
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length > 12) return false;
  // Project scoping language → conversation, not nav
  if (
    /\b(i\s+(want|need|have|am|was)|we\s+(want|need)|my\s+(company|startup|business|budget)|looking\s+for|thinking\s+about|building|redesign|workflow|onyx|sheet|form)\b/.test(
      t
    )
  ) {
    return false;
  }
  return Boolean(resolveNavIntent(t));
}
