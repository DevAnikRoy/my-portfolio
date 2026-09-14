import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import WEBFLOW_DELIVERIES from "../src/data/webflowDeliveries.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "webflow-previews");

function hostSlug(live) {
  return new URL(live).hostname.replace(/\.webflow\.io$/i, "");
}

function shotUrl(live) {
  const clean = live.replace(/\/$/, "");
  return `https://v1.screenshot.11ty.dev/${encodeURIComponent(clean)}/opengraph/`;
}

async function fetchOne(live) {
  const slug = hostSlug(live);
  const dest = path.join(outDir, `${slug}.jpg`);
  const url = shotUrl(live);
  const res = await fetch(url, {
    headers: { Accept: "image/*", "User-Agent": "my-portfolio-preview-cache/1.0" },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 4000) throw new Error(`tiny file (${buf.length}b)`);
  await writeFile(dest, buf);
  return { slug, bytes: buf.length };
}

await mkdir(outDir, { recursive: true });

const queue = [...WEBFLOW_DELIVERIES];
const failed = [];
let ok = 0;
const workers = 2;

async function worker() {
  while (queue.length) {
    const item = queue.shift();
    try {
      const result = await fetchOne(item.live);
      ok += 1;
      console.log(`ok ${ok}/${WEBFLOW_DELIVERIES.length} ${result.slug} (${result.bytes}b)`);
    } catch (err) {
      failed.push({ title: item.title, live: item.live, error: String(err.message || err) });
      console.error(`fail ${item.title}: ${err.message || err}`);
    }
    await new Promise((r) => setTimeout(r, 350));
  }
}

await Promise.all(Array.from({ length: workers }, () => worker()));

if (failed.length) {
  console.error(`\nFailed ${failed.length}:`);
  for (const f of failed) console.error(`- ${f.title} (${f.live}): ${f.error}`);
  process.exitCode = 1;
} else {
  console.log(`\nCached ${ok} Webflow previews.`);
}
