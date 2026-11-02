# Anik Roy — Portfolio

**Live:** [https://dev-anik.netlify.app](https://dev-anik.netlify.app)

Personal portfolio for **Anik Roy** (Full-Stack & Webflow developer at Softvence). Beyond a static resume site, it ships a production-style **voice + chat AI layer** that navigates the page, scopes work with visitors, runs a free site audit, and delivers leads to Telegram / Google Sheets.

Built so another developer can run it locally, and a recruiter can see **what stack is used** and **what engineering problems were solved**.

---

## What problem this solves

| Visitor need | How the site answers |
| --- | --- |
| “Show me your work without scrolling forever” | **Tia** — a voice agent that scrolls, opens projects, resume, audit, and chat from natural speech |
| “Talk like a human, not a FAQ bot” | Groq LLM with a site-mode persona that returns `{ speak, actions }` for speech + UI control |
| “Is my site any good?” | **Free site audit** — crawl + SEO/perf heuristics + optional LLM narrative + PDF export |
| “What are you shipping in public?” | **GitHub Activity** tab — contribution calendar, follower/repo counts, and the six newest public repos |
| “How do I reach Anik?” | Voice lead capture on hang-up → Telegram (+ Sheets); contact form via EmailJS; chatbot handoffs |

---

## Pages on the site

Home, in order:

1. **Hero** — portrait, role, and a WebGPU shape-wave cover (`ShapeWaves`)
2. **Community rail** — GitHub follow, contact prompt, and three people from the inspiration list
3. **Work** — tabs for curated **Projects** and live **GitHub Activity**
4. **Skills**, **Experience**, **About**, **Contact**

Other views, opened from nav or from Tia:

- **Project detail** (`#project-<id>`)
- **Webflow archive** (`#webflow-work`) — delivery sites, after the featured projects
- **People** (`#people`) — ten public profiles Anik learns from, filterable by platform

---

## Tech stack

Audited against `main` (`package.json`, `src/`, `netlify/functions/`). Versions below are the ranges this repo installs.

### Frontend
| Layer | Choice | Where it shows up |
| --- | --- | --- |
| UI | **React 18** + **Vite 7** | Whole app. Vite 7 needs **Node.js 20.19+ or 22.12+** |
| Styling | **Tailwind CSS 3** + component CSS | Layout, People, hero, shape waves |
| Type | **Inter** (Google Fonts) | `index.html` |
| Hero graphics | **vgpu 0.6** + **@vgpu/wgsl** | `ShapeWaves.jsx` — WebGPU compute/render, pointer ripples, intro mask |
| Motion | **GSAP 3** | Custom cursor and the voice intro popup |
| Icons | lucide-react, react-icons | Nav, hero stack marks, GitHub tab |
| PDF | **jspdf** | Audit report download. Charts are drawn in jsPDF, not captured from the DOM |
| Forms | **@emailjs/browser** | Contact form. The public key lives in the client |

The hero cover needs WebGPU (`navigator.gpu`). `Hero` does not pass an `onError` fallback, so browsers without WebGPU get an empty cover.

### Backend (serverless)
| Layer | Choice |
| --- | --- |
| Host / functions | **Netlify** (`netlify/functions`) |
| HTTP surface | `/api/*` → `/.netlify/functions/:splat` ([`netlify.toml`](netlify.toml)) |
| HTML parse | **cheerio** — site-audit crawl and the public GitHub contribution calendar |

### AI & voice APIs
| Concern | Provider | Detail |
| --- | --- | --- |
| Voice LLM | **Groq** (OpenAI-compatible SDK) | `GROQ_VOICE_MODEL`, default `qwen/qwen3.8-27b`. Fallbacks: `openai/gpt-oss-20b`, then `openai/gpt-oss-120b` |
| Reports / analysis LLM | **Groq** | `GROQ_MODEL`, default `openai/gpt-oss-120b` — call reports and the audit narrative |
| Speech-to-text | **Groq Whisper** | `whisper-large-v3-turbo`, language `en` |
| Text-to-speech | **ElevenLabs** raced with **Edge neural** | `eleven_turbo_v2_5` and `en-US-AriaNeural` start together. First good audio wins. Quota/auth failures cool ElevenLabs down for 1 hour |
| TTS last resort | Browser `speechSynthesis` | Only if `/api/tts` fails |
| Call leads | **Telegram Bot API** + **Google Sheets** Apps Script webhook | Fired on voice hang-up |
| GitHub activity | **GitHub REST + GraphQL** | `GITHUB_TOKEN` preferred. Without it, the calendar is scraped from the public contribution page |

Secrets stay on the server. The browser only calls `/api/*`. EmailJS is the exception: it runs in the browser with a public key.

### Installed, not mounted
These are in `package.json` but no live screen imports them. `src/components/Visuals/Scene.jsx` is the only Three.js scene, and nothing renders it.

- `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three`
- `@studio-freight/lenis` (leftover `.lenis` rules in `src/index.css`)
- `tweakpane`, `html2canvas`, `normalize.css`
- `Carousel`, `Magnetic`, `SecondPopUp`, `VoiceCallModal`, `VoiceHint`

---

## Architecture (high level)

```
Browser (React)
  ├─ Hero (vgpu ShapeWaves) + community rail
  ├─ Work tabs: Projects | GitHub Activity
  ├─ Skills, Experience, About, Contact
  ├─ People page, project detail, Webflow archive
  ├─ Tia voice UI (captions, session controls, barge-in)
  ├─ Chatbot panel
  └─ Site Audit modal + PDF
         │
         ▼  /api/*
Netlify Functions
  ├─ chat.js            → Groq (chat | site | voice)
  ├─ stt.js             → Groq Whisper
  ├─ tts.js             → ElevenLabs ∥ Edge Aria
  ├─ call-report.js     → structure call → Telegram (+ Sheets)
  ├─ site-audit.js      → crawl + score (+ optional Groq narrative)
  └─ github-profile.js  → public profile, calendar, 6 newest repos
```

### Important client folders
- `src/hooks/useVoiceAgent.js` — voice session state machine
- `src/services/voice-agent/` — recorder, silence detection, barge-in, mic warm/mutex, transcript guards, TTS player, site actions
- `src/components/` — UI (Hero, ShapeWaves, WorkTabs, GitHubActivity, People, Chatbot, SiteAuditModal, …)
- `src/data/projects.js` — curated case studies
- `src/data/webflowDeliveries.js` — Webflow archive entries
- `src/data/people.js` — inspiration profiles

### API routes
| Client path | Function | Method |
| --- | --- | --- |
| `/api/chat` | `chat.js` | POST |
| `/api/stt` | `stt.js` | POST |
| `/api/tts` | `tts.js` | POST |
| `/api/call-report` | `call-report.js` | POST |
| `/api/site-audit` | `site-audit.js` | POST |
| `/api/github-profile` | `github-profile.js` | GET |

---

## Feature deep-dive

### 1. Tia — unified site voice agent
After the intro, Tia greets and listens site-wide.

**Turn pipeline**
1. Warm mic → record until silence
2. `/api/stt` (Whisper)
3. `/api/chat` with `mode: "site"` → `{ speak, actions }`
4. `/api/tts` → play whichever neural audio returns first
5. Execute actions in parallel (scroll, open project, resume, audit, chat, Webflow archive, hang up)

**UX details**
- Top-right glass “thought” captions for Tia / visitor turns
- Bottom session controls (mute / hang up / retry)
- **Barge-in:** speaking over Tia stops TTS and starts listening
- Lead capture during the call; hang-up submits `/api/call-report`
- Intro can be dismissed once per tab (`sessionStorage` key `voice-intro-dismissed`)

### 2. Typed chatbot
Floating assistant for text (and optional browser dictation). Shares Groq via `/api/chat`. Can hand off to **Talk with Tia**. Uses a mic mutex so chatbot and Tia do not fight over the microphone.

### 3. Free site audit
Visitor pastes a URL → serverless crawl (homepage + limited same-origin pages, SSRF-hardened) → heuristic scores → optional Groq write-up → charts + PDF download.

### 4. GitHub Activity
The homepage tab calls `GET /api/github-profile`. It shows DevAnikRoy’s public repository count, followers, the current UTC year’s contribution calendar, and six newest public, non-fork, non-archived repositories. Those cards stay separate from the curated case studies.

Netlify CDN caches the response for 15 minutes and may serve a stale copy for up to an hour. The browser refreshes every 15 minutes while the tab is visible, and again when the visitor returns. A failed refresh keeps the last good payload. Counts are never invented. Setup notes: [`GITHUB_ACTIVITY.md`](GITHUB_ACTIVITY.md).

### 5. People
`src/data/people.js` is a static list (checked 2026-10-17). The community rail previews three names. **See all** opens `#people`, with filters for GitHub, X, LinkedIn, Facebook, Website, and YouTube.

### 6. Visual layer
The first screen is the vgpu shape-wave field: a text mask (`</>`), mixed squares/circles/triangles, and pointer splashes. GSAP still drives the custom cursor and the intro popup. Section changes use the browser’s smooth scroll.

---

## Engineering problems → solutions

| Problem | Approach in this repo |
| --- | --- |
| API keys in the browser | Groq, ElevenLabs, Telegram, Sheets, and the GitHub token run in Netlify Functions |
| Slow or quota-limited ElevenLabs | `/api/tts` starts ElevenLabs and Edge Aria together. First successful buffer wins. Auth/quota errors set a 1 hour cooldown. The client can still fall back to browser TTS |
| A deprecated voice model blanking Tia | `GROQ_VOICE_MODEL` is tried first, then `qwen/qwen3.8-27b`, `openai/gpt-oss-20b`, and `openai/gpt-oss-120b` |
| User cut off mid-sentence | Longer silence window before ending a turn |
| Tia hears herself (echo) | Ignore window after speak + barge-in / transcript guards |
| Whisper “ghost” phrases (e.g. empty-room “thank you”) | `transcriptGuard` filters known hallucinations |
| Cold mic delay on first listen | `micWarm` opens the stream early (intro / before speak) |
| Chat + voice both wanting the mic | `micMutex` pauses navigation mic while overlays use audio |
| Audit abused as open proxy | URL validation + private IP blocking in crawl utils |
| Audit without Groq | Deterministic narrative from crawl scores still returns |
| GitHub calendar without a token | Public contribution HTML via cheerio. If GitHub changes that markup, the calendar shows unavailable instead of fake counts |
| Sheets webhook 401 | Apps Script must allow “Anyone” access; example in `scripts/google-sheets-apps-script.example.js` |

---

## Local development

### Prerequisites
- Node.js **20.19+** or **22.12+** (Vite 7)
- [Netlify CLI](https://docs.netlify.com/cli/get-started/) (`npm i -g netlify-cli`)
- API keys (see below)

### Setup
```bash
git clone https://github.com/DevAnikRoy/my-portfolio.git
cd my-portfolio
npm install
cp .env.example .env
# fill keys in .env
```

### Environment variables
```bash
GROQ_API_KEY=
GROQ_MODEL=openai/gpt-oss-120b
GROQ_VOICE_MODEL=qwen/qwen3.8-27b
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
GOOGLE_SHEETS_WEBHOOK_URL=

# Raced against Edge Aria. Either side can win.
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=

# Server-only. Never prefix with VITE_.
GITHUB_TOKEN=
```

Set the same keys in **Netlify → Site settings → Environment variables** for production.

> **Note:** Some ElevenLabs library voices require a paid plan. Use a voice ID that works on your tier. When ElevenLabs is slow, rejected, or cooling down, Tia still speaks via Edge Aria.

### Run (required for AI and GitHub activity)
```bash
netlify dev
```

`netlify dev` serves the Vite app **and** proxies `/api/*` to local functions.  
`npm run dev` starts only Vite — chat, Tia, audit, and GitHub activity will fail.

### Build
```bash
npm run build
npm run preview   # static dist only; functions still need Netlify
npm run lint
```

---

## Project structure (short)

```
src/
  App.jsx
  components/          # hero, work tabs, people, Tia, chat, audit
  hooks/useVoiceAgent.js
  services/voice-agent/
  data/                # projects, webflow deliveries, people
  utils/auditPdf.js
netlify/
  functions/           # chat, stt, tts, call-report, site-audit, github-profile
  functions/utils/     # localEnv, siteCrawl, navIntent
scripts/
  google-sheets-apps-script.example.js
  fetch-webflow-previews.mjs
```

---

## Contact

- **LinkedIn:** [Anik Roy](https://www.linkedin.com/in/anik-roy-2171621b3/)
- **GitHub:** [@DevAnikRoy](https://github.com/DevAnikRoy)
- **Email:** anikroy302@gmail.com

---

*Portfolio + interactive AI command layer — React, Vite, vgpu, Netlify Functions, Groq, ElevenLabs, and Edge TTS.*
