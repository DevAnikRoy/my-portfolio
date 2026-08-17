import React, { useEffect, useState } from 'react';

const ROLES = [
  'Frontend Architect',
  'React Developer',
  'Webflow Expert',
  'UI Engineer',
  'Creative Dev',
];

const CHIPS = [
  '✦ Open for Projects',
  '✦ React, Node & Webflow',
  '✦ Based in Dhaka',
  '✦ AI-ready frontend',
];

export default function Hero() {
  const [role, setRole] = useState(0);
  const [text, setText] = useState('');
  const [del, setDel] = useState(false);
  const [char, setChar] = useState(0);

  useEffect(() => {
    const r = ROLES[role];
    let t;
    if (!del && char < r.length) {
      t = setTimeout(() => {
        setText(r.slice(0, char + 1));
        setChar((c) => c + 1);
      }, 75);
    } else if (del && char > 0) {
      t = setTimeout(() => {
        setText(r.slice(0, char - 1));
        setChar((c) => c - 1);
      }, 38);
    } else if (!del && char === r.length) {
      t = setTimeout(() => setDel(true), 2200);
    } else if (del && char === 0) {
      setDel(false);
      setRole((r) => (r + 1) % ROLES.length);
    }
    return () => clearTimeout(t);
  }, [char, del, role]);

  const goProjects = () => {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section id="home" className="pt-2 md:pt-8 relative overflow-hidden">
      <h1 className="text-[2.15rem] leading-[1.12] sm:text-5xl md:text-7xl font-bold mb-5 md:mb-6 tracking-tight">
        Hello
        <span className="animate-wave inline-block origin-bottom-right">👋</span>
        , I&apos;m Anik Roy <br />
        <span className="text-white">Creative</span>{' '}
        <span className="grad-text">Frontend Architect.</span>
      </h1>

      <p className="text-base md:text-lg text-neutral-400 max-w-2xl mb-4">
        Building high-performance products with React, Webflow, and creative
        engineering — made to convert, scale, and leave an impression.
      </p>
      <p className="text-base md:text-lg text-neutral-400 max-w-2xl mb-6 md:mb-8">
        Lately I&apos;ve been deep into AI-augmented workflows. Cursor, Claude
        Code, and agentic IDEs — not buzzwords, actual tools I use daily to
        ship faster.
      </p>

      <div className="flex items-center gap-3 mb-6 md:mb-8 text-sm tracking-wide min-h-[1.5rem]">
        <span className="text-[#8E8E93]">&gt;</span>
        <span className="font-semibold grad-text">{text}</span>
        <span className="text-[#7873F5]">|</span>
      </div>

      <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
        <h3 className="text-white text-base md:text-lg font-medium">Quick rundown:</h3>
        <ul className="space-y-2 text-neutral-400 text-sm md:text-base">
          <li className="flex gap-2">
            <span className="text-neutral-500">→</span>
            2+ years shipping production websites and apps
          </li>
          <li className="flex gap-2">
            <span className="text-neutral-500">→</span>
            40+ projects across React, Webflow, and full-stack work
          </li>
          <li className="flex gap-2">
            <span className="text-neutral-500">→</span>
            MERN stack, Tailwind, and CMS-driven sites
          </li>
          <li className="flex gap-2">
            <span className="text-neutral-500">→</span>
            Currently{' '}
            <span className="font-bold grad-text ml-1">Junior Web Developer</span>
            &nbsp;at Softvence
          </li>
        </ul>
      </div>

      <div className="flex flex-wrap gap-3 mb-10">
        {CHIPS.map((chip) => (
          <span
            key={chip}
            className="px-4 py-2 rounded-lg bg-[#151516] border border-[#191528] text-[11px] font-medium text-[#8E8E93] hover:border-[#D359C8] transition-colors"
          >
            {chip}
          </span>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        <button
          onClick={goProjects}
          className="group relative w-full sm:w-auto px-8 py-3.5 min-h-[48px] rounded-full font-medium overflow-hidden border border-[#191528] hover:border-transparent transition-all"
        >
          <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity p-[1px] bg-gradient-to-r from-[#7873F5] to-[#EC77AB] -z-10" />
          <div className="absolute inset-[1px] rounded-full bg-[#0E0C17] -z-10" />
          <span className="grad-text">Explore Portfolio</span>
        </button>
        <a
          href="#contact"
          className="w-full sm:w-auto px-8 py-3.5 min-h-[48px] inline-flex items-center justify-center rounded-full font-medium text-[#8E8E93] border border-[#191528] hover:text-white hover:border-[#7873F5]/40 transition-all"
        >
          Hire Me →
        </a>
      </div>
    </section>
  );
}
