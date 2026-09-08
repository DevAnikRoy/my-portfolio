import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import * as cheerio from "cheerio";

const UA =
  "AnikRoySiteAudit/1.0 (+https://dev-anik.netlify.app; website inspection for a requested audit)";
const MAX_HTML = 1_500_000;
const MAX_PAGES = 4;
const FETCH_MS = 9000;

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function isBlockedIp(ip) {
  const v = String(ip || "").replace(/^::ffff:/, "").toLowerCase();
  if (!v) return true;
  if (v === "::1" || v === "0.0.0.0") return true;
  if (v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80")) return true;
  const m = v.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (!m) return false;
  const a = m.slice(1).map(Number);
  if (a[0] === 10 || a[0] === 127 || a[0] === 0) return true;
  if (a[0] === 169 && a[1] === 254) return true;
  if (a[0] === 172 && a[1] >= 16 && a[1] <= 31) return true;
  if (a[0] === 192 && a[1] === 168) return true;
  if (a[0] === 100 && a[1] >= 64 && a[1] <= 127) return true;
  if (a[0] === 198 && (a[1] === 18 || a[1] === 19)) return true;
  return false;
}

export async function assertPublicHttpUrl(raw) {
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error("Enter a full URL, like https://example.com");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only http and https URLs can be audited.");
  }
  if (parsed.username || parsed.password) {
    throw new Error("URLs with credentials are not allowed.");
  }
  const host = parsed.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (
    !host ||
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host.endsWith(".lan")
  ) {
    throw new Error("That host cannot be audited.");
  }

  let records;
  try {
    records = isIP(host)
      ? [{ address: host }]
      : await lookup(host, { all: true, verbatim: true });
  } catch {
    throw new Error(`Could not resolve ${host}. Check the URL and try again.`);
  }
  if (!records.length || records.some((r) => isBlockedIp(r.address))) {
    throw new Error("That host cannot be audited.");
  }
  return parsed;
}

async function fetchFollow(startUrl, { method = "GET", accept } = {}) {
  let current = startUrl;
  const hops = [];
  for (let i = 0; i < 5; i += 1) {
    await assertPublicHttpUrl(current);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_MS);
    const started = Date.now();
    let res;
    try {
      res = await fetch(current, {
        method,
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "User-Agent": UA,
          Accept: accept || "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });
    } catch (err) {
      clearTimeout(timer);
      if (err?.name === "AbortError") {
        throw new Error(`Timed out fetching ${current}`);
      }
      throw new Error(`Could not reach ${current}`);
    }
    clearTimeout(timer);
    const ms = Date.now() - started;
    hops.push({ url: current, status: res.status, ms });

    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) break;
      current = new URL(loc, current).href;
      continue;
    }
    return { res, finalUrl: current, hops, ms };
  }
  throw new Error("Too many redirects.");
}

function headerMap(res) {
  const pick = [
    "content-type",
    "content-length",
    "server",
    "x-powered-by",
    "strict-transport-security",
    "content-security-policy",
    "x-frame-options",
    "x-content-type-options",
    "referrer-policy",
    "cache-control",
    "cdn-cache-control",
    "alt-svc",
  ];
  const out = {};
  for (const key of pick) {
    const val = res.headers.get(key);
    if (val) out[key] = val.slice(0, 280);
  }
  return out;
}

function visibleText($) {
  $("script, style, noscript, svg, iframe").remove();
  return $("body").text().replace(/\s+/g, " ").trim();
}

function detectStack(html, headers, $) {
  const blob = `${html.slice(0, 80_000)} ${JSON.stringify(headers)}`.toLowerCase();
  const hits = [];
  const tests = [
    ["Webflow", /webflow|w-mod-/],
    ["WordPress", /wp-content|wordpress/],
    ["Shopify", /cdn\.shopify|shopify/],
    ["Wix", /wixstatic|wix\.com/],
    ["Squarespace", /squarespace/],
    ["React", /data-reactroot|_next\/static|react-root/],
    ["Next.js", /_next\/static|__next/],
    ["Framer", /framerusercontent|framer\.com/],
    ["Google Analytics", /gtag\/js|googletagmanager/],
    ["Google Tag Manager", /googletagmanager\.com\/gtm/],
  ];
  for (const [name, re] of tests) {
    if (re.test(blob)) hits.push(name);
  }
  const gen = $('meta[name="generator"]').attr("content");
  if (gen) hits.push(`Generator: ${gen.slice(0, 80)}`);
  if (headers.server) hits.push(`Server: ${headers.server}`);
  return [...new Set(hits)];
}

