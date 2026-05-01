import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const Hero = () => {
  const containerRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Staggered reveal of the main heading
      gsap.from(".reveal-text", {
        y: 120,
        skewY: 7,
        duration: 1.5,
        stagger: 0.1,
        ease: "power4.out",
      });
      
      // Subtle background glow movement
      gsap.to(".glow-effect", {
        opacity: 0.6,
        duration: 2,
        repeat: -1,
        yoyo: true
      });
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative h-screen flex flex-col justify-center px-10 overflow-hidden bg-slate-950">
      {/* Background Creative Element */}
      <div className="glow-effect absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10">
        <div className="overflow-hidden mb-2">
          <p className="reveal-text font-mono text-blue-400 text-sm tracking-widest uppercase">
            Creative Frontend & Webflow
          </p>
        </div>
        
        <div className="overflow-hidden">
          <h1 className="reveal-text text-display-xl font-bold text-white uppercase italic">
            Building
          </h1>
        </div>
        
        <div className="overflow-hidden">
          <h1 className="reveal-text text-display-xl font-bold text-white uppercase ml-[10vw]">
            Digital
          </h1>
        </div>
        
        <div className="overflow-hidden">
          <h1 className="reveal-text text-display-xl font-bold text-transparent stroke-text uppercase">
            Products.
          </h1>
        </div>
      </div>
      
      <style jsx>{`
        .stroke-text {
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </section>
  );
};

export default Hero;