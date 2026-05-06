import React, { useRef, useEffect } from 'react';
import { Briefcase, Calendar, MapPin, ChevronRight } from 'lucide-react';

const experiences = [
  {
    title: 'Junior Web Developer',
    company: 'Softvence',
    location: 'Sheridan, WY, USA',
    period: 'July 2025 – Present',
    type: 'Full-time',
    responsibilities: [
      "Developed and maintained responsive Webflow websites for international clients",
      "Collaborated with designers to translate Figma mockups into interactive UI components",
      "Integrated dynamic data and CMS features within Webflow for scalable content management",
      "Worked with React and Tailwind CSS to create reusable UI components outside Webflow",
      "Optimized website performance, SEO, and accessibility for production-level deployments"
    ],
    technologies: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Node.js', 'Express.js', 'MongoDB', 'Git', 'Figma'],
  }
];

const Experience = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.1 }
    );
    sectionRef.current?.querySelectorAll('.reveal-up').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section id="experience" ref={sectionRef} className="py-24 lg:py-32 relative"
      style={{ background: 'var(--clr-bg)' }}>

      {/* Ambient glow */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-1/2 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at right, rgba(0,212,255,0.04) 0%, transparent 60%)' }} />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="reveal-up mb-16">
          <span className="section-label">Career</span>
          <h2 className="mt-3 font-extrabold text-white" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,5vw,3.5rem)' }}>
            Work <span className="gradient-text">Experience</span>
          </h2>
          <p className="mt-4 text-base max-w-xl" style={{ color: 'var(--clr-muted)' }}>
            Professional journey and key achievements in my development career
          </p>
        </div>

        <div className="space-y-8">
          {experiences.map((exp, i) => (
            <div key={i} className="reveal-up" style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="p-6 lg:p-10 rounded-2xl transition-all duration-300"
                style={{ background: 'var(--clr-surface)', border: '1px solid var(--clr-border)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--clr-border)'}>

                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8"
                  style={{ paddingBottom: '1.5rem', borderBottom: '1px solid var(--clr-border)' }}>
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.1), rgba(124,58,237,0.1))', border: '1px solid rgba(0,212,255,0.2)' }}>
                      <Briefcase size={24} style={{ color: 'var(--clr-accent)' }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-white" style={{ fontFamily: 'var(--font-display)' }}>{exp.title}</h3>
                      <p className="text-base mt-0.5" style={{ color: 'var(--clr-accent)' }}>{exp.company}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 lg:flex-col lg:items-end">
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--clr-muted)', fontFamily: 'var(--font-mono)' }}>
                      <Calendar size={12} /> {exp.period}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--clr-muted)', fontFamily: 'var(--font-mono)' }}>
                      <MapPin size={12} /> {exp.location}
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ background: 'rgba(0,212,255,0.1)', color: 'var(--clr-accent)', border: '1px solid rgba(0,212,255,0.2)', fontFamily: 'var(--font-mono)' }}>
                      {exp.type}
                    </span>
                  </div>
                </div>

                {/* Responsibilities */}
                <div className="grid lg:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-sm font-semibold mb-4 uppercase tracking-widest"
                      style={{ color: 'var(--clr-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>
                      Key Responsibilities
                    </h4>
                    <ul className="space-y-3">
                      {exp.responsibilities.map((r, j) => (
                        <li key={j} className="flex items-start gap-3 text-sm" style={{ color: 'var(--clr-muted)' }}>
                          <ChevronRight size={14} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--clr-accent)' }} />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-4 uppercase tracking-widest"
                      style={{ color: 'var(--clr-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>
                      Tech Stack
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {exp.technologies.map((tech, j) => (
                        <span key={j} className="tech-tag">{tech}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;