import React, { useEffect, useRef, useState } from "react";
import { X, Globe, Download, Loader2 } from "lucide-react";
import { downloadAuditPdf } from "../utils/auditPdf";
import AuditReport from "./audit/AuditReport";

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

  return (
    <div className="fixed inset-0 z-[10070] flex items-end sm:items-center justify-center bg-[#110E1B]/92 backdrop-blur-xl p-0 sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="site-audit-title"
        className="relative w-full sm:max-w-4xl bg-[#0E0C17] border border-[#191528] rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden max-h-[100dvh] flex flex-col overscroll-contain"
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
              <AuditReport crawl={crawl} narrative={narrative} llmError={result.llmError} />
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
