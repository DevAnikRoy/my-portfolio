import WEBFLOW_DELIVERIES from "../src/data/webflowDeliveries.js";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

function looksBroken(html, status) {
  const text = String(html || "").toLowerCase();
  if (status !== 200) return `http ${status}`;
  if (
    text.includes("page not found") ||
    text.includes("the page you are looking for doesn't exist") ||
    text.includes("this page does not exist") ||
    text.includes("w-mod-404") ||
    /<title>\s*404\s*</i.test(html)
  ) {
    return "404-page";
  }
  if (
    text.includes("this site is password protected") ||
    text.includes("enter password") && text.includes("webflow")
  ) {
    return "password";
  }
  if (html.length < 1500) return "too-thin";
  return null;
}

function extractCanonical(html, live) {
  const canon = html.match(
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i
  );
  const og = html.match(
    /<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i
  );
  const href = (canon && canon[1]) || (og && og[1]) || "";
  if (!href) return null;
  try {
    const abs = new URL(href, live).href;
    const host = new URL(abs).hostname;
    if (host && host !== new URL(live).hostname) return abs;
  } catch {
    return null;
  }
  return null;
}

function pageShape(html) {
  const navLinks = (html.match(/href=["']\/[a-z0-9-/]+["']/gi) || []).length;
  const hasMotion =
    /data-w-id|w-json|lottie|gsap|scrolltrigger|data-animation/i.test(html);
  return { navLinks, hasMotion, bytes: html.length };
}

async function probe(item) {
  const live = item.live;
  try {
    const res = await fetch(live, {
      redirect: "follow",
      headers: { "User-Agent": UA, Accept: "text/html" },
    });
    const html = await res.text();
    const reason = looksBroken(html, res.status);
    const finalUrl = res.url || live;
    const canonical = extractCanonical(html, live);
    const shape = pageShape(html);
    return {
      title: item.title,
      live,
      finalUrl,
      canonical,
      status: res.status,
      reason,
      ok: !reason,
      ...shape,
    };
  } catch (err) {
    return {
      title: item.title,
      live,
      status: 0,
      reason: String(err.message || err),
      ok: false,
    };
  }
}

const results = [];
const queue = [...WEBFLOW_DELIVERIES];
async function worker() {
  while (queue.length) {
    const item = queue.shift();
    const row = await probe(item);
    results.push(row);
    const mark = row.ok ? "OK " : "BAD";
    console.log(
      `${mark} ${row.status} ${row.title} ${row.reason || ""} ${row.canonical || ""} nav:${row.navLinks || 0} motion:${row.hasMotion ? 1 : 0}`
    );
  }
}

await Promise.all(Array.from({ length: 6 }, () => worker()));

const ok = results.filter((r) => r.ok);
const bad = results.filter((r) => !r.ok);
console.log(`\nOK ${ok.length} / BAD ${bad.length}`);
console.log("\nWORKING:");
ok.forEach((r) =>
  console.log(
    `- ${r.title} | ${r.finalUrl} | nav=${r.navLinks} motion=${r.hasMotion} bytes=${r.bytes}`
  )
);
console.log("\nBROKEN:");
bad.forEach((r) => console.log(`- ${r.title} | ${r.live} | ${r.reason}`));
