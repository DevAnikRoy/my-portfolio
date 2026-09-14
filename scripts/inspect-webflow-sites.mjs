import WEBFLOW_DELIVERIES from "../src/data/webflowDeliveries.js";

const CANDIDATES = [
  ["Blue Hour Housing", "https://www.bluehourhousing.com/"],
  ["Kryptofuchs", "https://kryptofuchs-consulting.de/"],
  ["Charge Smart", "https://www.chargesmartev.com/"],
];

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128 Safari/537.36";

async function inspect(title, url) {
  try {
    const res = await fetch(url, { redirect: "follow", headers: { "User-Agent": UA, Accept: "text/html" } });
    const html = await res.text();
    const titleTag = (html.match(/<title[^>]*>([^<]+)/i) || ["", ""])[1].replace(/\s+/g, " ").trim();
    const wf = /w-mod-|webflow\.js|cdn\.prod\.website-files|website-files.com/.test(html);
    const nf = /page not found|doesn.?t exist or has been moved/i.test(html);
    const template = /webflow html website template/i.test(html) || /webflow template/i.test(titleTag);
    const password = /password protected/i.test(html);
    const nav = (html.match(/href=["']\/[a-z0-9][a-z0-9-/_]*["']/gi) || []).length;
    const motion = /data-w-id|w-json|lottie|gsap|scrolltrigger/i.test(html);
    const h1 = (html.match(/<h1[^>]*>([\s\S]{0,120}?)<\/h1>/i) || ["", ""] )[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return {
      title,
      url: res.url,
      status: res.status,
      bytes: html.length,
      wf,
      nf,
      template,
      password,
      nav,
      motion,
      titleTag,
      h1,
    };
  } catch (e) {
    return { title, url, error: e.message };
  }
}

const rows = [];
for (const p of WEBFLOW_DELIVERIES) {
  rows.push(await inspect(p.title, p.live));
}
for (const [t, u] of CANDIDATES) {
  rows.push(await inspect(`${t} (alt)`, u));
}

for (const r of rows) {
  if (r.error) {
    console.log(`ERR ${r.title} ${r.error}`);
    continue;
  }
  const flags = [
    r.wf ? "WF" : "NO-WF",
    r.nf ? "404PAGE" : "",
    r.template ? "TEMPLATE" : "",
    r.password ? "PW" : "",
    r.motion ? "MOTION" : "",
    r.nav > 8 ? "MULTI" : "LANDING",
  ]
    .filter(Boolean)
    .join(" ");
  console.log(`${r.status} ${String(r.bytes).padStart(6)} ${flags.padEnd(28)} ${r.title}`);
  console.log(`   ${r.url}`);
  console.log(`   title="${r.titleTag}" h1="${r.h1.slice(0, 80)}"`);
}
