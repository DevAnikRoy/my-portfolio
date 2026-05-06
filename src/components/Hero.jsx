import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import heroImage from '../assets/new-img-2026.jpg';

const ROLES = ['Frontend Architect', 'React Developer', 'Webflow Expert', 'UI Engineer'];

const Hero = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  const enableVoice = () => {
    try {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) { const r = new SR(); r.start(); r.stop(); }
    } catch (e) { console.error('Speech Activation Error:', e); }
  };

  // Three.js particle field
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    const resize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();

    // Particle field
    const N = window.innerWidth < 768 ? 800 : 2000;
    const positions = new Float32Array(N * 3);
    const colors = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      const t = Math.random();
      colors[i * 3] = t < 0.5 ? 0 : 0.49;
      colors[i * 3 + 1] = t < 0.5 ? 0.83 : 0.23;
      colors[i * 3 + 2] = t < 0.5 ? 1 : 0.93;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(geo, mat);
    scene.add(particles);

    // Rotating wireframe torus
    const torusMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff, wireframe: true, transparent: true, opacity: 0.05 });
    const torus = new THREE.Mesh(new THREE.TorusGeometry(3, 1.2, 16, 80), torusMat);
    scene.add(torus);

    let mouseX = 0, mouseY = 0;
    const onMouse = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 0.5;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 0.5;
    };
    window.addEventListener('mousemove', onMouse);

    let frame = 0;
    const animate = () => {
      frame++;
      const t = frame * 0.003;
      particles.rotation.y = t * 0.1 + mouseX * 0.3;
      particles.rotation.x = mouseY * 0.3;
      torus.rotation.x = t * 0.2;
      torus.rotation.y = t * 0.3;
      camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
      camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.05;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', resize);
      ro.disconnect();
      renderer.dispose();
    };
  }, []);

  // Typewriter
  useEffect(() => {
    const role = ROLES[roleIndex];
    let timeout;
    if (!isDeleting && charIndex < role.length) {
      timeout = setTimeout(() => { setDisplayText(role.slice(0, charIndex + 1)); setCharIndex(c => c + 1); }, 80);
    } else if (isDeleting && charIndex > 0) {
      timeout = setTimeout(() => { setDisplayText(role.slice(0, charIndex - 1)); setCharIndex(c => c - 1); }, 40);
    } else if (!isDeleting && charIndex === role.length) {
      timeout = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setRoleIndex(i => (i + 1) % ROLES.length);
    }
    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, roleIndex]);

  // GSAP entrance
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      gsap.set(['.hero-badge', '.hero-name', '.hero-role-line', '.hero-desc', '.hero-cta', '.hero-img', '.hero-stat'], { opacity: 0, y: 40 });
      tl
        .to('.hero-badge', { opacity: 1, y: 0, duration: 0.8, delay: 0.2 })
        .to('.hero-name', { opacity: 1, y: 0, duration: 1, stagger: 0.1 }, '-=0.4')
        .to('.hero-role-line', { opacity: 1, y: 0, duration: 0.8 }, '-=0.5')
        .to('.hero-desc', { opacity: 1, y: 0, duration: 0.8 }, '-=0.5')
        .to('.hero-cta', { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }, '-=0.5')
        .to('.hero-img', { opacity: 1, y: 0, duration: 1, ease: 'back.out(1.5)' }, '-=0.8')
        .to('.hero-stat', { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, '-=0.6');

      // Parallax on scroll
      const onScroll = () => {
        const s = window.scrollY;
        if (containerRef.current) {
          gsap.set('.hero-content-inner', { y: s * 0.3 });
          gsap.set('.hero-img', { y: -s * 0.15 });
        }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => window.removeEventListener('scroll', onScroll);
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const stats = [
    { value: '1+', label: 'Years Exp.' },
    { value: '10+', label: 'Projects Built' },
    { value: '3+', label: 'Tech Stacks' },
  ];

  return (
    <section ref={containerRef} id="home" className="relative min-h-[100svh] w-full flex items-center overflow-hidden"
      style={{ background: 'var(--clr-bg)' }}>

      {/* Three.js Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} />

      {/* Grid overlay */}
      <div className="absolute inset-0 grid-pattern opacity-40" style={{ zIndex: 1 }} />

      {/* Radial gradient center glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none" style={{
        background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)',
        zIndex: 1
      }} />

      {/* Content */}
      <div className="hero-content-inner relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-28 lg:py-0 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-6">

        {/* Left */}
        <div className="flex-1 text-center lg:text-left order-2 lg:order-1">

          {/* Badge */}
          <div className="hero-badge inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full"
            style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--clr-accent)' }} />
            <span className="section-label" style={{ fontSize: '0.6rem' }}>Based in Dhaka, BD · Open for Projects</span>
          </div>

          {/* Name */}
          <div style={{ fontFamily: 'var(--font-display)' }}>
            <h1 className="hero-name text-fluid-xl font-extrabold leading-none tracking-tight text-white">
              Creative
            </h1>
            <h1 className="hero-name text-fluid-xl font-extrabold leading-none tracking-tight"
              style={{ color: 'var(--clr-accent)' }}>
              Frontend
            </h1>
            <h1 className="hero-name text-fluid-xl font-extrabold leading-none tracking-tight"
              style={{ WebkitTextStroke: '1px rgba(255,255,255,0.2)', color: 'transparent' }}>
              Dev.
            </h1>
          </div>

          {/* Typewriter Role */}
          <div className="hero-role-line mt-5 flex items-center gap-2 justify-center lg:justify-start">
            <span className="text-sm font-medium" style={{ color: 'var(--clr-muted)', fontFamily: 'var(--font-mono)' }}>
              &gt; Currently:{' '}
            </span>
            <span className="text-sm font-bold" style={{ color: 'var(--clr-accent)', fontFamily: 'var(--font-mono)' }}>
              {displayText}
            </span>
            <span className="blink text-sm font-bold" style={{ color: 'var(--clr-accent)' }}>|</span>
          </div>

          {/* Description */}
          <p className="hero-desc mt-6 text-base leading-relaxed max-w-md mx-auto lg:mx-0"
            style={{ color: 'var(--clr-muted)' }}>
            Webflow Developer at <span style={{ color: 'var(--clr-text)' }}>Softvence</span>.
            Specialized in turning complex logic into immersive digital experiences.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mt-8 justify-center lg:justify-start">
            <button
              onClick={enableVoice}
              className="hero-cta group relative px-7 py-3.5 rounded-full font-bold text-sm overflow-hidden transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, var(--clr-accent), var(--clr-accent2))',
                color: 'black',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.05em'
              }}
            >
              <span className="relative z-10">Explore Portfolio</span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(135deg, var(--clr-accent2), var(--clr-accent))' }} />
            </button>

            <a
              href="#contact"
              onClick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="hero-cta px-7 py-3.5 rounded-full font-bold text-sm transition-all duration-300 hover:text-white"
              style={{
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.6)',
                background: 'rgba(255,255,255,0.03)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.05em'
              }}
            >
              Hire Me →
            </a>
          </div>

          {/* Stats */}
          <div className="flex gap-8 mt-12 justify-center lg:justify-start">
            {stats.map((s, i) => (
              <div key={i} className="hero-stat text-center lg:text-left">
                <div className="text-2xl font-black" style={{ color: 'var(--clr-accent)', fontFamily: 'var(--font-display)' }}>{s.value}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--clr-muted)', fontFamily: 'var(--font-mono)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right - Image */}
        <div className="hero-img flex-1 flex justify-center lg:justify-end order-1 lg:order-2">
          <div className="relative">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full spin-slow"
              style={{ border: '1px solid rgba(0,212,255,0.15)', transform: 'scale(1.15)' }} />
            {/* Accent dots */}
            <div className="absolute -top-4 -right-4 w-3 h-3 rounded-full float"
              style={{ background: 'var(--clr-accent)', boxShadow: '0 0 20px var(--clr-accent)' }} />
            <div className="absolute -bottom-4 -left-4 w-2 h-2 rounded-full float"
              style={{ background: 'var(--clr-accent2)', boxShadow: '0 0 15px var(--clr-accent2)', animationDelay: '-2s' }} />

            {/* Image */}
            <div className="relative w-56 h-56 sm:w-72 sm:h-72 lg:w-[380px] lg:h-[380px] rounded-full overflow-hidden"
              style={{ border: '3px solid rgba(0,212,255,0.2)', boxShadow: '0 0 60px rgba(0,212,255,0.1), inset 0 0 40px rgba(0,0,0,0.3)' }}>
              <img
                ref={imageRef}
                src={heroImage}
                alt="Anik Roy"
                className="w-full h-full object-cover scale-105"
              />
              {/* Gradient overlay on image */}
              <div className="absolute inset-0"
                style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.1) 0%, transparent 50%)' }} />
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:-right-8 float"
              style={{ animationDelay: '-1s' }}>
              <div className="glass px-4 py-2 rounded-xl text-xs whitespace-nowrap"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--clr-accent)' }}>
                <span className="w-2 h-2 rounded-full inline-block mr-2 animate-pulse"
                  style={{ background: 'var(--clr-accent)' }} />
                Available for work
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <span className="section-label" style={{ fontSize: '0.55rem' }}>Scroll</span>
        <div className="w-px h-12 relative overflow-hidden" style={{ background: 'rgba(0,212,255,0.15)' }}>
          <div className="absolute top-0 left-0 w-full animate-bounce"
            style={{ height: '40%', background: 'linear-gradient(to bottom, var(--clr-accent), transparent)' }} />
        </div>
      </div>
    </section>
  );
};

export default Hero;