/**
 * Load .env into process.env for local `netlify dev` when Netlify
 * does not inject function-scoped secrets into the Lambda runner.
 * No-op in production (env vars come from Netlify).
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

let loaded = false;

export function ensureLocalEnv() {
  if (loaded) return;
  loaded = true;
  if (process.env.NETLIFY === "true" && process.env.CONTEXT && process.env.CONTEXT !== "dev") {
    return;
  }

  const candidates = [
    resolve(process.cwd(), ".env"),
    resolve(process.cwd(), "../../.env"),
    resolve(process.cwd(), "../../../.env"),
  ];

  for (const file of candidates) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
    break;
  }
}
