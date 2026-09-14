import { ArrowUpRight, ExternalLink, Github } from "lucide-react";
import ProjectCover, { hostLabel } from "./ProjectCover";

export default function ProjectCard({ p, onView, compact = false, chrome = false }) {
  const host = hostLabel(p.live);

  return (
    <article
      onClick={() => onView(p)}
      className="group relative cursor-pointer overflow-hidden rounded-3xl border border-[#191528] bg-[#0E0C17] transition-all duration-500 hover:border-[#3C162F]"
    >
      <div className={`overflow-hidden ${compact ? "aspect-[16/10]" : "aspect-video"}`}>
        {chrome ? (
          <div className="flex h-full flex-col">
            <div className="flex items-center gap-2 border-b border-[#191528] bg-[#151221] px-3 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#EC77AB]/80" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#7873F5]/80" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
              <span className="ml-1 min-w-0 truncate rounded-md bg-[#110E1B] px-2 py-0.5 text-[10px] text-[#8E8E93]">
                {host || "webflow.io"}
              </span>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              <ProjectCover
                project={p}
                className="transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-105"
              />
            </div>
          </div>
        ) : (
          <ProjectCover
            project={p}
            className="transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-105"
          />
        )}
      </div>
      <div className={compact ? "p-3.5 sm:p-4" : "p-4 sm:p-6"}>
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3
            className={`font-bold text-white ${
              compact ? "text-base sm:text-lg" : "text-lg sm:text-xl"
            }`}
          >
            {p.title}
          </h3>
          <ArrowUpRight
            size={compact ? 16 : 18}
            className="mt-1 shrink-0 -rotate-45 text-neutral-500 transition-transform duration-300 group-hover:rotate-0"
          />
        </div>
        {!compact && <p className="mb-4 line-clamp-2 text-sm text-neutral-400">{p.desc}</p>}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            {p.type || `${p.tech?.[0]} · ${p.tech?.[1]}`}
          </span>
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <a
              href={p.live}
              target="_blank"
              rel="noopener noreferrer"
              title="Live Demo"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-[#191528] bg-[#151516] p-2.5 text-[#8E8E93] transition-colors hover:border-[#7873F5]/40 hover:text-white active:text-white"
            >
              <ExternalLink size={14} />
            </a>
            {p.git && (
              <a
                href={p.git}
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-[#191528] bg-[#151516] p-2.5 text-[#8E8E93] transition-colors hover:border-[#7873F5]/40 hover:text-white active:text-white"
              >
                <Github size={14} />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
