import React, { useRef } from 'react';
import { ExternalLink, Github, Eye, ArrowUpRight } from 'lucide-react';
import { useScrollReveal } from './SharedScrolled';
import PROJECTS from '../data/projects';

function Card({ p, onView }) {
  const cardRef = useRef(null);

  return (
    <article ref={cardRef}
      className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1"
      style={{
        background:'linear-gradient(135deg, rgba(30,41,59,0.5) 0%, rgba(15,23,42,0.8) 100%)',
        border:'1px solid rgba(148,163,184,0.08)',
        boxShadow:'0 4px 24px rgba(0,0,0,0.2)',
        cursor:'default',
      }}>

      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio:'16/9' }}>
        <img src={p.image} alt={p.title}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.06]" />
        <div className="absolute inset-0" style={{
          background:'linear-gradient(to bottom, transparent 40%, rgba(15,23,42,0.9) 100%)'
        }} />

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-400"
          style={{ background:'rgba(2,6,23,0.7)', backdropFilter:'blur(2px)' }}>
          <a href={p.live} target="_blank" rel="noopener noreferrer" title="Live Demo"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
            style={{ background:'var(--accent)', color:'#000' }}>
            <ExternalLink size={15} /> Live Demo
          </a>
          <a href={p.git} target="_blank" rel="noopener noreferrer" title="GitHub"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
            style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', color:'#fff' }}>
            <Github size={15} /> Source
          </a>
        </div>

        {/* Number badge */}
        <span className="absolute top-4 left-4 text-xs font-mono px-2.5 py-1 rounded-lg"
          style={{ background:'rgba(0,0,0,0.4)', color:'var(--muted2)', border:'1px solid rgba(148,163,184,0.1)' }}>
          {String(p.num).padStart(2,'0')}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-6 gap-3.5">
        <h3 className="font-bold text-white tracking-tight"
          style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.05rem,2vw,1.25rem)' }}>
          {p.title}
        </h3>
        <p className="t-body leading-relaxed" style={{ color:'var(--muted)', fontSize:'clamp(0.82rem,1.2vw,0.9rem)' }}>
          {p.desc}
        </p>

        <div className="flex flex-wrap gap-2 mt-auto">
          {p.tech.slice(0,5).map((t,i)=>(
            <span key={i} className="text-xs font-medium px-2.5 py-1 rounded-md transition-colors"
              style={{
                background:'rgba(148,163,184,0.06)',
                border:'1px solid rgba(148,163,184,0.08)',
                color:'rgba(148,163,184,0.85)',
              }}>
              {t}
            </span>
          ))}
          {p.tech.length>5 && (
            <span className="text-xs px-2.5 py-1 rounded-md"
              style={{ background:'rgba(99,102,241,0.1)', color:'var(--accent)', border:'1px solid rgba(99,102,241,0.2)' }}>
              +{p.tech.length-5}
            </span>
          )}
        </div>

        <button onClick={()=>onView(p)}
          className="flex items-center gap-1.5 mt-1 text-sm font-medium transition-all hover:gap-2.5"
          style={{ color:'var(--accent)' }}>
          View Case Study <ArrowUpRight size={14} />
        </button>
      </div>
    </article>
  );
}

export default function Projects({ onProjectView }) {
  const ref = useRef(null);
  useScrollReveal(ref);

  return (
    <section id="projects" ref={ref} className="relative py-24 xl:py-36" style={{ background:'var(--bg)' }}>

      <div className="absolute inset-0 pointer-events-none" style={{
        background:'radial-gradient(ellipse 50% 60% at 90% 20%, rgba(139,92,246,0.05) 0%, transparent 65%)'
      }} />

      <div className="w-full max-w-[1400px] mx-auto px-5 sm:px-8 xl:px-14">

        {/* Header */}
        <div className="sr mb-14 lg:mb-20">
          <span className="label">Selected Work</span>
          <h2 className="t-section font-extrabold text-white mt-3" style={{ fontFamily:'var(--font-display)' }}>
            Featured <span className="grad-text">Projects</span>
          </h2>
          <p className="t-body mt-4 max-w-xl" style={{ color:'var(--muted)' }}>
            Real-world applications built with modern stacks—each solving a genuine problem.
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {PROJECTS.map((p,i)=>(
            <div key={p.id} className="sr" data-delay={i*0.12}>
              <Card p={p} onView={p2=>{ onProjectView({...p2, liveUrl:p2.live, githubUrl:p2.git}); }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}