function extractPage(html, pageUrl, headers, timingMs, status) {
  const $ = cheerio.load(html);
  const title = $("title").first().text().trim();
  const description =
    $('meta[name="description"]').attr("content")?.trim() ||
    $('meta[property="og:description"]').attr("content")?.trim() ||
    "";
  const canonical = $('link[rel="canonical"]').attr("href") || "";
  const robots = $('meta[name="robots"]').attr("content") || "";
  const ogTitle = $('meta[property="og:title"]').attr("content") || "";
  const ogImage = $('meta[property="og:image"]').attr("content") || "";
  const viewport = $('meta[name="viewport"]').attr("content") || "";
  const lang = $("html").attr("lang") || "";
  const charset =
    $("meta[charset]").attr("charset") ||
    $('meta[http-equiv="content-type"]').attr("content") ||
    "";

  const headings = { h1: [], h2: [], h3: [] };
  ["h1", "h2", "h3"].forEach((tag) => {
    $(tag).each((_, el) => {
      const t = $(el).text().replace(/\s+/g, " ").trim();
      if (t) headings[tag].push(t.slice(0, 140));
    });
  });

  const images = [];
  $("img").each((_, el) => {
    const alt = $(el).attr("alt");
    images.push({
      src: ($(el).attr("src") || $(el).attr("data-src") || "").slice(0, 180),
      alt: alt == null ? null : String(alt).slice(0, 120),
      hasWidth: Boolean($(el).attr("width") || $(el).attr("height")),
      lazy: ($(el).attr("loading") || "").toLowerCase() === "lazy",
    });
  });

  const links = [];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    links.push({
      href: href.slice(0, 220),
      text: $(el).text().replace(/\s+/g, " ").trim().slice(0, 80),
    });
  });

  const jsonLd = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).text().trim().slice(0, 400);
    if (raw) jsonLd.push(raw);
  });

  const scriptCount = $("script").length;
  const stylesheetCount = $('link[rel="stylesheet"]').length;
  const stack = detectStack(html, headers, $);
  const text = visibleText($);

  return {
    url: pageUrl,
    status,
    timingMs,
    title,
    description,
    canonical,
    robots,
    ogTitle,
    ogImage,
    viewport,
    lang,
    charset,
    headings,
    imageCount: images.length,
    imagesMissingAlt: images.filter((img) => img.alt == null || img.alt.trim() === "").length,
    imagesMissingSize: images.filter((img) => !img.hasWidth).length,
    linkCount: links.length,
    internalLinkHrefs: links
      .map((l) => l.href)
      .filter((h) => h.startsWith("/") || h.startsWith(pageUrl) || h.startsWith("https://") || h.startsWith("http://")),
    wordCount: text ? text.split(/\s+/).filter(Boolean).length : 0,
    textSample: text.slice(0, 1200),
    scriptCount,
    stylesheetCount,
    hasH1: headings.h1.length > 0,
    jsonLdCount: jsonLd.length,
    stack,
    htmlBytes: Buffer.byteLength(html),
    headers,
    ctaHints: links
      .filter((l) =>
        /book|demo|contact|get started|hire|pricing|start|talk|quote/i.test(
          `${l.text} ${l.href}`
        )
      )
      .slice(0, 8)
      .map((l) => l.text || l.href),
  };
}

function sameOriginLinks(page, origin) {
  const out = [];
  const seen = new Set();
  for (const href of page.internalLinkHrefs || []) {
    try {
      const abs = new URL(href, origin);
      if (abs.origin !== origin) continue;
      abs.hash = "";
      const key = abs.href.replace(/\/$/, "");
      if (seen.has(key)) continue;
      if (/\.(pdf|jpg|jpeg|png|gif|webp|svg|zip|mp4)$/i.test(abs.pathname)) continue;
      seen.add(key);
      out.push(abs.href);
    } catch {
      /* ignore */
    }
  }
  return out;
}

function pushFinding(findings, item) {
  findings.push(item);
}

