import { useMemo, useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import ProjectCard from "./ProjectCard";
import { DELIVERIES, WEBFLOW_SITE_COUNT } from "../data/projects";

const TABS = [
  { id: "showcase", label: "Showcase" },
  { id: "az", label: "A–Z" },
  { id: "landing", label: "Landing" },
  { id: "multi", label: "Multi-page" },
];

export default function WebflowArchive({ onProjectView, onBack }) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("showcase");

  const open = (p) => onProjectView({ ...p, liveUrl: p.live, githubUrl: p.git });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = DELIVERIES;
    if (tab === "landing") list = list.filter((p) => p.layout === "landing");
    if (tab === "multi") list = list.filter((p) => p.layout === "multi");
    if (q) {
      list = list.filter((p) => {
        const hay = `${p.title} ${p.live} ${(p.aliases || []).join(" ")}`.toLowerCase();
        return hay.includes(q);
      });
    }
    if (tab === "az") {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    }
    return list;
  }, [query, tab]);

  return (
    <div
      id="webflow-work"
      className="px-4 pb-10 pt-[calc(5.5rem+env(safe-area-inset-top))] md:p-12 md:pt-12 lg:p-16"
    >
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={onBack}
          className="mb-8 inline-flex min-h-[44px] items-center text-[#8E8E93] transition-colors hover:text-white"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Projects
        </button>

        <header className="mb-8 md:mb-10">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#48484A]">
            Client deliveries
          </p>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Webflow work</h1>
          <p className="mt-3 max-w-2xl text-sm text-[#8E8E93] md:text-base">
            {DELIVERIES.length} live Webflow sites you can open right now. Showcase puts
            the strongest design, UI, and motion first. Staging links that 404 are out.
          </p>
          <p className="mt-4 text-sm text-[#8E8E93]">
            <span className="grad-text font-semibold">{WEBFLOW_SITE_COUNT}+</span> Webflow
            sites delivered in total.
          </p>
        </header>

        <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Sort Webflow work">
          {TABS.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(item.id)}
                className={`min-h-[44px] rounded-2xl px-4 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-white text-[#110E1B]"
                    : "border border-[#191528] bg-[#0E0C17] text-[#8E8E93] hover:text-white"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="mb-8">
          <label className="relative block">
            <Search
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8E8E93]"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a site by name…"
              className="min-h-[48px] w-full rounded-2xl border border-[#191528] bg-[#0E0C17] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-[#48484A] focus:border-[#7873F5]/50"
            />
          </label>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-[#48484A]">
            {filtered.length} {filtered.length === 1 ? "site" : "sites"}
          </p>
        </div>

        {filtered.length === 0 ? (
          <p className="rounded-3xl border border-[#191528] bg-[#0E0C17] px-5 py-8 text-sm text-[#8E8E93]">
            No sites match this view. Try another tab, or clear the search.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
            {filtered.map((p) => (
              <div key={p.id}>
                <ProjectCard p={p} onView={open} compact chrome />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
