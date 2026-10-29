import { useRef } from "react";
import { ArrowUpRight, Code2 } from "lucide-react";
import { SiFramer, SiWebflow } from "react-icons/si";
import { useScrollReveal } from "./SharedScrolled";
import ProjectCard from "./ProjectCard";
import ProjectCover, { hostLabel } from "./ProjectCover";
import { FEATURED, DELIVERIES, WEBFLOW_SITE_COUNT } from "../data/projects";

const PEEK = DELIVERIES.slice(0, 5);

const GROUPS = [
  {
    id: "custom",
    label: "Custom apps",
    note: "Products I designed and coded — React, Next.js, and full-stack.",
    Icon: Code2,
    match: "react",
  },
  {
    id: "webflow",
    label: "Webflow sites",
    note: "Client marketing sites built in Webflow.",
    Icon: SiWebflow,
    match: "webflow",
  },
  {
    id: "framer",
    label: "Framer sites",
    note: "Client marketing sites built in Framer.",
    Icon: SiFramer,
    match: "framer",
  },
].map((group) => ({
  ...group,
  items: FEATURED.filter((project) => project.category === group.match),
}));

export default function Projects({ onProjectView, onOpenArchive, embedded = false }) {
  const ref = useRef(null);
  useScrollReveal(ref);

  const open = (p) => onProjectView({ ...p, liveUrl: p.live, githubUrl: p.git });

  return (
    <section id={embedded ? undefined : "projects"} ref={ref} className={embedded ? "" : "py-10 md:py-24"}>
      <div className="sr mb-8">
        {!embedded ? <h2 className="text-3xl font-bold">Projects</h2> : null}
        <p className="mt-3 max-w-xl text-sm text-[#8E8E93] md:text-base">
          Three kinds of work: apps I coded, Webflow client sites, and Framer client sites.
        </p>
      </div>

      <div className="space-y-14">
        {GROUPS.map((group) => {
          const Icon = group.Icon;
          return (
          <div key={group.id}>
            <div className="sr mb-6 flex flex-col gap-3 border-b border-[#191528] pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#191528] bg-[#0E0C17] text-[#C4B5FD]">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                    {group.label}
                  </h3>
                  <p className="mt-1 max-w-xl text-sm leading-relaxed text-[#8E8E93]">
                    {group.note}
                  </p>
                </div>
              </div>
              <p className="pl-14 text-xs font-semibold uppercase tracking-wider text-[#8E8E93] sm:pl-0">
                {group.items.length} {group.items.length === 1 ? "project" : "projects"}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {group.items.map((p, i) => (
                <div key={p.id} className="sr" data-delay={Math.min(i, 5) * 0.08}>
                  <ProjectCard p={p} onView={open} />
                </div>
              ))}
            </div>
          </div>
          );
        })}
      </div>

      <div className="sr mb-8 mt-14 rounded-3xl border border-[#191528] bg-[#0E0C17]/80 px-5 py-6 sm:mt-16 sm:px-8 sm:py-7">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#48484A]">
          Webflow delivery track record
        </p>
        <p className="text-2xl font-bold text-white sm:text-3xl">
          <span className="grad-text">{WEBFLOW_SITE_COUNT}+</span> Websites delivered
        </p>
        <p className="mt-2 max-w-2xl text-sm text-[#8E8E93]">
          Real client marketing sites shipped in Webflow responsive layouts, CMS-ready
          structure, and live demos you can open. Proof of volume as a production Webflow
          developer, not just a handful of samples.
        </p>
      </div>

      <button
        type="button"
        onClick={onOpenArchive}
        className="archive-cta-glow sr group relative w-full overflow-hidden rounded-3xl p-0 text-left"
        aria-label={`Browse all ${DELIVERIES.length} Webflow sites`}
      >
        <span className="archive-cta-glow__beam" aria-hidden="true" />
        <div className="archive-cta-glow__body relative z-[1] overflow-hidden rounded-[1.4rem] bg-[#0E0C17] p-5 sm:p-7">
          <div className="pointer-events-none absolute inset-0 opacity-70">
            <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-[#7873F5]/10 blur-3xl" />
            <div className="absolute -bottom-12 right-10 h-36 w-36 rounded-full bg-[#EC77AB]/10 blur-3xl" />
          </div>

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-lg">
              <p className="text-xs font-bold uppercase tracking-widest text-[#A8A4FF]">
                Another page · {DELIVERIES.length} more sites
              </p>
              <h3 className="mt-2 text-xl font-bold text-white sm:text-2xl">
                More Webflow work lives in the archive
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#8E8E93]">
                The {FEATURED.length} case studies above are the deep dives. The rest of the live
                client sites live on their own page — no 404 staging links.
              </p>
              <span className="mt-5 inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-gradient-to-r from-[#7873F5] to-[#EC77AB] px-5 text-sm font-semibold text-white">
                Browse all Webflow sites
                <ArrowUpRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </span>
            </div>

            <div className="relative h-[7.5rem] w-full max-w-md shrink-0 sm:h-36 lg:w-[22rem]">
              {PEEK.map((p, i) => (
                <div
                  key={p.id}
                  className="absolute overflow-hidden rounded-xl border border-[#191528] bg-[#151221] shadow-[0_18px_40px_rgba(0,0,0,0.35)]"
                  style={{
                    width: "58%",
                    left: `${i * 8}%`,
                    top: `${10 + (i % 2) * 8}px`,
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
    </section>
  );
}
