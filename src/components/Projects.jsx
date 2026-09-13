import React, { useRef, useState } from 'react';
import { ArrowUpRight, ExternalLink, Github } from 'lucide-react';
import { useScrollReveal } from './SharedScrolled';
import {
  FEATURED,
  DELIVERIES,
  WEBFLOW_SITE_COUNT,
} from '../data/projects';

const GALLERY_PREVIEW = 12;

function Card({ p, onView, compact = false }) {
  return (
    <article
      onClick={() => onView(p)}
      className={`group relative rounded-3xl overflow-hidden bg-[#0E0C17] border border-[#191528] hover:border-[#3C162F] transition-all duration-500 cursor-pointer ${
        compact ? '' : ''
      }`}
    >
      <div className={`overflow-hidden ${compact ? 'aspect-[16/10]' : 'aspect-video'}`}>
        <img
          src={p.image}
          alt={p.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-105"
        />
      </div>
      <div className={compact ? 'p-3.5 sm:p-4' : 'p-4 sm:p-6'}>
        <div className="flex justify-between items-start gap-3 mb-2">
          <h3
            className={`font-bold text-white ${
              compact ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'
            }`}
          >
            {p.title}
          </h3>
          <ArrowUpRight
            size={compact ? 16 : 18}
            className="text-neutral-500 -rotate-45 group-hover:rotate-0 transition-transform duration-300 shrink-0 mt-1"
          />
        </div>
        {!compact && (
          <p className="text-sm text-neutral-400 mb-4 line-clamp-2">{p.desc}</p>
        )}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            {p.type || `${p.tech?.[0]} · ${p.tech?.[1]}`}
          </span>
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <a
              href={p.live}
              target="_blank"
              rel="noopener noreferrer"
              title="Live Demo"
              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-[#151516] border border-[#191528] text-[#8E8E93] active:text-white hover:text-white hover:border-[#7873F5]/40 transition-colors"
            >
              <ExternalLink size={14} />
            </a>
            {p.git && (
              <a
                href={p.git}
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub"
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-[#151516] border border-[#191528] text-[#8E8E93] active:text-white hover:text-white hover:border-[#7873F5]/40 transition-colors"
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

export default function Projects({ onProjectView }) {
  const ref = useRef(null);
  const [showAll, setShowAll] = useState(false);
  useScrollReveal(ref);

  const open = (p) =>
    onProjectView({ ...p, liveUrl: p.live, githubUrl: p.git });

  const visibleDeliveries = showAll
    ? DELIVERIES
    : DELIVERIES.slice(0, GALLERY_PREVIEW);
  const hiddenCount = Math.max(0, DELIVERIES.length - GALLERY_PREVIEW);

  return (
    <section id="projects" ref={ref} className="py-10 md:py-24">
      <div className="sr mb-8">
        <h2 className="text-3xl font-bold">Projects</h2>
        <p className="mt-3 text-[#8E8E93] max-w-xl text-sm md:text-base">
          Featured case studies — React apps and handcrafted Webflow builds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {FEATURED.map((p, i) => (
          <div key={p.id} className="sr" data-delay={Math.min(i, 5) * 0.08}>
            <Card p={p} onView={open} />
          </div>
        ))}
      </div>

      <div className="sr mt-14 md:mt-16 mb-8 rounded-3xl border border-[#191528] bg-[#0E0C17]/80 px-5 py-6 sm:px-8 sm:py-7">
        <p className="text-xs font-bold uppercase tracking-widest text-[#48484A] mb-2">
          Webflow delivery track record
        </p>
        <p className="text-2xl sm:text-3xl font-bold text-white">
          <span className="grad-text">{WEBFLOW_SITE_COUNT}+</span> Webflow sites
          delivered
        </p>
        <p className="mt-2 text-sm text-[#8E8E93] max-w-2xl">
          Real client marketing sites shipped in Webflow — responsive layouts,
          CMS-ready structure, and live demos you can open. Proof of volume as a
          production Webflow developer, not just a handful of samples.
        </p>
      </div>

      <div className="sr mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            More Webflow work
          </h3>
          <p className="mt-1.5 text-sm text-[#8E8E93]">
            Additional client deliveries — open any card for details and the live
            site.
          </p>
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#48484A]">
          {DELIVERIES.length} sites
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {visibleDeliveries.map((p) => (
          <div key={p.id} className="sr">
            <Card p={p} onView={open} compact />
          </div>
        ))}
      </div>

      {hiddenCount > 0 && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="min-h-[48px] px-6 rounded-2xl border border-[#191528] bg-[#0E0C17] text-sm font-semibold text-white hover:border-[#7873F5]/40 transition-colors"
          >
            {showAll
              ? 'Show fewer'
              : `Show all ${DELIVERIES.length} Webflow sites`}
          </button>
        </div>
      )}
    </section>
  );
}
