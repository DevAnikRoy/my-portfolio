# Anik Roy — Portfolio

**Live:** [https://dev-anik.netlify.app](https://dev-anik.netlify.app)

Personal portfolio for **Anik Roy** (Frontend & Webflow developer at Softvence). Beyond a static resume site, it ships a production-style **voice + chat AI layer** that navigates the page, scopes work with visitors, runs a free site audit, and delivers leads to Telegram / Google Sheets.

Built so another developer can run it locally, and a recruiter can see **what stack is used** and **what engineering problems were solved**.

---

## What problem this solves

| Visitor need | How the site answers |
| --- | --- |
| “Show me your work without scrolling forever” | **Sam** — a voice agent that scrolls, opens projects, resume, audit, and chat from natural speech |
| “Talk like a human, not a FAQ bot” | Groq LLM with a site-mode persona that returns `{ speak, actions }` for speech + UI control |
| “Is my site any good?” | **Free site audit** — crawl + SEO/perf heuristics + optional LLM narrative + PDF export |
| “How do I reach Anik?” | Voice lead capture on hang-up → Telegram (+ Sheets); contact form via EmailJS; chatbot handoffs |

---

## Tech stack

### Frontend
| Layer | Choice |
| --- | --- |
| UI | **React 18** + **Vite 7** |
| Styling | **Tailwind CSS 3** |
| Motion | **GSAP** (cursor, magnetic UI, intro, carousel) |
| 3D | **Three.js** + **React Three Fiber** + **drei** |
| Icons | lucide-react, react-icons |
| PDF | jspdf (+ html2canvas) |
| Forms | @emailjs/browser |

### Backend (serverless)
| Layer | Choice |
| --- | --- |
| Host / functions | **Netlify** (`netlify/functions`) |
| HTTP surface | `/api/*` → `/.netlify/functions/:splat` ([`netlify.toml`](netlify.toml)) |

### AI & voice APIs
| Concern | Provider | Detail |
| --- | --- | --- |
| LLM | **Groq** (OpenAI-compatible) | Default model `openai/gpt-oss-120b` (`GROQ_MODEL`) |
| Speech-to-text | **Groq Whisper** | `whisper-large-v3-turbo` |
| Text-to-speech (primary) | **ElevenLabs** | `eleven_turbo_v2_5` + configured voice ID |
| TTS fallback | **Microsoft Edge neural** via `msedge-tts` | `en-US-JennyNeural` when ElevenLabs fails / quota / cooldown |
| TTS last resort | Browser `speechSynthesis` | Only if server TTS is unavailable |
| Call leads | **Telegram Bot API** + **Google Sheets** Apps Script webhook | Fired on voice hang-up |

Secrets stay on the server. The browser only calls `/api/*`.

---

## Architecture (high level)

```
Browser (React)
  ├─ Portfolio sections (Hero → Contact)
  ├─ Sam voice UI (captions, session controls, barge-in)
  ├─ Chatbot panel
  └─ Site Audit modal + PDF
         │
         ▼  POST /api/*
Netlify Functions
  ├─ chat.js          → Groq LLM (chat | site modes)
  ├─ stt.js           → Groq Whisper
  ├─ tts.js           → ElevenLabs → Edge Jenny fallback
  ├─ call-report.js   → structure call → Telegram (+ Sheets)
  └─ site-audit.js    → crawl + score (+ optional Groq narrative)
```

### Important client folders
- `src/hooks/useVoiceAgent.js` — voice session state machine
- `src/services/voice-agent/` — recorder, silence detection, barge-in, mic warm/mutex, transcript guards, TTS player, site actions
- `src/components/` — UI (Hero, Projects, Chatbot, AgentFloatingCaptions, SiteAuditModal, …)
- `src/data/projects.js` — project content

### API routes
| Client path | Function |
| --- | --- |
| `/api/chat` | `chat.js` |
| `/api/stt` | `stt.js` |
| `/api/tts` | `tts.js` |
| `/api/call-report` | `call-report.js` |
| `/api/site-audit` | `site-audit.js` |

---

## Feature deep-dive

### 1. Sam — unified site voice agent
After the intro, Sam greens and listens site-wide.

**Turn pipeline**
1. Warm mic → record until silence
2. `/api/stt` (Whisper)
3. `/api/chat` with `mode: "site"` → `{ speak, actions }`
4. `/api/tts` → play audio
5. Execute actions in parallel (scroll, open project, resume, audit, chat, etc.)

**UX details**
- Top-right glass “thought” captions for Sam / visitor turns
- Bottom session controls (mute / hang up / retry)
- **Barge-in:** speaking over Sam stops TTS and starts listening
- Lead capture during the call; hang-up submits `/api/call-report`

### 2. Typed chatbot
Floating assistant for text (and optional browser dictation). Shares Groq via `/api/chat`. Can hand off to **Talk with Sam**. Uses a mic mutex so chatbot and Sam do not fight over the microphone.

### 3. Free site audit
Visitor pastes a URL → serverless crawl (homepage + limited same-origin pages, SSRF-hardened) → heuristic scores → optional Groq write-up → charts + PDF download.

### 4. Visual / motion layer
R3F hero scene, GSAP magnetic interactions, custom cursor, and smooth section navigation — the “portfolio craft” layer recruiters see first; the AI layer is the engineering differentiator.

---

## Engineering problems → solutions

| Problem | Approach in this repo |
| --- | --- |
| API keys in the browser | All Groq / ElevenLabs / Telegram / Sheets calls run in Netlify Functions |
| ElevenLabs free quota / paid-voice / rate limits | `/api/tts` tries ElevenLabs first; on auth/quota/errors sets a cooldown and falls back to Edge Jenny; client can still fall back to browser TTS |
| Robotic voice when neural TTS is slow | Prefer waiting on server neural audio; browser TTS is last resort only |
| User cut off mid-sentence | Longer silence window before ending a turn |
| Sam hears herself (echo) | Ignore window after speak + barge-in / transcript guards |
| Whisper “ghost” phrases (e.g. empty-room “thank you”) | `transcriptGuard` filters known hallucinations |
| Cold mic delay on first listen | `micWarm` opens the stream early (intro / before speak) |
| Chat + voice both wanting the mic | `micMutex` pauses navigation mic while overlays use audio |
| Audit abused as open proxy | URL validation + private IP blocking in crawl utils |
| Audit without Groq | Deterministic narrative from crawl scores still returns |
| Sheets webhook 401 | Apps Script must allow “Anyone” access; example in `scripts/google-sheets-apps-script.example.js` |

---

## Local development

### Prerequisites
- Node.js 18+
- [Netlify CLI](https://docs.netlify.com/cli/get-started/) (`npm i -g netlify-cli`)
- API keys (see below)

### Setup
```bash
git clone https://github.com/DevAnikRoy/my-portfolio.git
cd my-portfolio
npm install --legacy-peer-deps
cp .env.example .env
# fill keys in .env
```

### Environment variables
```bash
GROQ_API_KEY=
GROQ_MODEL=openai/gpt-oss-120b
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
GOOGLE_SHEETS_WEBHOOK_URL=

# Primary TTS; Edge Jenny is automatic fallback
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=
```

Set the same keys in **Netlify → Site settings → Environment variables** for production.

> **Note:** Some ElevenLabs library voices require a paid plan. Use a voice ID that works on your tier (free accounts may need a default/premade voice). When ElevenLabs rejects a request, Sam still speaks via Edge fallback.

### Run (required for AI)
```bash
netlify dev
```

`netlify dev` builds the Vite app **and** proxies `/api/*` to local functions.  
`npm run dev` alone starts only Vite — chat / Sam / audit APIs will fail.

### Build
```bash
npm run build
```

---

## Project structure (short)

```
src/
  App.jsx
  components/          # portfolio UI + Sam / chat / audit overlays
  hooks/useVoiceAgent.js
  services/voice-agent/
  data/projects.js
  utils/auditPdf.js
netlify/
  functions/           # chat, stt, tts, call-report, site-audit
  functions/utils/     # localEnv, siteCrawl
scripts/
  google-sheets-apps-script.example.js
```

---

## Contact

- **LinkedIn:** [Anik Roy](https://www.linkedin.com/in/anik-roy-2171621b3/)
- **GitHub:** [@DevAnikRoy](https://github.com/DevAnikRoy)
- **Email:** anikroy302@gmail.com

---

*Portfolio + interactive AI command layer — React, Netlify Functions, Groq, ElevenLabs, and Edge TTS fallback.*
