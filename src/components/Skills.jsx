import React, { useRef, useEffect, useState } from 'react';
import {
  SiReact,
  SiNodedotjs,
  SiMongodb,
  SiTypescript,
  SiTailwindcss,
  SiNextdotjs,
  SiExpress,
  SiGit,
  SiFigma,
  SiDocker,
  SiFirebase,
  SiWebflow,
} from 'react-icons/si';

const expertise = [
  {
    title: 'Frontend',
    desc: 'Crafting fast, accessible interfaces.',
    tags: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Webflow'],
  },
  {
    title: 'Backend',
    desc: 'APIs and data layers that scale.',
    tags: ['Node.js', 'Express.js', 'MongoDB', 'PostgreSQL', 'Firebase'],
  },
  {
    title: 'Product craft',
    desc: 'From Figma to production-ready UI.',
    tags: ['Figma', 'Framer', 'Responsive UI', 'SEO', 'Accessibility'],
  },
  {
    title: 'Collaboration',
    desc: 'Clean handoff with design and product.',
    tags: ['Git', 'Docker', 'Agile', 'CMS', 'Dev Handoff'],
  },
  {
    title: 'AI workflow',
    desc: 'Shipping faster with agentic tools.',
    tags: ['Cursor', 'Claude Code', 'Gemini', 'Figma Make'],
  },
];

const techIcons = [
  { icon: SiReact, color: '#61DAFB' },
  { icon: SiNodedotjs, color: '#68A063' },
  { icon: SiMongodb, color: '#47A248' },
  { icon: SiTypescript, color: '#3178C6' },
  { icon: SiTailwindcss, color: '#06B6D4' },
  { icon: SiNextdotjs, color: '#ffffff' },
  { icon: SiExpress, color: '#ffffff' },
  { icon: SiGit, color: '#F05032' },
  { icon: SiFigma, color: '#F24E1E' },
  { icon: SiDocker, color: '#2496ED' },
  { icon: SiFirebase, color: '#FFCA28' },
  { icon: SiWebflow, color: '#4353FF' },
];

export default function Skills() {
  const sectionRef = useRef(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setAnimate(true);
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="skills" ref={sectionRef} className="py-10 md:py-24">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
        Expertise
      </h2>
      <p className="text-[#8E8E93] mb-12 max-w-xl">
        Tools, frameworks, and systems I use to craft high-performance products.
      </p>

      <div className="bg-[#0E0C17] border border-[#191528] rounded-[1.75rem] md:rounded-[2.5rem] overflow-hidden mb-10 md:mb-16">
        {expertise.map((row) => (
          <div
            key={row.title}
            className="group flex flex-col md:flex-row md:items-center gap-4 md:gap-12 p-5 md:p-10 border-b border-[#191528] last:border-0 hover:bg-[#110E1B] transition-colors relative"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#7873F5] to-[#EC77AB] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="md:w-1/3">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-[#7873F5] transition-colors">
                {row.title}
              </h3>
              <p className="text-[#8E8E93] text-sm leading-relaxed">{row.desc}</p>
            </div>
            <div className="flex-1 flex flex-wrap gap-3 justify-start md:justify-end">
              {row.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 rounded-xl bg-[#110E1B] border border-[#191528] text-sm font-medium text-[#8E8E93] group-hover:text-white group-hover:border-[#EC77AB]/30 transition-all"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs font-bold text-[#48484A] uppercase tracking-widest mb-6">
        Tools I work with
      </p>
      <div className="relative overflow-hidden mask-linear-fade">
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#110E1B] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#110E1B] to-transparent z-10 pointer-events-none" />
        <div className="tech-slider flex gap-6 min-w-max">
          {[...techIcons, ...techIcons].map(({ icon: Icon, color }, i) => (
            <div
              key={i}
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center flex-shrink-0 bg-[#0E0C17] border border-[#191528] transition-transform duration-300 hover:scale-110"
              style={{ opacity: animate ? 1 : 0.7 }}
            >
              <Icon size={32} color={color} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