function buildFindings(home, extras, probes) {
  const findings = [];
  const url = new URL(home.url);

  if (url.protocol !== "https:") {
    pushFinding(findings, {
      id: "https",
      area: "Security",
      severity: "critical",
      title: "Homepage is not served over HTTPS",
      evidence: home.url,
      recommendation: "Force HTTPS and redirect all HTTP traffic before ads or SEO work.",
    });
  } else {
    pushFinding(findings, {
      id: "https-ok",
      area: "Security",
      severity: "pass",
      title: "HTTPS is in use",
      evidence: home.url,
      recommendation: "",
    });
  }

  if (!home.headers["strict-transport-security"]) {
    pushFinding(findings, {
      id: "hsts",
      area: "Security",
      severity: "medium",
      title: "No Strict-Transport-Security header",
      evidence: "Response headers on the homepage do not include HSTS.",
      recommendation: "Add HSTS once HTTPS is stable so browsers keep visitors on TLS.",
    });
  }

  if (!home.headers["x-content-type-options"]) {
    pushFinding(findings, {
      id: "nosniff",
      area: "Security",
      severity: "low",
      title: "Missing X-Content-Type-Options: nosniff",
      evidence: "Header absent on homepage response.",
      recommendation: "Send nosniff to reduce MIME sniffing risk.",
    });
  }

  if (!home.title) {
    pushFinding(findings, {
      id: "title-missing",
      area: "SEO",
      severity: "critical",
      title: "No document title",
      evidence: "<title> is empty or missing.",
      recommendation: "Write a unique title of about 50–60 characters that names the offer and brand.",
    });
  } else if (home.title.length < 15 || home.title.length > 65) {
    pushFinding(findings, {
      id: "title-length",
      area: "SEO",
      severity: "medium",
      title: "Title length is outside the usual SERP range",
      evidence: `Title (${home.title.length} chars): “${home.title.slice(0, 90)}”`,
      recommendation: "Aim for roughly 15–60 characters. Lead with the search phrase a buyer would type.",
    });
  }

  if (!home.description) {
    pushFinding(findings, {
      id: "meta-desc",
      area: "SEO",
      severity: "high",
      title: "No meta description",
      evidence: "No name=description or og:description on the homepage.",
      recommendation: "Add a 140–160 character description that states the offer and a next step.",
    });
  } else if (home.description.length < 50 || home.description.length > 170) {
    pushFinding(findings, {
      id: "meta-desc-len",
      area: "SEO",
      severity: "low",
      title: "Meta description length is awkward for snippets",
      evidence: `Description is ${home.description.length} characters.`,
      recommendation: "Tighten to about 140–160 characters so Google is less likely to rewrite it.",
    });
  }

  if (home.headings.h1.length === 0) {
    pushFinding(findings, {
      id: "h1-missing",
      area: "SEO",
      severity: "high",
      title: "No H1 on the homepage",
      evidence: "Zero <h1> nodes in the HTML.",
      recommendation: "One clear H1 that matches the page promise. Do not hide it in an image only.",
    });
  } else if (home.headings.h1.length > 1) {
    pushFinding(findings, {
      id: "h1-many",
      area: "SEO",
      severity: "medium",
      title: "Multiple H1s on the homepage",
      evidence: home.headings.h1.map((h) => `“${h}”`).join("; "),
      recommendation: "Keep a single H1. Demote the rest to H2/H3.",
    });
  }

  if (!home.lang) {
    pushFinding(findings, {
      id: "lang",
      area: "Accessibility",
      severity: "medium",
      title: "html lang is missing",
      evidence: "<html> has no lang attribute.",
      recommendation: "Set lang to the primary language (for example en).",
    });
  }

  if (!home.viewport) {
    pushFinding(findings, {
      id: "viewport",
      area: "Performance",
      severity: "high",
      title: "No viewport meta tag",
      evidence: "Mobile layout will likely be desktop-scaled.",
      recommendation: "Add <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">.",
    });
  }

  if (home.imagesMissingAlt > 0) {
    pushFinding(findings, {
      id: "alt",
      area: "Accessibility",
      severity: home.imagesMissingAlt > 5 ? "high" : "medium",
      title: `${home.imagesMissingAlt} homepage image${home.imagesMissingAlt === 1 ? "" : "s"} missing alt text`,
      evidence: `${home.imagesMissingAlt} of ${home.imageCount} <img> tags have empty or missing alt.`,
      recommendation: "Describe meaningful images. Use alt=\"\" only when the image is decorative.",
    });
  }

  if (home.wordCount < 80) {
    pushFinding(findings, {
      id: "thin-copy",
      area: "Content",
      severity: "high",
      title: "Very little readable copy on the homepage",
      evidence: `About ${home.wordCount} words of visible text were extracted.`,
      recommendation: "If the story lives in images or canvas only, search engines and assistive tech cannot use it.",
    });
  }

  if (!home.ogImage) {
    pushFinding(findings, {
      id: "og-image",
      area: "SEO",
      severity: "low",
      title: "No Open Graph image",
      evidence: "og:image is missing.",
      recommendation: "Add a 1200×630 share image so LinkedIn and Slack unfurls look intentional.",
    });
  }

  if (home.ctaHints.length === 0) {
    pushFinding(findings, {
      id: "cta",
      area: "Content",
      severity: "medium",
      title: "No obvious conversion link on the homepage",
      evidence: "No anchor text matched book / demo / contact / hire / pricing / quote.",
      recommendation: "Put one primary action above the fold with a specific label, not just “Learn more”.",
    });
  }

  if (home.timingMs > 2500) {
    pushFinding(findings, {
      id: "ttfb",
      area: "Performance",
      severity: home.timingMs > 4500 ? "high" : "medium",
      title: "Slow homepage response",
      evidence: `First HTML response took ${home.timingMs} ms from this audit server.`,
      recommendation: "This is server/TTFB from a cloud function, not Lighthouse. Still worth checking hosting, redirects, and TTFB.",
    });
  }

  if (home.htmlBytes > 400_000) {
    pushFinding(findings, {
      id: "html-weight",
      area: "Performance",
      severity: "medium",
      title: "Homepage HTML is heavy",
      evidence: `${Math.round(home.htmlBytes / 1024)} KB of HTML.`,
      recommendation: "Trim unused sections, defer non-critical scripts, and avoid shipping huge inlined CSS.",
    });
  }

  if (/noindex/i.test(home.robots)) {
    pushFinding(findings, {
      id: "noindex",
      area: "SEO",
      severity: "critical",
      title: "Homepage is set to noindex",
      evidence: `robots meta: ${home.robots}`,
      recommendation: "Remove noindex if this page should appear in Google.",
    });
  }

  if (probes.robots.status && probes.robots.status >= 400) {
    pushFinding(findings, {
      id: "robots-txt",
      area: "SEO",
      severity: "low",
      title: "robots.txt was not found or failed",
      evidence: `${probes.robots.url} → HTTP ${probes.robots.status}`,
      recommendation: "A simple robots.txt avoids accidental crawl confusion as the site grows.",
    });
  }

  if (probes.sitemap.status && probes.sitemap.status >= 400) {
    pushFinding(findings, {
      id: "sitemap",
      area: "SEO",
      severity: "low",
      title: "No sitemap at /sitemap.xml",
      evidence: `${probes.sitemap.url} → HTTP ${probes.sitemap.status}`,
      recommendation: "Publish a sitemap if the site has more than a handful of URLs.",
    });
  }

  const titles = [home.title, ...extras.map((p) => p.title)].filter(Boolean);
  const uniqueTitles = new Set(titles.map((t) => t.toLowerCase()));
  if (titles.length >= 2 && uniqueTitles.size === 1) {
    pushFinding(findings, {
      id: "dup-title",
      area: "SEO",
      severity: "medium",
      title: "Crawled pages share the same title",
      evidence: `“${titles[0]}” on ${titles.length} pages.`,
      recommendation: "Give each indexable URL a unique title.",
    });
  }

  extras.forEach((page) => {
    if (page.status >= 400) {
      pushFinding(findings, {
        id: `status-${page.status}-${page.url}`,
        area: "Performance",
        severity: "high",
        title: `Internal page returned HTTP ${page.status}`,
        evidence: page.url,
        recommendation: "Fix the link, redirect, or restore the page. Broken internal links leak trust and crawl budget.",
      });
    }
  });

  if (!findings.some((f) => f.area === "Accessibility" && f.severity !== "pass") && home.imagesMissingAlt === 0 && home.lang) {
    pushFinding(findings, {
      id: "a11y-basic",
      area: "Accessibility",
      severity: "pass",
      title: "Basic HTML accessibility signals look present",
      evidence: `lang=${home.lang || "n/a"}; images with missing alt=0`,
      recommendation: "",
    });
  }

  return findings;
}

