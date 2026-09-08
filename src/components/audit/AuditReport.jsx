import React from "react";
import { ArrowUpRight } from "lucide-react";
import { ScoreBars, ScoreDonut } from "./AuditCharts";

const SEVERITY_CLASS = {
  critical: "text-red-300 border-red-400/30 bg-red-400/5",
  high: "text-[#EC77AB] border-[#EC77AB]/25 bg-[#EC77AB]/5",
  medium: "text-amber-200 border-amber-400/20 bg-amber-400/5",
  low: "text-[#8E8E93] border-[#191528] bg-[#110E1B]",
  pass: "text-emerald-300 border-emerald-400/20 bg-emerald-400/5",
};

export default function AuditReport({ crawl, narrative, llmError }) {
  const issues = crawl.findings.filter((f) => f.severity !== "pass");
  const pages = [
    {
      url: crawl.home.url,
      status: crawl.home.status,
      title: crawl.home.title,
      timingMs: crawl.home.timingMs,
    },
    ...crawl.extraPages,
  ];

  return (
    <div className="space-y-6" id="audit-report">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="min-w-0">
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
          <h3 className="text-2xl font-bold text-white mt-3 text-pretty">{narrative.headline}</h3>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-[#191528] bg-[#110E1B] p-5">
          <h4 className="text-white font-semibold mb-4">Findings mix</h4>
          <ScoreDonut findings={crawl.findings} overall={crawl.scores.overall} />
        </div>
        <div className="rounded-2xl border border-[#191528] bg-[#110E1B] p-5">
          <h4 className="text-white font-semibold mb-4">Category scores</h4>
          <ScoreBars scores={crawl.scores} />
        </div>
      </div>

      <p className="text-[#8E8E93] text-sm leading-relaxed">{narrative.executiveSummary}</p>

      {llmError && (
        <p className="text-xs text-amber-200/90">
          Groq narrative unavailable ({llmError}). Scores and findings are still from the live crawl.
        </p>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-[#191528] p-4">
          <h4 className="text-white font-semibold mb-3">What is working</h4>
          <ul className="space-y-2 text-sm text-[#8E8E93]">
            {(narrative.whatIsWorking || []).length ? (
              narrative.whatIsWorking.map((item) => <li key={item}>→ {item}</li>)
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
        <h4 className="text-white font-semibold mb-3">This month</h4>
        <ul className="space-y-2 text-sm text-[#8E8E93]">
          {(narrative.roadmap?.next || []).map((item) => (
            <li key={item}>→ {item}</li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="text-white font-semibold mb-3">After the basics</h4>
        <ul className="space-y-2 text-sm text-[#8E8E93]">
          {(narrative.roadmap?.later || []).map((item) => (
            <li key={item}>→ {item}</li>
          ))}
        </ul>
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
              {f.recommendation && <p className="text-sm mt-2 text-white/90">{f.recommendation}</p>}
            </article>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-white font-semibold mb-3">Pages fetched</h4>
        <div className="space-y-2">
          {pages.map((p) => (
            <div key={p.url} className="rounded-xl border border-[#191528] p-3 text-sm">
              <p className="text-white font-medium">{p.title || p.url}</p>
              <p className="text-[#8E8E93] break-all mt-1">
                HTTP {p.status || "—"} · {p.timingMs || 0} ms · {p.url}
              </p>
            </div>
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
    </div>
  );
}
