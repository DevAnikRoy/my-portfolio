import { ArrowUpRight, Code2, Folder } from "lucide-react";
import { SiFramer, SiWebflow } from "react-icons/si";
import ProjectCover, { hostLabel } from "./ProjectCover";
import ProjectCard from "./ProjectCard";
import { DELIVERIES, FEATURED, WEBFLOW_SITE_COUNT } from "../data/projects";

const PICKS = [9, 10, 5, 12];
const PEEK = DELIVERIES.slice(0, 5);
const selected = PICKS.map(id => FEATURED.find(project => project.id === id)).filter(Boolean);
const remaining = FEATURED.filter(project => !PICKS.includes(project.id));
const groups = [
  ["react", "Custom Apps", Code2],
  ["webflow", "Webflow Sites", SiWebflow],
  ["framer", "Framer Sites", SiFramer],
];

export default function Projects({ onProjectView, onOpenArchive, embedded = false }) {
  const open = (p) => onProjectView({ ...p, liveUrl: p.live, githubUrl: p.git });
  const grid = (items) => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {items.map(p => <ProjectCard key={p.id} p={p} onView={open} />)}
    </div>
  );

  return (
    <section id={embedded ? undefined : "projects"} className={embedded ? "" : "py-10 md:py-24"} aria-labelledby="selected-projects-heading">
      <h2 id="selected-projects-heading" className="mb-6 flex items-center gap-3 text-2xl font-bold"><Folder size={23} className="shrink-0 text-[#C4B5FD]" aria-hidden="true" />Selected Projects</h2>
      {grid(selected)}
      <details className="group mt-6">
        <summary className="group/project-cta mx-auto flex min-h-11 w-fit max-w-full cursor-pointer list-none items-center justify-center gap-[7px] rounded-[10px] bg-[linear-gradient(110deg,#7873f5,#ec77ab)] px-4 text-center text-sm font-semibold text-[#110e1b] shadow-[0_4px_16px_#7873f530] hover:brightness-110 hover:shadow-[0_6px_22px_#7873f550] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c2a9ff] motion-safe:transition motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 [&::-webkit-details-marker]:hidden">
          <span className="group-open:hidden">View All Projects</span>
          <span className="hidden group-open:inline">Show fewer projects</span>
          <ArrowUpRight size={16} className="shrink-0 motion-safe:transition-transform motion-safe:group-hover/project-cta:-translate-y-0.5 motion-safe:group-hover/project-cta:translate-x-0.5" aria-hidden="true" />
        </summary>
        <div className="mt-8 space-y-8">
          {groups.map(([category, label, Icon]) => {
            const items = remaining.filter(project => project.category === category);
            return items.length > 0 ? (
              <div key={category}>
                <h3 className="mb-4 flex items-center gap-3 text-2xl font-bold"><Icon size={23} className="shrink-0 text-[#C4B5FD]" aria-hidden="true" />{label}</h3>
                {grid(items)}
                {category === "webflow" ? (
                <div className="mt-8 flex flex-col gap-4 sm:mt-10 sm:gap-5">
                  <div className="rounded-3xl border border-[#191528] bg-[#0E0C17]/80 px-5 py-6 sm:px-8 sm:py-7">
                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#48484A]">
                      Webflow delivery track record
                    </p>
                    <p className="text-2xl font-bold text-white sm:text-3xl">
                      <span className="grad-text">{WEBFLOW_SITE_COUNT}+</span> Websites delivered
                    </p>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#8E8E93]">
                      Real client marketing sites shipped in Webflow responsive layouts, CMS-ready
                      structure, and live demos you can open. Proof of volume as a production Webflow
                      developer, not just a handful of samples.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={onOpenArchive}
                    className="archive-cta-glow group relative w-full overflow-hidden rounded-3xl p-0 text-left"
                    aria-label={`Browse all ${DELIVERIES.length} Webflow sites`}
                  >
                    <span className="archive-cta-glow__beam" aria-hidden="true" />
                    <div className="archive-cta-glow__body relative z-[1] overflow-hidden rounded-[1.4rem] bg-[#0E0C17] p-5 sm:p-7">
                      <div className="pointer-events-none absolute inset-0 opacity-70">
                        <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-[#7873F5]/10 blur-3xl" />
                        <div className="absolute -bottom-12 right-10 h-36 w-36 rounded-full bg-[#EC77AB]/10 blur-3xl" />
                      </div>

                      <div className="relative flex min-w-0 flex-col gap-6 2xl:flex-row 2xl:items-center 2xl:justify-between">
                        <div className="min-w-0 max-w-lg">
                          <p className="text-xs font-bold uppercase tracking-widest text-[#A8A4FF]">
                            Another page · {DELIVERIES.length} more sites
                          </p>
                          <h3 className="mt-2 text-xl font-bold text-white sm:text-2xl">
                            More Webflow work lives in the archive
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-[#8E8E93]">
                            Explore the rest of my live Webflow client work.
                          </p>
                          <span className="mt-5 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#7873F5] to-[#EC77AB] px-5 text-sm font-semibold text-white sm:w-auto sm:justify-start">
                            Browse all Webflow sites
                            <ArrowUpRight
                              size={16}
                              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            />
                          </span>
                        </div>

                        <div className="relative mx-auto h-28 w-full max-w-sm overflow-hidden sm:mx-0 sm:h-36 sm:max-w-md 2xl:w-[22rem] 2xl:max-w-none 2xl:shrink-0">
                          {PEEK.map((p, i) => (
                            <div
                              key={p.id}
                              className="absolute overflow-hidden rounded-xl border border-[#191528] bg-[#151221] shadow-[0_18px_40px_rgba(0,0,0,0.35)]"
                              style={{
                                width: "58%",
                                left: `${i * 8}%`,
                                top: `${8 + (i % 2) * 6}px`,
                                transform: `rotate(${(i - 2) * 3.2}deg)`,
                                zIndex: i,
                              }}
                            >
                              <div className="flex items-center gap-1 border-b border-[#191528] px-2 py-1">
                                <span className="h-1 w-1 rounded-full bg-[#EC77AB]/70" />
                                <span className="h-1 w-1 rounded-full bg-[#7873F5]/70" />
                                <span className="truncate text-[8px] text-[#8E8E93]">
                                  {hostLabel(p.live)}
                                </span>
                              </div>
                              <div className="aspect-[16/9] overflow-hidden">
                                <ProjectCover project={p} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
                ) : null}
              </div>
            ) : null;
          })}
        </div>
      </details>
    </section>
  );
}