function scoreFromFindings(findings) {
  const buckets = {
    SEO: 100,
    Accessibility: 100,
    Performance: 100,
    Security: 100,
    Content: 100,
  };
  const penalty = { critical: 28, high: 16, medium: 9, low: 4, pass: 0 };
  for (const f of findings) {
    if (!buckets[f.area]) continue;
    buckets[f.area] = Math.max(0, buckets[f.area] - (penalty[f.severity] || 0));
  }
  const overall = Math.round(
    buckets.SEO * 0.28 +
      buckets.Content * 0.22 +
      buckets.Performance * 0.2 +
      buckets.Accessibility * 0.18 +
      buckets.Security * 0.12
  );
  return { overall, ...buckets };
}

async function probePath(origin, path) {
  const url = new URL(path, origin).href;
  try {
    const { res, finalUrl, ms } = await fetchFollow(url, { method: "GET" });
    const status = res.status;
    res.body?.cancel?.();
    return { url: finalUrl, status, ms };
  } catch (err) {
    return { url, status: 0, ms: 0, error: err.message };
  }
}

export async function crawlSite(inputUrl) {
  const start = await assertPublicHttpUrl(inputUrl);
  const { res, finalUrl, hops, ms } = await fetchFollow(start.href);
  const contentType = (res.headers.get("content-type") || "").toLowerCase();
  if (res.status >= 400) {
    throw new Error(`The site responded with HTTP ${res.status} at ${finalUrl}`);
  }
  if (!contentType.includes("html") && !contentType.includes("xml") && contentType) {
    throw new Error(`Expected HTML, got ${contentType.split(";")[0]}`);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > MAX_HTML) {
    throw new Error("Homepage HTML is larger than the 1.5 MB audit limit.");
  }
  const html = buf.toString("utf8");
  const headers = headerMap(res);
  const home = extractPage(html, finalUrl, headers, ms, res.status);
  const origin = new URL(finalUrl).origin;

  const probes = {
    robots: await probePath(origin, "/robots.txt"),
    sitemap: await probePath(origin, "/sitemap.xml"),
    favicon: await probePath(origin, "/favicon.ico"),
  };

  const candidates = sameOriginLinks(home, origin).filter(
    (href) => href.replace(/\/$/, "") !== finalUrl.replace(/\/$/, "")
  );
  const extras = [];
  for (const href of candidates.slice(0, MAX_PAGES - 1)) {
    try {
      const next = await fetchFollow(href);
      if (next.res.status >= 400) {
        extras.push({
          url: next.finalUrl,
          status: next.res.status,
          timingMs: next.ms,
          title: "",
          wordCount: 0,
        });
        next.res.body?.cancel?.();
        continue;
      }
      const raw = Buffer.from(await next.res.arrayBuffer());
      if (raw.length > MAX_HTML) continue;
      const page = extractPage(
        raw.toString("utf8"),
        next.finalUrl,
        headerMap(next.res),
        next.ms,
        next.res.status
      );
      extras.push({
        url: page.url,
        status: page.status,
        timingMs: page.timingMs,
        title: page.title,
        wordCount: page.wordCount,
        h1: page.headings.h1[0] || "",
      });
    } catch (err) {
      extras.push({ url: href, status: 0, timingMs: 0, title: "", error: err.message });
    }
  }

  const findings = buildFindings(home, extras, probes);
  const scores = scoreFromFindings(findings);

  return {
    requestedUrl: start.href,
    finalUrl,
    fetchedAt: new Date().toISOString(),
    redirectHops: hops,
    scores,
    findings,
    home: {
      url: home.url,
      status: home.status,
      timingMs: home.timingMs,
      title: home.title,
      description: home.description,
      canonical: home.canonical,
      robots: home.robots,
      ogTitle: home.ogTitle,
      ogImage: Boolean(home.ogImage),
      viewport: home.viewport,
      lang: home.lang,
      h1: home.headings.h1,
      h2: home.headings.h2.slice(0, 12),
      imageCount: home.imageCount,
      imagesMissingAlt: home.imagesMissingAlt,
      wordCount: home.wordCount,
      textSample: home.textSample,
      scriptCount: home.scriptCount,
      stylesheetCount: home.stylesheetCount,
      htmlBytes: home.htmlBytes,
      stack: home.stack,
      ctaHints: home.ctaHints,
      headers: home.headers,
      jsonLdCount: home.jsonLdCount,
    },
    extraPages: extras,
    probes,
  };
}

export { corsHeaders };
