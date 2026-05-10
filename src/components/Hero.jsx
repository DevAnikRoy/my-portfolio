import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import heroImage from '../assets/new-img-2026.jpg';

const ROLES = ['Frontend Architect', 'React Developer', 'Webflow Expert', 'UI Engineer', 'Creative Dev'];

export default function Hero() {
  const canvasRef    = useRef(null);
  const containerRef = useRef(null);
  const [role, setRole]         = useState(0);
  const [text, setText]         = useState('');
  const [del,  setDel]          = useState(false);
  const [char, setChar]         = useState(0);

  /* ── TYPEWRITER ── */
  useEffect(() => {
    const r = ROLES[role];
    let t;
    if (!del && char < r.length)      t = setTimeout(() => { setText(r.slice(0, char+1)); setChar(c=>c+1); }, 75);
    else if (del && char > 0)         t = setTimeout(() => { setText(r.slice(0, char-1)); setChar(c=>c-1); }, 38);
    else if (!del && char===r.length) t = setTimeout(() => setDel(true), 2200);
    else if (del && char===0)         { setDel(false); setRole(r=>(r+1)%ROLES.length); }
    return () => clearTimeout(t);
  }, [char, del, role]);

  /* ── THREE.JS PARTICLE SPHERE ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 5;

    const resize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();

    /* Icosahedron wireframe */
    const icoGeo = new THREE.IcosahedronGeometry(1.6, 3);
    const icoMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff, wireframe: true, transparent: true, opacity: 0.07 });
    const ico = new THREE.Mesh(icoGeo, icoMat);
    scene.add(ico);

    /* Outer ring torus */
    const torusMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, wireframe: true, transparent: true, opacity: 0.05 });
    const torus = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.6, 8, 60), torusMat);
    scene.add(torus);

    /* Particles */
    const N = window.innerWidth < 768 ? 900 : 2400;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 2.5 + Math.random() * 4;
      pos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i*3+2] = r * Math.cos(phi);
      const t = Math.random();
      col[i*3]   = t > .5 ? 0 : 0.54;
      col[i*3+1] = t > .5 ? 0.83: 0.36;
      col[i*3+2] = 1;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const pMat = new THREE.PointsMaterial({ size: 0.035, vertexColors: true, transparent: true, opacity: 0.8 });
    const pts  = new THREE.Points(pGeo, pMat);
    scene.add(pts);

    let mx = 0, my = 0;
    const onMouse = (e) => {
      mx = (e.clientX / window.innerWidth  - .5) * 0.6;
      my = (e.clientY / window.innerHeight - .5) * 0.6;
    };
    window.addEventListener('mousemove', onMouse, { passive: true });

    let frame = 0, raf;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      frame++;
      const t = frame * 0.003;
      ico.rotation.x  = t * 0.15 + my * 0.4;
      ico.rotation.y  = t * 0.2  + mx * 0.4;
      torus.rotation.x = t * 0.08;
      torus.rotation.z = t * 0.12 + mx * 0.2;
      pts.rotation.y   = t * 0.05 + mx * 0.15;
      pts.rotation.x   = my * 0.15;
      camera.position.x += (mx * 0.3 - camera.position.x) * 0.04;
      camera.position.y += (-my * 0.3 - camera.position.y) * 0.04;
      renderer.render(scene, camera);
    };
    tick();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener('resize', resize, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', resize);
      ro.disconnect();
      renderer.dispose();
    };
  }, []);

  /* ── GSAP ENTRANCE ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      gsap.set(['.h-badge','.h-line','.h-role','.h-desc','.h-cta','.h-stat','.h-img'], { opacity: 0, y: 50 });
      tl
        .to('.h-badge', { opacity:1, y:0, duration:0.9, delay:0.3 })
        .to('.h-line',  { opacity:1, y:0, duration:1.1, stagger:0.12 }, '-=0.6')
        .to('.h-role',  { opacity:1, y:0, duration:0.8 }, '-=0.7')
        .to('.h-desc',  { opacity:1, y:0, duration:0.8 }, '-=0.6')
        .to('.h-cta',   { opacity:1, y:0, duration:0.7, stagger:0.1 }, '-=0.5')
        .to('.h-stat',  { opacity:1, y:0, duration:0.6, stagger:0.08 }, '-=0.5')
        .to('.h-img',   { opacity:1, y:0, duration:1.1, ease:'back.out(1.4)' }, '-=0.9');
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const enableVoice = () => {
    try {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) { const r = new SR(); r.start(); r.stop(); }
    } catch(e) {}
    document.getElementById('projects')?.scrollIntoView({ behavior:'smooth' });
  };

  return (
    <section ref={containerRef} className="relative min-h-[100svh] w-full flex items-center overflow-hidden" style={{ background:'var(--bg)' }}>

      {/* Three.js */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex:0 }} />

      {/* Grid */}
      <div className="absolute inset-0 grid-bg pointer-events-none" style={{ zIndex:1, opacity:.6 }} />

      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex:1,
        background:'radial-gradient(ellipse 70% 60% at 55% 45%, rgba(0,212,255,0.05) 0%, transparent 70%)' }} />

      {/* Content */}
      <div className="relative w-full max-w-[1400px] mx-auto px-5 sm:px-8 xl:px-14 pt-[var(--nav-h)] pb-20 flex flex-col-reverse lg:flex-row items-center justify-between gap-12 lg:gap-8" style={{ zIndex:2 }}>

        {/* ── LEFT ── */}
        <div className="flex-1 w-full text-center lg:text-left">

          {/* Badge */}
          <div className="h-badge inline-flex items-center gap-2.5 mb-7 px-4 py-2 rounded-full"
            style={{ background:'rgba(0,212,255,0.07)', border:'1px solid rgba(0,212,255,0.2)' }}>
            <span className="w-2 h-2 rounded-full a-ping" style={{ background:'var(--accent)', position:'relative' }} />
            <span className="label" style={{ opacity:1 }}>Based in Dhaka · Open for Projects</span>
          </div>

          {/* Name lines */}
          <div style={{ fontFamily:'var(--font-display)' }}>
            <div className="h-line overflow-hidden">
              <p className="t-hero font-extrabold text-white">Creative</p>
            </div>
            <div className="h-line overflow-hidden">
              <p className="t-hero font-extrabold grad-text">Frontend</p>
            </div>
            <div className="h-line overflow-hidden">
              <p className="t-hero font-extrabold" style={{ WebkitTextStroke:'1.5px rgba(255,255,255,0.18)', color:'transparent' }}>
                Architect.
              </p>
            </div>
          </div>

          {/* Typewriter */}
          <div className="h-role flex items-center gap-2 mt-5 justify-center lg:justify-start">
            <span className="t-mono text-muted2">&gt;</span>
            <span className="t-mono text-accent font-bold">{text}</span>
            <span className="t-mono text-accent font-bold a-blink">|</span>
          </div>

          {/* Description */}
          <p className="h-desc t-body mt-6 max-w-lg mx-auto lg:mx-0" style={{ color:'var(--muted)' }}>
            Webflow Developer at <span style={{ color:'var(--text)' }}>Softvence</span>.
            Specialized in turning complex logic into immersive digital experiences that users remember.
          </p>

          {/* CTAs */}
          <div className="h-cta flex flex-wrap gap-3 mt-8 justify-center lg:justify-start">
            <button onClick={enableVoice} className="btn-primary">Explore Portfolio</button>
            <a href="#contact" onClick={e=>{ e.preventDefault(); document.getElementById('contact')?.scrollIntoView({behavior:'smooth'}); }}
              className="btn-ghost">Hire Me →</a>
          </div>

          {/* Stats */}
          <div className="flex gap-8 sm:gap-12 mt-12 justify-center lg:justify-start">
            {[['1+','Years Exp.'],['10+','Projects Built'],['3+','Tech Stacks']].map(([v,l],i)=>(
              <div key={i} className="h-stat">
                <div className="counter-val">{v}</div>
                <div className="label mt-1" style={{ opacity:.65 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT – Profile Image ── */}
        <div className="h-img flex-shrink-0 flex justify-center lg:justify-end">
          <div className="relative">
            {/* Outer ring */}
            <div className="absolute a-spin rounded-full pointer-events-none"
              style={{ inset:'-16px', border:'1px solid rgba(0,212,255,0.12)' }} />
            {/* Accent dot 1 */}
            <div className="absolute a-float rounded-full"
              style={{ width:12, height:12, top:-8, right:-8, background:'var(--accent)', boxShadow:'0 0 24px var(--accent)' }} />
            {/* Accent dot 2 */}
            <div className="absolute a-float rounded-full"
              style={{ width:8, height:8, bottom:-8, left:-8, background:'var(--purple)', boxShadow:'0 0 18px var(--purple)', animationDelay:'-2.2s' }} />

            {/* Image */}
            <div className="relative overflow-hidden rounded-full"
              style={{
                width:'clamp(200px,35vw,380px)', height:'clamp(200px,35vw,380px)',
                border:'2px solid rgba(0,212,255,0.2)',
                boxShadow:'0 0 70px rgba(0,212,255,0.12), inset 0 0 50px rgba(0,0,0,0.4)'
              }}>
              <img src={heroImage} alt="Anik Roy" className="w-full h-full object-cover" style={{ transform:'scale(1.06)' }} />
              <div className="absolute inset-0" style={{ background:'linear-gradient(135deg,rgba(0,212,255,0.08) 0%,transparent 55%)' }} />
            </div>

            {/* Floating card */}
            <div className="absolute a-float glass px-3 py-2 rounded-xl"
              style={{ bottom:8, right:'-10px', animationDelay:'-1s', minWidth:160 }}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full a-ping" style={{ background:'#22c55e' }} />
                <span className="t-mono" style={{ color:'var(--accent)' }}>Available for work</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" style={{ zIndex:3 }}>
        <span className="label" style={{ fontSize:'0.55rem', opacity:.5 }}>Scroll to explore</span>
        <div style={{ width:1, height:48, background:'linear-gradient(to bottom, var(--accent), transparent)', opacity:.4 }} />
      </div>
    </section>
  );
}