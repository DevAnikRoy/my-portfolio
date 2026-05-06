import React, { useRef, useEffect, useState } from 'react';

const skillCategories = [
  {
    title: 'Frontend',
    icon: '⬡',
    color: '#00d4ff',
    skills: [
      { name: 'React', level: 95 },
      { name: 'TypeScript', level: 70 },
      { name: 'Next.js', level: 70 },
      { name: 'Tailwind CSS', level: 95 },
    ]
  },
  {
    title: 'Backend',
    icon: '⬡',
    color: '#7c3aed',
    skills: [
      { name: 'Node.js', level: 90 },
      { name: 'Express.js', level: 90 },
      { name: 'PostgreSQL', level: 50 },
      { name: 'MongoDB', level: 80 }
    ]
  },
  {
    title: 'Tools & Others',
    icon: '⬡',
    color: '#00d4ff',
    skills: [
      { name: 'Git', level: 92 },
      { name: 'Docker', level: 78 },
      { name: 'Figma', level: 85 },
      { name: 'Webflow', level: 90 },
    ]
  }
];

const techLogos = ['React', 'Node.js', 'MongoDB', 'TypeScript', 'Tailwind', 'Next.js', 'Express', 'Git', 'Figma', 'Docker', 'Firebase', 'Webflow'];

const SkillBar = ({ skill, color, animate }) => (
  <div className="mb-5">
    <div className="flex justify-between mb-2">
      <span className="text-sm font-medium" style={{ color: 'var(--clr-text)', fontFamily: 'var(--font-body)' }}>{skill.name}</span>
      <span className="text-xs font-bold" style={{ color, fontFamily: 'var(--font-mono)' }}>{skill.level}%</span>
    </div>
    <div className="w-full h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
      <div
        className="h-1 rounded-full transition-all duration-1000 ease-out"
        style={{
          width: animate ? `${skill.level}%` : '0%',
          background: `linear-gradient(90deg, ${color}, ${color}88)`,
          boxShadow: animate ? `0 0 10px ${color}50` : 'none',
          transitionDelay: '0.2s'
        }}
      />
    </div>
  </div>
);

const Skills = () => {
  const sectionRef = useRef(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          setAnimate(true);
        }
      }),
      { threshold: 0.2 }
    );
    sectionRef.current?.querySelectorAll('.reveal-up').forEach(el => obs.observe(el));
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="skills" ref={sectionRef} className="py-24 lg:py-32 relative"
      style={{ background: 'var(--clr-bg)' }}>

      {/* Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, var(--clr-accent), transparent)' }} />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="reveal-up text-center mb-16">
          <span className="section-label">Capabilities</span>
          <h2 className="mt-3 font-extrabold text-white" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,5vw,3.5rem)' }}>
            Skills & <span className="gradient-text">Technologies</span>
          </h2>
          <p className="mt-4 text-base max-w-xl mx-auto" style={{ color: 'var(--clr-muted)' }}>
            The tools and technologies I use to bring ideas to life
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillCategories.map((cat, i) => (
            <div
              key={i}
              className="reveal-up p-6 rounded-2xl transition-all duration-300"
              style={{
                background: 'var(--clr-surface)',
                border: '1px solid var(--clr-border)',
                transitionDelay: `${i * 0.1}s`
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = `${cat.color}30`}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--clr-border)'}
            >
              {/* Card header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black"
                  style={{ background: `${cat.color}15`, color: cat.color, border: `1px solid ${cat.color}30` }}>
                  {i === 0 ? 'FE' : i === 1 ? 'BE' : 'DX'}
                </div>
                <h3 className="font-bold text-white" style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
                  {cat.title}
                </h3>
              </div>

              {cat.skills.map((skill, j) => (
                <SkillBar key={j} skill={skill} color={cat.color} animate={animate} />
              ))}
            </div>
          ))}
        </div>

        {/* Marquee tech strip */}
        <div className="reveal-up mt-16 overflow-hidden" style={{ transitionDelay: '0.3s' }}>
          <div className="section-label text-center mb-6">Also Worked With</div>
          <div className="flex overflow-hidden">
            <div className="marquee-track flex gap-4 min-w-max">
              {[...techLogos, ...techLogos].map((tech, i) => (
                <div key={i} className="px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-medium"
                  style={{
                    background: 'var(--clr-surface)',
                    border: '1px solid var(--clr-border)',
                    color: 'var(--clr-muted)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem'
                  }}>
                  {tech}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;