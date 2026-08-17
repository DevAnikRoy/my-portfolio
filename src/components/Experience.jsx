import React, { useRef, useEffect } from 'react';
import { Briefcase, Calendar, MapPin, ChevronRight } from 'lucide-react';

const experiences = [
  {
    title: 'Frontend & Webflow Developer',
    company: 'Softvence',
    location: 'Sheridan, WY, USA',
    period: 'July 2025 – Present',
    type: 'Full-time',
    responsibilities: [
      'Developed and maintained responsive Webflow websites for international clients',
      'Collaborated with designers to translate Figma mockups into interactive UI components',
      'Integrated dynamic data and CMS features within Webflow for scalable content management',
      'Worked with React and Tailwind CSS to create reusable UI components outside Webflow',
      'Optimized website performance, SEO, and accessibility for production-level deployments',
    ],
    technologies: [
      'Webflow',
      'React',
      'TypeScript',
      'Next.js',
      'Tailwind CSS',
      'Node.js',
      'Express.js',
      'MongoDB',
      'Git',
      'Figma',
    ],
  },
];

const impact = [
  { tag: 'Delivery', value: '40+', label: 'Projects Built' },
  { tag: 'Career', value: '2', label: 'Years Experience' },
  { tag: 'Stack', value: '12+', label: 'Technologies' },
  { tag: 'Softvence', value: 'Live', label: 'Production sites' },
];

const Experience = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('visible');
        }),
      { threshold: 0.1 }
    );
    sectionRef.current?.querySelectorAll('.reveal-up').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section id="experience" ref={sectionRef} className="py-10 md:py-24">
      <div className="reveal-up mb-8 md:mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
          Work Experience
        </h2>
        <p className="mt-3 text-[#8E8E93] max-w-xl text-sm md:text-base">
          Full-time, hybrid and contractual roles
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-10 md:mb-16">
        {impact.map((item, i) => (
          <div
            key={item.label}
            className="reveal-up relative group bg-[#0E0C17] border border-[#191528] rounded-2xl md:rounded-3xl p-4 md:p-8 overflow-hidden hover:border-[#7873F5]/30 transition-all duration-300 min-h-[140px] md:min-h-[200px] flex flex-col"
            style={{ transitionDelay: `${i * 50}ms` }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#7873F5]/5 to-[#EC77AB]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <span className="inline-block w-fit px-3 py-1 rounded-full bg-[#110E1B] border border-[#191528] text-xs font-mono text-[#8E8E93] group-hover:text-[#EC77AB] group-hover:border-[#EC77AB]/30 transition-colors">
                {item.tag}
              </span>
              <div>
                <h3 className="text-2xl md:text-4xl font-black tracking-tighter mb-2">
                  <span className="grad-text">{item.value}</span>
                </h3>
                <p className="text-[#8E8E93] text-sm font-medium">{item.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-8">
        {experiences.map((exp, i) => (
          <div key={i} className="reveal-up">
            <div className="p-5 lg:p-10 rounded-3xl bg-[#0E0C17] border border-[#191528] hover:border-[#7873F5]/30 transition-all duration-300">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8 pb-6 border-b border-[#191528]">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#110E1B] border border-[#191528]">
                    <Briefcase size={22} className="text-[#7873F5]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-white">{exp.title}</h3>
                    <p className="text-base mt-0.5 grad-text">{exp.company}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 lg:flex-col lg:items-end">
                  <div className="flex items-center gap-1.5 text-xs text-[#8E8E93]">
                    <Calendar size={12} /> {exp.period}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#8E8E93]">
                    <MapPin size={12} /> {exp.location}
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#7873F5]/10 text-[#7873F5] border border-[#7873F5]/20">
                    {exp.type}
                  </span>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xs font-semibold mb-4 uppercase tracking-widest text-[#48484A]">
                    Key Responsibilities
                  </h4>
                  <ul className="space-y-3">
                    {exp.responsibilities.map((r, j) => (
                      <li key={j} className="flex items-start gap-3 text-sm text-[#8E8E93]">
                        <ChevronRight size={14} className="mt-0.5 flex-shrink-0 text-[#7873F5]" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-semibold mb-4 uppercase tracking-widest text-[#48484A]">
                    Tech Stack
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {exp.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-4 py-2 rounded-xl bg-[#110E1B] border border-[#191528] text-sm text-[#8E8E93]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Experience;
