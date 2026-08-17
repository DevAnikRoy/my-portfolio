import React, { useRef } from 'react';
import { ArrowUpRight, ExternalLink, Github } from 'lucide-react';
import { useScrollReveal } from './SharedScrolled';
import PROJECTS from '../data/projects';

function Card({ p, onView }) {
  return (
    <article
      onClick={() => onView(p)}
      className="group relative rounded-3xl overflow-hidden bg-[#0E0C17] border border-[#191528] hover:border-[#3C162F] transition-all duration-500"
    >
      <div className="aspect-video overflow-hidden">
        <img
          src={p.image}
          alt={p.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-105"
        />
      </div>
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-start gap-3 mb-2">
          <h3 className="text-lg sm:text-xl font-bold text-white">{p.title}</h3>
          <ArrowUpRight
            size={18}
            className="text-neutral-500 -rotate-45 group-hover:rotate-0 transition-transform duration-300 shrink-0 mt-1"
          />
        </div>
        <p className="text-sm text-neutral-400 mb-4 line-clamp-2">{p.desc}</p>
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            {p.tech[0]} · {p.tech[1]}
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
            <a
              href={p.git}
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub"
              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-[#151516] border border-[#191528] text-[#8E8E93] active:text-white hover:text-white hover:border-[#7873F5]/40 transition-colors"
            >
              <Github size={14} />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Projects({ onProjectView }) {
  const ref = useRef(null);
  useScrollReveal(ref);

  return (
    <section id="projects" ref={ref} className="py-10 md:py-24">
      <div className="sr mb-8">
        <h2 className="text-3xl font-bold">Projects</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PROJECTS.map((p, i) => (
          <div key={p.id} className="sr" data-delay={i * 0.1}>
            <Card
              p={p}
              onView={(p2) =>
                onProjectView({ ...p2, liveUrl: p2.live, githubUrl: p2.git })
              }
            />
          </div>
        ))}
      </div>
    </section>
  );
}
