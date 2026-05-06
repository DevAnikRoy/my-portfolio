import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const Hero = () => {
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  const enableVoice = () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.start();
        recognition.stop();
        console.log("Voice System Initialized");
      }
    } catch (e) {
      console.error("Speech Activation Error:", e);
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      // Initial States
      gsap.set(".hero-line span", { y: "110%" });
      gsap.set(".hero-sub", { opacity: 0, y: 30 });
      gsap.set(".profile-frame", { opacity: 0, scale: 0.8, rotate: -5 });

      tl.to(".hero-line span", {
        y: "0%",
        duration: 1.5,
        stagger: 0.1,
        delay: 0.2
      })
      .to(".hero-sub", {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.2
      }, "-=1")
      .to(".profile-frame", {
        opacity: 1,
        scale: 1,
        rotate: 0,
        duration: 1.2,
        ease: "back.out(1.7)"
      }, "-=1.2")
      .to(".floating-glow", {
        opacity: 0.6,
        duration: 2,
      }, 0);

      // Mouse Parallax for Immersive Feel
      const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const xPos = (clientX / window.innerWidth - 0.5) * 30;
        const yPos = (clientY / window.innerHeight - 0.5) * 30;
        
        gsap.to(".floating-glow", { x: xPos * 2, y: yPos * 2, duration: 1 });
        gsap.to(imageRef.current, { x: -xPos, y: -yPos, duration: 1 });
      };

      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);

    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={containerRef} 
      className="relative min-h-[100svh] w-full bg-slate-950 flex items-center justify-center px-4 md:px-12 lg:px-20 overflow-hidden py-20 lg:py-0"
    >
      {/* Immersive Mesh Glow */}
      <div className="floating-glow absolute top-1/4 left-1/4 w-[50vw] h-[50vw] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none opacity-0" />
      <div className="floating-glow absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none opacity-0" />

      <div className="relative z-10 w-full max-w-7xl flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
        
        {/* Content Side */}
        <div className="flex-1 text-center lg:text-left order-2 lg:order-1">
          <p className="hero-sub font-mono text-blue-400 text-xs md:text-sm tracking-[0.4em] uppercase mb-6">
            Based in Dhaka, BD // Open for Projects
          </p>
          
          <div className="space-y-1">
            <h1 className="hero-line overflow-hidden text-[12vw] sm:text-6xl lg:text-8xl font-black text-white uppercase leading-[0.9]">
              <span className="block italic">Creative</span>
            </h1>
            <h1 className="hero-line overflow-hidden text-[12vw] sm:text-6xl lg:text-8xl font-black text-white uppercase leading-[0.9]">
              <span className="block lg:ml-[2rem]">Frontend</span>
            </h1>
            <h1 className="hero-line overflow-hidden text-[12vw] sm:text-6xl lg:text-8xl font-black uppercase leading-[0.9] text-transparent stroke-white" 
                style={{ WebkitTextStroke: "1px rgba(255,255,255,0.4)" }}>
              <span className="block">Architect.</span>
            </h1>
          </div>

          <div className="hero-sub mt-8 max-w-lg mx-auto lg:mx-0">
            <p className="text-gray-400 text-sm md:text-lg leading-relaxed mb-10">
              Webflow Developer at <span className="text-white">Softvence</span>. Specialized in turning complex logic into immersive experiences.
            </p>
            
            <button 
              onClick={enableVoice}
              className="group relative px-10 py-4 bg-white text-black font-bold uppercase text-xs tracking-widest transition-all rounded-full overflow-hidden hover:text-white"
            >
              <span className="relative z-10">Explore Portfolio</span>
              <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
          </div>
        </div>

        {/* Image Side */}
        <div className="flex-1 flex justify-center lg:justify-end order-1 lg:order-2 w-full max-w-md lg:max-w-none">
          <div className="profile-frame relative">
            {/* Geometric Accent */}
            <div className="absolute -inset-4 border border-blue-500/20 rounded-full animate-spin-slow pointer-events-none" />
            
            <div className="relative w-56 h-56 sm:w-72 sm:h-72 lg:w-[400px] lg:h-[400px] rounded-full overflow-hidden border-4 border-slate-900 shadow-2xl">
              <img 
                ref={imageRef}
                src="/src/assets/new-img-2026.png" // Updated to use root path
                alt="Anik Profile"
                className="w-full h-full object-cover scale-110"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;