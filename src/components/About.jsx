import React, { useRef, useEffect } from 'react';
import { Code, Coffee, Mountain, Camera } from 'lucide-react';
import aboutImg from '../assets/aniks-dev-vibe.jpg';

const interests = [
  { icon: Mountain, label: 'Hiking', desc: 'Exploring nature trails for creative reset.', color: '#00d4ff' },
  { icon: Camera, label: 'Photography', desc: 'Capturing moments through composition.', color: '#7c3aed' },
  { icon: Coffee, label: 'Coffee', desc: 'Specialty brews fuel deep work sessions.', color: '#00d4ff' },
  { icon: Code, label: 'Open Source', desc: 'Contributing to community-driven projects.', color: '#7c3aed' },
];

const About = () => {
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
    <section id="about" ref={sectionRef} className="py-24 lg:py-32 relative overflow-hidden"
      style={{ background: 'var(--clr-surface)' }}>

      {/* Grid pattern */}
      <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />

      {/* Glow */}
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at left bottom, rgba(0,212,255,0.04) 0%, transparent 60%)' }} />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Image side */}
          <div className="reveal-up order-2 lg:order-1">
            <div className="relative">
              {/* Main image */}
              <div className="relative rounded-2xl overflow-hidden"
                style={{ border: '1px solid var(--clr-border)', maxWidth: 440 }}>
                <img src={aboutImg} alt="Anik Dev Vibe"
                  className="w-full object-cover" style={{ aspectRatio: '4/3' }} />
                <div className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, var(--clr-surface) 0%, transparent 40%)' }} />
              </div>

              {/* Floating card */}
              <div className="absolute -right-4 lg:-right-10 bottom-8 glass px-4 py-3 rounded-xl float"
                style={{ maxWidth: 180 }}>
                <div className="text-xs mb-1" style={{ color: 'var(--clr-muted)', fontFamily: 'var(--font-mono)' }}>Current Role</div>
                <div className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                  Webflow Dev
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--clr-accent)' }}>@ Softvence</div>
              </div>

              {/* Accent line */}
              <div className="absolute -left-3 top-8 bottom-8 w-px"
                style={{ background: 'linear-gradient(to bottom, transparent, var(--clr-accent), transparent)' }} />
            </div>
          </div>

          {/* Content side */}
          <div className="order-1 lg:order-2">
            <div className="reveal-up">
              <span className="section-label">Who I Am</span>
              <h2 className="mt-3 font-extrabold text-white" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,5vw,3rem)' }}>
                The Story <span className="gradient-text">Behind</span> the Code
              </h2>
            </div>

            <div className="reveal-up mt-8 space-y-4 text-base leading-relaxed" style={{ color: 'var(--clr-muted)', transitionDelay: '0.1s' }}>
              <p>
                My programming journey began <span style={{ color: 'var(--clr-text)' }}>1 year ago</span> when I discovered the magic of turning ideas into reality through code. What started as curiosity evolved into a craft.
              </p>
              <p>
                I'm a full-stack developer skilled in <span style={{ color: 'var(--clr-accent)' }}>React.js, Node.js, Express.js,</span> and <span style={{ color: 'var(--clr-accent)' }}>MongoDB</span>, with a passion for building fast, responsive, and user-friendly web applications. I work with Tailwind CSS, Framer Motion, and create visually stunning interfaces using <span style={{ color: 'var(--clr-text)' }}>Webflow and Framer</span>.
              </p>
              <p>
                The work that excites me most involves solving challenging technical problems, optimizing performance, and collaborating with teams to bring innovative ideas to life.
              </p>
            </div>

            {/* Interests grid */}
            <div className="reveal-up mt-10 grid grid-cols-2 gap-3" style={{ transitionDelay: '0.2s' }}>
              {interests.map(({ icon: Icon, label, desc, color }, i) => (
                <div key={i} className="group p-4 rounded-xl transition-all duration-300 cursor-default"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--clr-border)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = `${color}40`}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--clr-border)'}>
                  <Icon size={22} className="mb-2" style={{ color }} />
                  <div className="font-semibold text-sm text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>{label}</div>
                  <div className="text-xs leading-relaxed" style={{ color: 'var(--clr-muted)' }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;