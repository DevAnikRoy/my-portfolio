import React, { useEffect, useRef, useState } from "react";
import { X, Globe, Download, Loader2, ArrowUpRight } from "lucide-react";
import { downloadAuditPdf } from "../utils/auditPdf";

const SEVERITY_CLASS = {
  critical: "text-red-300 border-red-400/30 bg-red-400/5",
  high: "text-[#EC77AB] border-[#EC77AB]/25 bg-[#EC77AB]/5",
  medium: "text-amber-200 border-amber-400/20 bg-amber-400/5",
  low: "text-[#8E8E93] border-[#191528] bg-[#110E1B]",
  pass: "text-emerald-300 border-emerald-400/20 bg-emerald-400/5",
};

function normalizeUrl(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export default function SiteAuditModal({ isOpen, onClose }) {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setStatus("idle");
      setError("");
      setResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const runAudit = async (e) => {
    e?.preventDefault();
    const target = normalizeUrl(url);
    if (!target) {
      setError("Paste a website URL.");
      return;
    }
    setError("");
    setResult(null);
    setStatus("running");
    try {
      const res = await fetch("/api/site-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Could not audit that URL.");
      }
      setResult(data);
      setStatus("done");
    } catch (err) {
      setStatus("idle");
      setError(
        err?.message?.includes("Failed to fetch")
          ? "Audit backend offline. Run `netlify dev` locally, or try again on the live site."
          : err.message || "Audit failed."
      );
    }
  };

  const crawl = result?.crawl;
  const narrative = result?.narrative;
  const issues = crawl?.findings?.filter((f) => f.severity !== "pass") || [];

  return (
    <div className="fixed inset-0 z-[10070] flex items-end sm:items-center justify-center bg-[#110E1B]/92 backdrop-blur-xl p-0 sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="site-audit-title"
        className="relative w-full sm:max-w-3xl bg-[#0E0C17] border border-[#191528] rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden max-h-[100dvh] flex flex-col overscroll-contain"
      >
        <div className="px-5 sm:px-7 py-4 border-b border-[#191528] flex items-center justify-between gap-3 shrink-0 pt-[max(1rem,env(safe-area-inset-top))]">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#EC77AB] mb-1">
              Free inspection
            </p>
            <h2 id="site-audit-title" className="text-white font-semibold text-lg truncate">
              Site audit
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close site audit"
            className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] space-y-6">
          <form onSubmit={runAudit} className="space-y-3">
            <label htmlFor="audit-url" className="block text-[#8E8E93] text-sm font-medium">
              Website URL
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                ref={inputRef}
                id="audit-url"
                name="url"
                type="url"
                inputMode="url"
                autoComplete="url"
                spellCheck={false}
                placeholder="https://your-site.com…"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 min-w-0 px-4 py-3.5 bg-[#110E1B] border border-[#191528] rounded-xl text-white placeholder-[#48484A] focus:border-[#7873F5]/50 focus:ring-2 focus:ring-[#7873F5]/20 focus:outline-none text-base"
              />
              <button
                type="submit"
                disabled={status === "running"}
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-5 rounded-xl font-semibold text-white bg-gradient-to-r from-[#7873F5] to-[#EC77AB] hover:opacity-90 disabled:opacity-50"
              >
                {status === "running" ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Fetching live HTML…
                  </>
                ) : (
                  <>
                    <Globe size={16} />
                    Run audit
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-[#48484A] leading-relaxed">
              Fetches the live homepage, headers, robots/sitemap, and a few internal links.
              No Lighthouse demo numbers. Groq writes the narrative from those facts.
            </p>
          </form>

          {error && (
            <p className="text-sm text-red-300" role="alert">
              {error}
            </p>
          )}

          {status === "running" && (
            <div className="rounded-2xl border border-[#191528] bg-[#110E1B] p-5 text-sm text-[#8E8E93] space-y-2" aria-live="polite">
              <p>Resolving the host and blocking private addresses…</p>
              <p>Downloading HTML and response headers…</p>
              <p>Checking robots.txt, sitemap, and same-origin pages…</p>
              <p>Scoring observed issues, then asking Groq to write the client report…</p>
            </div>
          )}

          {status === "done" && crawl && narrative && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#48484A] mb-1">
                    Inspected {new Date(crawl.fetchedAt).toLocaleString()}
                  </p>
                  <a
                    href={crawl.finalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#7873F5] hover:text-white text-sm break-all inline-flex items-start gap-1"
                  >
                    {crawl.finalUrl}
                    <ArrowUpRight size={14} className="shrink-0 mt-0.5" />
                  </a>
                  <h3 className="text-2xl font-bold text-white mt-3 text-pretty">
                    {narrative.headline}
                  </h3>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-5xl font-black tracking-tight grad-text">{crawl.scores.overall}</p>
                  <p className="text-xs text-[#8E8E93] mt-1">HTML score · not Lighthouse</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {["SEO", "Content", "Performance", "Accessibility", "Security"].map((key) => (
                  <div key={key} className="rounded-xl border border-[#191528] bg-[#110E1B] p-3">
                    <p className="text-[10px] uppercase tracking-wider text-[#48484A]">{key}</p>
                    <p className="text-xl font-bold text-white tabular-nums">{crawl.scores[key]}</p>
                  </div>
                ))}
              </div>

              <p className="text-[#8E8E93] text-sm leading-relaxed">{narrative.executiveSummary}</p>

              {result.llmError && (
                <p className="text-xs text-amber-200/90">
                  Groq narrative unavailable ({result.llmError}). The scores and findings below are still from the live crawl.
                </p>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-[#191528] p-4">
                  <h4 className="text-white font-semibold mb-3">What is working</h4>
                  <ul className="space-y-2 text-sm text-[#8E8E93]">
                    {(narrative.whatIsWorking || []).length ? (
                      narrative.whatIsWorking.map((item) => (
                        <li key={item}>→ {item}</li>
                      ))
                    ) : (
                      <li>No automated passes on this crawl.</li>
                    )}
                  </ul>
                </div>
                <div className="rounded-2xl border border-[#191528] p-4">
                  <h4 className="text-white font-semibold mb-3">Do this week</h4>
                  <ul className="space-y-2 text-sm text-[#8E8E93]">
                    {(narrative.roadmap?.now || []).map((item) => (
                      <li key={item}>→ {item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">Priority work</h4>
                <div className="space-y-3">
                  {(narrative.priorityWork || []).map((item) => (
                    <div key={item.title} className="rounded-2xl border border-[#191528] p-4">
                      <p className="text-white font-medium">{item.title}</p>
                      {item.where && (
                        <p className="text-[11px] text-[#7873F5] mt-1 break-all">{item.where}</p>
                      )}
                      <p className="text-sm text-[#8E8E93] mt-2">{item.why}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">Observed findings</h4>
                <div className="space-y-2">
                  {issues.map((f) => (
                    <article
                      key={f.id}
                      className={`rounded-xl border p-4 ${SEVERITY_CLASS[f.severity] || SEVERITY_CLASS.low}`}
                    >
                      <p className="text-[10px] uppercase tracking-widest opacity-80 mb-1">
                        {f.severity} · {f.area}
                      </p>
                      <h5 className="font-semibold text-white">{f.title}</h5>
                      <p className="text-sm mt-1 opacity-90 break-words">{f.evidence}</p>
                      {f.recommendation && (
                        <p className="text-sm mt-2 text-white/90">{f.recommendation}</p>
                      )}
                    </article>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[#191528] p-4 text-sm text-[#8E8E93] space-y-2">
                <p>
                  <span className="text-white">Stack signals:</span>{" "}
                  {(crawl.home.stack || []).join(" · ") || "None detected in HTML"}
                </p>
                <p>
                  Homepage {crawl.home.timingMs} ms · {Math.round(crawl.home.htmlBytes / 1024)} KB HTML ·{" "}
                  {crawl.home.wordCount} words · {crawl.extraPages.length} extra pages crawled
                </p>
                {narrative.positioningNotes && <p>{narrative.positioningNotes}</p>}
                {narrative.limitations && <p className="text-xs">{narrative.limitations}</p>}
              </div>

              <button
                type="button"
                onClick={() => downloadAuditPdf({ crawl, narrative })}
                className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-white border border-[#191528] hover:border-[#7873F5]/50"
              >
                <Download size={16} />
                Download PDF
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
