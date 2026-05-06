import React, { useRef, useEffect } from 'react';
import { GraduationCap, Calendar, MapPin, Award } from 'lucide-react';

const educationData = [
  {
    degree: 'Full Stack Web Development Bootcamp',
    institution: 'Programming Hero',
    location: 'Online',
    period: '2025',
    gpa: 'Certificate of Excellence',
    highlights: [
      'Intensive 6-month program',
      'Focus on MERN stack development',
      'Capstone project: E-commerce platform',
      'Mentored junior developers'
    ]
  },
  {
    degree: 'Bachelor of Science, Botany',
    institution: 'University of Dhaka',
    location: 'Dhaka, Bangladesh',
    period: '2018 – 2022',
    highlights: []
  },
];

const Education = () => {
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
    <section id="education" ref={sectionRef} className="py-24 lg:py-32 relative"
      style={{ background: 'var(--clr-surface)' }}>

      <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(0,212,255,0.06) 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }} />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="reveal-up mb-16">
          <span className="section-label">Academic Background</span>
          <h2 className="mt-3 font-extrabold text-white" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,5vw,3.5rem)' }}>
            <span className="gradient-text">Education</span>
          </h2>
          <p className="mt-4 text-base max-w-xl" style={{ color: 'var(--clr-muted)' }}>
            The academic journey that built my foundation
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-px hidden lg:block"
            style={{ background: 'linear-gradient(to bottom, var(--clr-accent), var(--clr-accent2), transparent)' }} />

          <div className="space-y-8">
            {educationData.map((edu, i) => (
              <div key={i} className="reveal-up relative" style={{ transitionDelay: `${i * 0.15}s` }}>

                {/* Timeline dot */}
                <div className="absolute left-4 w-4 h-4 rounded-full hidden lg:block"
                  style={{
                    background: 'linear-gradient(135deg, var(--clr-accent), var(--clr-accent2))',
                    top: '2rem',
                    transform: 'translateX(-50%)',
                    boxShadow: '0 0 15px rgba(0,212,255,0.4)'
                  }} />

                <div className="lg:ml-16 p-6 lg:p-8 rounded-2xl transition-all duration-300 group"
                  style={{
                    background: 'var(--clr-surface2)',
                    border: '1px solid var(--clr-border)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--clr-border)'}>

                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.15))', border: '1px solid rgba(0,212,255,0.2)' }}>
                        <GraduationCap size={22} style={{ color: 'var(--clr-accent)' }} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                          {edu.degree}
                        </h3>
                        <p className="text-sm mt-1" style={{ color: 'var(--clr-accent)' }}>{edu.institution}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 lg:text-right flex-shrink-0">
                      <div className="flex items-center gap-2 text-xs lg:justify-end" style={{ color: 'var(--clr-muted)', fontFamily: 'var(--font-mono)' }}>
                        <Calendar size={12} /> {edu.period}
                      </div>
                      <div className="flex items-center gap-2 text-xs lg:justify-end" style={{ color: 'var(--clr-muted)', fontFamily: 'var(--font-mono)' }}>
                        <MapPin size={12} /> {edu.location}
                      </div>
                      {edu.gpa && (
                        <div className="flex items-center gap-2 text-xs lg:justify-end" style={{ color: 'var(--clr-accent)' }}>
                          <Award size={12} /> {edu.gpa}
                        </div>
                      )}
                    </div>
                  </div>

                  {edu.highlights.length > 0 && (
                    <div className="mt-5 pt-5 flex flex-wrap gap-2"
                      style={{ borderTop: '1px solid var(--clr-border)' }}>
                      {edu.highlights.map((h, j) => (
                        <span key={j} className="tech-tag text-xs">{h}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Education;