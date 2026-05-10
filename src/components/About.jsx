import React, { useRef } from 'react';
import { Code, Coffee, Mountain, Camera } from 'lucide-react';
import { useScrollReveal } from './SharedScrolled';
import img from '../assets/aniks-dev-vibe.jpg';

const INTERESTS = [
  { Icon:Mountain, label:'Hiking',      desc:'Finding clarity on nature trails.', color:'var(--accent)' },
  { Icon:Camera,   label:'Photography', desc:'Telling stories through light.',     color:'var(--purple)' },
  { Icon:Coffee,   label:'Coffee',      desc:'Specialty brews power deep work.',   color:'var(--accent)' },
  { Icon:Code,     label:'Open Source', desc:'Building for the community.',        color:'var(--purple)' },
];

export default function About() {
  const ref = useRef(null);
  useScrollReveal(ref);

  return (
    <section id="about" ref={ref} className="relative py-24 xl:py-36 overflow-hidden" style={{ background:'var(--bg2)' }}>

      <div className="absolute inset-0 dot-bg pointer-events-none" style={{ opacity:.35 }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background:'radial-gradient(ellipse 45% 60% at 0% 70%, rgba(0,212,255,0.04) 0%, transparent 60%)'
      }} />

      <div className="w-full max-w-[1400px] mx-auto px-5 sm:px-8 xl:px-14">
        <div className="grid lg:grid-cols-2 gap-14 xl:gap-24 items-center">

          {/* IMAGE */}
          <div className="sr sr-left order-2 lg:order-1">
            <div className="relative" style={{ maxWidth:480 }}>
              <div className="overflow-hidden rounded-2xl" style={{ border:'1px solid var(--border)', aspectRatio:'4/5' }}>
                <img src={img} alt="Anik Dev" className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background:'linear-gradient(to top, var(--bg2) 0%, transparent 40%)' }} />
              </div>

              {/* Floating role card */}
              <div className="absolute -right-4 xl:-right-10 bottom-8 glass px-4 py-3 rounded-2xl a-float" style={{ minWidth:160 }}>
                <p className="t-mono" style={{ color:'var(--muted)', fontSize:'0.6rem' }}>Current Role</p>
                <p className="font-bold text-white mt-0.5" style={{ fontFamily:'var(--font-display)', fontSize:'clamp(0.9rem,1.5vw,1.05rem)' }}>
                  Webflow Dev
                </p>
                <p className="t-mono mt-0.5 text-accent">@ Softvence</p>
              </div>

              {/* Left accent bar */}
              <div className="absolute -left-3 top-6 bottom-6 w-px" style={{
                background:'linear-gradient(to bottom, transparent, var(--accent), transparent)'
              }} />
            </div>
          </div>

          {/* TEXT */}
          <div className="order-1 lg:order-2 flex flex-col gap-7">
            <div className="sr" data-delay="0.1">
              <span className="label">Who I Am</span>
              <h2 className="t-section font-extrabold text-white mt-3" style={{ fontFamily:'var(--font-display)' }}>
                The Story <span className="grad-text">Behind</span> the Code
              </h2>
            </div>

            <div className="sr flex flex-col gap-4 t-body" style={{ color:'var(--muted)', transitionDelay:'.18s' }}>
              <p>My programming journey began <span className="text-white font-medium">1 year ago</span> when I discovered the magic of turning ideas into reality through code. What started as curiosity evolved into craft.</p>
              <p>I'm a full-stack developer skilled in <span className="text-accent">React.js, Node.js, Express.js,</span> and <span className="text-accent">MongoDB</span>. I build fast, responsive, user-friendly web applications and create visually stunning interfaces using <span className="text-white">Webflow and Framer</span>.</p>
              <p>The work that excites me most: challenging problems, performance optimization, and building products with <span className="text-white font-medium">genuine impact</span>.</p>
            </div>

            {/* Interests */}
            <div className="sr grid grid-cols-2 gap-3" style={{ transitionDelay:'.28s' }}>
              {INTERESTS.map(({Icon,label,desc,color},i)=>(
                <div key={i} className="glass-light p-4 rounded-xl transition-all duration-300 group"
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor=`${color === 'var(--accent)' ? 'rgba(0,212,255,0.35)' : 'rgba(139,92,246,0.35)'}` }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border)' }}>
                  <Icon size={20} style={{ color }} className="mb-2.5" />
                  <p className="font-semibold text-white" style={{ fontFamily:'var(--font-display)', fontSize:'clamp(0.85rem,1.4vw,0.95rem)' }}>{label}</p>
                  <p className="t-small mt-1" style={{ color:'var(--muted)' }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}