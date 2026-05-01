import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const Hero = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      // 1. Initial State: Hide everything to prevent "flash of unstyled content"
      gsap.set(".hero-line span", { y: "100%" });
      gsap.set(".hero-sub", { opacity: 0, y: 20 });

      // 2. The Animation Sequence
      tl.to(".hero-line span", {
        y: "0%",
        duration: 1.2,
        stagger: 0.15,
        delay: 0.5
      })
      .to(".hero-sub", {
        opacity: 1,
        y: 0,
        duration: 1,
      }, "-=0.5") // Starts slightly before the text finish
      .to(".glow-bg", {
        opacity: 0.4,
        scale: 1.2,
        duration: 2,
        ease: "sine.inOut"
      }, 0);

    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative h-screen w-full bg-slate-950 flex flex-col justify-center px-6 md:px-20 overflow-hidden">
      
      {/* Dynamic Background Glow */}
      <div className="glow-bg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none opacity-0" />

      <div className="relative z-10 max-w-7xl">
        <p className="hero-sub font-mono text-blue-400 text-xs md:text-sm tracking-[0.3em] uppercase mb-8">
          Based in Dhaka, BD // Open for Projects
        </p>
        
        {/* Masked Text Reveal - This creates the "High-End" look */}
        <div className="space-y-[-0.05em]">
          <h1 className="hero-line overflow-hidden text-display-lg md:text-display-xl font-bold text-white uppercase italic">
            <span className="block">Creative</span>
          </h1>
          <h1 className="hero-line overflow-hidden text-display-lg md:text-display-xl font-bold text-white uppercase">
            <span className="block ml-[5vw]">Frontend</span>
          </h1>
          <h1 className="hero-line overflow-hidden text-display-lg md:text-display-xl font-bold text-transparent outline-title uppercase">
            <span className="block">Architect.</span>
          </h1>
        </div>

        <div className="hero-sub mt-12 flex flex-col md:flex-row gap-8 items-start md:items-center">
          <p className="text-gray-400 max-w-md text-sm md:text-base leading-relaxed">
            Webflow Developer at Softvence. Specialized in turning complex logic into immersive, animated experiences.
          </p>
          <button className="px-8 py-4 bg-white text-black font-bold uppercase text-xs tracking-widest hover:bg-blue-500 hover:text-white transition-colors">
            Start a Conversation
          </button>
        </div>
      </div>

      <style jsx>{`
        .outline-title {
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </section>
  );
};

export default Hero;