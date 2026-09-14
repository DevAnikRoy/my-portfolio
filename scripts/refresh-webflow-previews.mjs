import { unlink, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import WEBFLOW_DELIVERIES from "../src/data/webflowDeliveries.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "webflow-previews");

function hostSlug(live) {
  return new URL(live).hostname.replace(/\.webflow\.io$/i, "");
}

function destFor(live) {
  return path.join(outDir, `${hostSlug(live)}.jpg`);
}

async function liveStatus(live) {
  try {
    const res = await fetch(live, { method: "GET", redirect: "follow" });
    return res.status;
  } catch {
    return 0;
  }
}

async function downloadThum(live, dest) {
  const url = `https://image.thum.io/get/width/1200/noanimate/${live}`;
  const res = await fetch(url, {
    headers: { Accept: "image/*", "User-Agent": "my-portfolio-preview-cache/1.0" },
  });
  if (!res.ok) throw new Error(`thum ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 25000) throw new Error(`thum tiny ${buf.length}`);
  await writeFile(dest, buf);
  return buf.length;
}

async function download11ty(live, dest) {
  const clean = live.replace(/\/$/, "");
  const url = `https://v1.screenshot.11ty.dev/${encodeURIComponent(clean)}/opengraph/`;
  const res = await fetch(url, {
    headers: { Accept: "image/*", "User-Agent": "my-portfolio-preview-cache/1.0" },
  });
  if (!res.ok) throw new Error(`11ty ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 25000) throw new Error(`11ty tiny ${buf.length}`);
  await writeFile(dest, buf);
  return buf.length;
}

const unpublished = [];
const refreshed = [];
const stillBad = [];

for (const item of WEBFLOW_DELIVERIES) {
  const dest = destFor(item.live);
  const status = await liveStatus(item.live);
  const size = await stat(dest)
    .then((s) => s.size)
    .catch(() => 0);

  if (status !== 200) {
    if (size) {
      await unlink(dest).catch(() => {});
    }
    unpublished.push(`${item.title} (${status})`);
    console.log(`unpublished ${item.title} → fallback card`);
    continue;
  }

  if (size >= 25000) {
    console.log(`keep ${hostSlug(item.live)} (${size}b)`);
    continue;
  }

  try {
    const bytes = await download11ty(item.live, dest).catch(() =>
      downloadThum(item.live, dest)
    );
    refreshed.push(`${item.title} (${bytes}b)`);
    console.log(`refreshed ${item.title} (${bytes}b)`);
  } catch (err) {
    await unlink(dest).catch(() => {});
    stillBad.push(`${item.title}: ${err.message}`);
    console.error(`no preview ${item.title}: ${err.message}`);
  }
}

console.log(`\nUnpublished/404 (${unpublished.length}):`);
unpublished.forEach((line) => console.log(`- ${line}`));
if (stillBad.length) {
  console.log(`\nStill no preview (${stillBad.length}):`);
  stillBad.forEach((line) => console.log(`- ${line}`));
}
console.log(`\nRefreshed: ${refreshed.length}`);
