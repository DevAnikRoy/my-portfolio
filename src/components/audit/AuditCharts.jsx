import React from "react";
import { donutPaths, scoreList, severitySlices } from "./chartUtils";

export function ScoreDonut({ findings, overall }) {
  const slices = severitySlices(findings);
  const paths = slices.length ? donutPaths(slices, 80, 80, 72, 44) : [];
  const issueCount = slices.filter((s) => s.key !== "pass").reduce((n, s) => n + s.value, 0);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <svg viewBox="0 0 160 160" className="w-40 h-40 shrink-0" role="img" aria-label="Findings mix">
        {paths.length ? (
          paths.map((p) => <path key={p.key} d={p.d} fill={p.color} />)
        ) : (
          <circle cx="80" cy="80" r="72" fill="#191528" />
        )}
        <text x="80" y="76" textAnchor="middle" fill="#fff" fontSize="28" fontWeight="800">
          {overall}
        </text>
        <text x="80" y="96" textAnchor="middle" fill="#8E8E93" fontSize="10">
          overall
        </text>
      </svg>
      <ul className="space-y-2 w-full">
        {slices.map((s) => (
          <li key={s.key} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-[#8E8E93]">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
              {s.label}
            </span>
            <span className="text-white tabular-nums font-medium">{s.value}</span>
          </li>
        ))}
        <li className="text-xs text-[#48484A] pt-1">
          {issueCount} issue{issueCount === 1 ? "" : "s"} to fix · {slices.find((s) => s.key === "pass")?.value || 0} checks passed
        </li>
      </ul>
    </div>
  );
}

export function ScoreBars({ scores }) {
  const rows = scoreList(scores);
  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.key}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[#8E8E93]">{row.label}</span>
            <span className="text-white tabular-nums font-semibold">{row.value}</span>
          </div>
          <div className="h-2.5 rounded-full bg-[#151516] overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${Math.max(2, Math.min(100, row.value))}%`, background: row.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
