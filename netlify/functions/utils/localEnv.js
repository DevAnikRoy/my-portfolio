/**
 * Load .env into process.env for local `netlify dev` when Netlify
 * does not inject function-scoped secrets into the Lambda runner.
 * No-op in production (env vars come from Netlify).
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

let loaded = false;

function parseEnvFile(contents) {
  const text = String(contents || "").replace(/^\uFEFF/, "");
  const out = {};

  for (const raw of text.split(/\r?\n/)) {
    let line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    if (line.toLowerCase().startsWith("export ")) {
      line = line.slice(7).trim();
    }
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key) out[key] = value;
  }

  return out;
}

function envFileCandidates() {
  const files = [];
  const seen = new Set();
  const add = (file) => {
    const resolved = resolve(file);
    if (seen.has(resolved)) return;
    seen.add(resolved);
    files.push(resolved);
  };

  const startDirs = [];
  try {
    startDirs.push(dirname(fileURLToPath(import.meta.url)));
  } catch {
    /* ignore */
  }
  if (process.cwd()) startDirs.push(process.cwd());
  if (process.env.INIT_CWD) startDirs.push(process.env.INIT_CWD);

  for (const start of startDirs) {
    let dir = start;
    for (let i = 0; i < 8; i += 1) {
      add(resolve(dir, ".env"));
      add(resolve(dir, ".env.local"));
      const parent = resolve(dir, "..");
      if (parent === dir) break;
      dir = parent;
    }
  }

  return files;
}

export function ensureLocalEnv() {
  if (loaded) return;
  loaded = true;

  const context = process.env.CONTEXT;
  if (process.env.NETLIFY === "true" && context && context !== "dev") {
    return;
  }

  for (const file of envFileCandidates()) {
    if (!existsSync(file)) continue;
    const parsed = parseEnvFile(readFileSync(file, "utf8"));
    for (const [key, value] of Object.entries(parsed)) {
      if (!String(process.env[key] || "").trim() && value) {
        process.env[key] = value;
      }
    }
  }
}

export function getGroqApiKey() {
  ensureLocalEnv();
  return String(process.env.GROQ_API_KEY || "").trim();
}

export function missingGroqKeyMessage() {
  const local =
    process.env.NETLIFY_DEV === "true" ||
    process.env.CONTEXT === "dev" ||
    !process.env.CONTEXT;
  if (local) {
    return "GROQ_API_KEY is missing locally. Add it to `.env` in the project root (same value as Netlify → Environment variables), then restart `netlify dev`. Vite's `npm run dev` cannot serve `/api/stt`.";
  }
  return "GROQ_API_KEY is not set for this Netlify deploy. Add it in Site configuration → Environment variables, then redeploy.";
}
