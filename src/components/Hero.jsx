import { ArrowUpRight, Briefcase, MapPin, Play, Sparkles, Mic, Terminal, MousePointer2 } from 'lucide-react';
import { SiReact, SiNextdotjs, SiTypescript, SiWebflow, SiFramer, SiSupabase, SiTailwindcss, SiOpenai, SiClaude, SiGooglecloud, SiGooglegemini } from 'react-icons/si';
import portrait from '../assets/new-img-2026.jpg';
import './Hero.css';

const STACK = [
  { name: 'React', Icon: SiReact, color: '#7dd3fc' },
  { name: 'Next.js', Icon: SiNextdotjs, color: '#f5f5f5' },
  { name: 'TypeScript', Icon: SiTypescript, color: '#60a5fa' },
  { name: 'Webflow', Icon: SiWebflow, color: '#818cf8' },
  { name: 'Framer', Icon: SiFramer, color: '#c4b5fd' },
  { name: 'Supabase', Icon: SiSupabase, color: '#6ee7b7' },
  { name: 'Tailwind CSS', Icon: SiTailwindcss, color: '#67e8f9' },
];
const AI_TOOLS = [
  { name: 'Cursor', Icon: MousePointer2, color: '#e4dcff' },
  { name: 'Claude', Icon: SiClaude, color: '#eda483' },
  { name: 'OpenAI', Icon: SiOpenai, color: '#7de0c2' },
  { name: 'Antigravity', Icon: SiGooglegemini, color: '#94b7ff' },
  { name: 'OpenCode', Icon: Terminal, color: '#c4b5fd' },
  { name: 'ElevenLabs', Icon: Mic, color: '#f0acd6' },
  { name: 'Google Cloud', Icon: SiGooglecloud, color: '#f6c86c' },
  { name: 'GroqCloud', Icon: Sparkles, color: '#ffad8c' },
];

function PixelCover() {
  return (
    <div className="profile-hero__cover" aria-hidden="true">
      <svg viewBox="0 0 880 180" preserveAspectRatio="xMidYMid slice" focusable="false">
        {Array.from({ length: 10 }, (_, row) =>
          Array.from({ length: 64 }, (_, col) => {
            const wave = Math.sin(col * 0.18 + row * 0.58);
            const glow = Math.exp(-((col - 17 - row * 2.4) ** 2) / 100)
              + Math.exp(-((col - 58 + row * 1.1) ** 2) / 75);
            return <rect key={`${row}-${col}`} x={col * 14} y={row * 18} width="10" height="14" rx="3"
              fill={col < 34 ? '#7873F5' : '#EC77AB'}
              opacity={Math.min(0.88, 0.08 + (wave + 1) * 0.09 + glow * 0.6)} />;
          })
        )}
      </svg>
    </div>
  );
}

export default function Hero() {
  const goProjects = () => {
    window.dispatchEvent(new CustomEvent('portfolio-work-tab', { detail: 'projects' }));
    document.getElementById('projects')?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  return (
    <section id="home" className="profile-hero" aria-labelledby="hero-name">
      <PixelCover />
      <div className="profile-hero__body">
        <div className="profile-hero__portrait">
          <img src={portrait} alt="Anik Roy" width="112" height="112" fetchpriority="high" />
        </div>
        <h1 id="hero-name">Anik Roy</h1>
        <p className="profile-hero__role">Full-Stack &amp; Webflow Developer</p>
        <p className="profile-hero__specialty">AI-Augmented Web Architect</p>
        <p className="profile-hero__summary">Building scalable web apps, custom Webflow experiences,<br className="hidden sm:block" /> and AI-powered workflows.</p>

        <div className="profile-hero__details">
          <span><Briefcase size={15} aria-hidden="true" />Currently at <strong>Softvence</strong></span>
          <span><MapPin size={15} aria-hidden="true" />Dhaka, Bangladesh</span>
        </div>
        <p className="profile-hero__proof"><strong>2.5+ years</strong> of experience<span aria-hidden="true">·</span><strong>40+</strong> Webflow websites</p>

        <ul className="profile-hero__tools profile-hero__tools--ai" aria-label="AI and automation tools">
          {AI_TOOLS.map((tool) => <li key={tool.name} style={{ '--tool-color': tool.color }}><tool.Icon aria-hidden="true" /><span>{tool.name}</span></li>)}
        </ul>
        <ul className="profile-hero__tools profile-hero__tools--stack" aria-label="Core technologies">
          {STACK.map((tool) => <li key={tool.name} style={{ '--tool-color': tool.color }}><tool.Icon aria-hidden="true" /><span>{tool.name}</span></li>)}
        </ul>
        <div className="profile-hero__actions">
          <button type="button" className="profile-hero__primary" onClick={goProjects}>View projects<ArrowUpRight size={17} aria-hidden="true" /></button>
          <a href="#contact" className="profile-hero__secondary">Let’s talk<ArrowUpRight size={17} aria-hidden="true" /></a>
          <button type="button" className="profile-hero__intro" onClick={() => window.dispatchEvent(new Event('play-intro-video'))}><Play size={14} aria-hidden="true" />Watch intro</button>
        </div>
      </div>
    </section>
  );
}
