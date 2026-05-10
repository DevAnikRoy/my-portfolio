import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import heroImage from '../assets/new-img-2026.jpg';

const ROLES = [
  'Frontend Architect',
  'React Developer',
  'Webflow Expert',
  'UI Engineer',
  'Creative Dev'
];

export default function Hero() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [role, setRole] = useState(0);
  const [text, setText] = useState('');
  const [del, setDel] = useState(false);
  const [char, setChar] = useState(0);

  /* TYPEWRITER */
  useEffect(() => {
    const r = ROLES[role];
    let t;

    if (!del && char < r.length) {
      t = setTimeout(() => {
        setText(r.slice(0, char + 1));
        setChar((c) => c + 1);
      }, 75);
    } else if (del && char > 0) {
      t = setTimeout(() => {
        setText(r.slice(0, char - 1));
        setChar((c) => c - 1);
      }, 38);
    } else if (!del && char === r.length) {
      t = setTimeout(() => setDel(true), 2200);
    } else if (del && char === 0) {
      setDel(false);
      setRole((r) => (r + 1) % ROLES.length);
    }

    return () => clearTimeout(t);
  }, [char, del, role]);

  /* THREE */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      50,
      1,
      0.1,
      100
    );

    camera.position.z = 5;

    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      renderer.setSize(w, h, false);

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    resize();

    const icoGeo = new THREE.IcosahedronGeometry(1.6, 3);

    const icoMat = new THREE.MeshBasicMaterial({
      color: 0x00d4ff,
      wireframe: true,
      transparent: true,
      opacity: 0.07
    });

    const ico = new THREE.Mesh(icoGeo, icoMat);
    scene.add(ico);

    const torus = new THREE.Mesh(
      new THREE.TorusGeometry(2.4, 0.6, 8, 60),
      new THREE.MeshBasicMaterial({
        color: 0x8b5cf6,
        wireframe: true,
        transparent: true,
        opacity: 0.05
      })
    );

    scene.add(torus);

    const N = window.innerWidth < 768 ? 900 : 2400;

    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);

    for (let i = 0; i < N; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.5 + Math.random() * 4;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const t = Math.random();

      col[i * 3] = t > 0.5 ? 0 : 0.54;
      col[i * 3 + 1] = t > 0.5 ? 0.83 : 0.36;
      col[i * 3 + 2] = 1;
    }

    const pGeo = new THREE.BufferGeometry();

    pGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(pos, 3)
    );

    pGeo.setAttribute(
      'color',
      new THREE.BufferAttribute(col, 3)
    );

    const pts = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({
        size: 0.035,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
      })
    );

    scene.add(pts);

    let mx = 0;
    let my = 0;

    const onMouse = (e) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 0.6;
      my = (e.clientY / window.innerHeight - 0.5) * 0.6;
    };

    window.addEventListener('mousemove', onMouse);

    let frame = 0;
    let raf;

    const tick = () => {
      raf = requestAnimationFrame(tick);

      frame++;

      const t = frame * 0.003;

      ico.rotation.x = t * 0.15 + my * 0.4;
      ico.rotation.y = t * 0.2 + mx * 0.4;

      torus.rotation.x = t * 0.08;
      torus.rotation.z = t * 0.12 + mx * 0.2;

      pts.rotation.y = t * 0.05 + mx * 0.15;
      pts.rotation.x = my * 0.15;

      camera.position.x +=
        (mx * 0.3 - camera.position.x) * 0.04;

      camera.position.y +=
        (-my * 0.3 - camera.position.y) * 0.04;

      renderer.render(scene, camera);
    };

    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMouse);
      renderer.dispose();
    };
  }, []);

  /* GSAP */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power4.out' }
      });

      gsap.set(
        [
          '.h-badge',
          '.h-line',
          '.h-role',
          '.h-desc',
          '.h-cta',
          '.h-stat',
          '.h-img'
        ],
        {
          opacity: 0,
          y: 50
        }
      );

      tl.to('.h-badge', {
        opacity: 1,
        y: 0,
        duration: 0.9,
        delay: 0.3
      })
        .to('.h-line', {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.1
        })
        .to('.h-role', {
          opacity: 1,
          y: 0
        })
        .to('.h-desc', {
          opacity: 1,
          y: 0
        })
        .to('.h-cta', {
          opacity: 1,
          y: 0
        })
        .to('.h-stat', {
          opacity: 1,
          y: 0,
          stagger: 0.1
        })
        .to('.h-img', {
          opacity: 1,
          y: 0
        });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const enableVoice = () => {
    document
      .getElementById('projects')
      ?.scrollIntoView({
        behavior: 'smooth'
      });
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      <div
        className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-12 flex flex-col-reverse lg:flex-row items-center justify-between gap-12"
      >
        {/* LEFT */}
        <div className="flex-1 text-center lg:text-left pt-10">

          {/* Badge */}
          <div
            className="h-badge inline-flex items-center gap-3 px-4 py-2 rounded-full mb-2"
            style={{
              background: '#49ff3f0b',
              border: '1px solid #49ff3f6d'
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: 'var(--accent)'
              }}
            />

            <span
              style={{
                fontSize: '.8rem',
                fontWeight: 500,
                letterSpacing: '.05em',
                color: '#49ff3fbb'
              }}
            >
              Based in Dhaka · Open for Projects
            </span>
          </div>

          {/* Headline */}
          <div>

            <div className="h-line">
              <h1
                className="text-white"
                style={{
                  fontSize: 'clamp(3rem,8vw,7rem)',
                  fontWeight: 800,
                  lineHeight: 0.9,
                  letterSpacing: '-0.05em'
                }}
              >
                Creative
              </h1>
            </div>

            <div className="h-line">
              <h1
                className="grad-text"
                style={{
                  fontSize: 'clamp(3rem,8vw,7rem)',
                  fontWeight: 800,
                  lineHeight: 0.9,
                  letterSpacing: '-0.05em'
                }}
              >
                Web
              </h1>
            </div>

            <div className="h-line">
              <h1
                style={{
                  fontSize: 'clamp(3rem,8vw,7rem)',
                  fontWeight: 800,
                  lineHeight: 0.9,
                  letterSpacing: '-0.05em',
                  WebkitTextStroke:
                    '1px rgba(255, 255, 255, 0.56)',
                  color: 'transparent'
                }}
              >
                Architect
              </h1>
            </div>

          </div>

          {/* Typewriter */}
          <div
            className="h-role flex items-center gap-3 mt-6 justify-center lg:justify-start"
            style={{
              fontSize: '.95rem',
              letterSpacing: '.08em'
            }}
          >
            <span
              style={{
                opacity: 0.4
              }}
            >
              &gt;
            </span>

            <span
              style={{
                color: 'var(--accent)',
                fontWeight: 700
              }}
            >
              {text}
            </span>

            <span
              style={{
                color: 'var(--accent)'
              }}
            >
              |
            </span>
          </div>

          {/* Description */}
          <p
            className="h-desc mt-6 max-w-xl leading-relaxed"
            style={{
              color: 'var(--muted)',
              fontSize: '1.05rem'
            }}
          >
            Crafting high-performance digital
            products with{' '}
            <span style={{ color: 'white' }}>
              React, Webflow, and creative engineering.
            </span>{' '}
            Built to convert, scale, and leave
            an impression.
          </p>

          {/* CTA */}
          <div className="h-cta flex gap-4 mt-8 justify-center lg:justify-start">
            <button
              onClick={enableVoice}
              className="btn-primary"
            >
              Explore Portfolio
            </button>

            <a
              href="#contact"
              className="btn-ghost"
            >
              Hire Me →
            </a>
          </div>

          {/* Stats */}
          <div className="flex gap-10 mt-12 justify-center lg:justify-start">

            {[
              ['2+', 'Years Exp.'],
              ['40+', 'Projects Built'],
              ['12+', 'Tech Stacks']
            ].map(([v, l], i) => (
              <div key={i} className="h-stat">
                <div
                  style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    letterSpacing: '-0.04em'
                  }}
                >
                  {v}
                </div>

                <div
                  style={{
                    opacity: 0.65,
                    fontSize: '.85rem'
                  }}
                >
                  {l}
                </div>
              </div>
            ))}

          </div>
        </div>

        {/* RIGHT */}
        <div className="h-img flex item-center justify-center">

          

          <div
            className="overflow-hidden rounded-full"
            style={{
              width: 'clamp(220px,35vw,380px)',
              height: 'clamp(220px,35vw,380px)',
              border:
                '2px solid rgba(0,212,255,0.2)'
            }}
          >
            <img
              src={heroImage}
              alt="Anik Roy"
              className="w-full h-full object-cover"
            />
          </div>

          

        </div>
      </div>
    </section>
  );
}