import React, { useRef } from 'react';
import { ExternalLink, Github, Eye, ArrowUpRight } from 'lucide-react';
import { useScrollReveal } from './SharedScrolled';

const PROJECTS = [
  {
    id:1, num:'01',
    title:'Garden Hub Platform',
    desc:'A full-featured e-commerce platform with user authentication, payment processing, and admin dashboard.',
    image:'https://www.brandywine.org/sites/default/files/styles/body_full/public/2025-04/GardenHub_3.jpg?itok=8L_pb6Vv',
    tech:['React','Node.js','MongoDB','Firebase','Express.js'],
    live:'https://garden-hub-53195.web.app/',
    git:'https://github.com/DevAnikRoy/garden-hub-client?tab=readme-ov-file',
    fullDescription:'Garden Hub is a scalable marketplace for gardening products with secure authentication, payment integration, and an admin dashboard.',
    challenges:['Implementing secure payment workflows.','Ensuring responsive UI across devices.'],
    improvements:['Add AI-powered plant recommendations.','Introduce subscription-based services.'],
    featured:true,
  },
  {
    id:2, num:'02',
    title:'ServiceHub',
    desc:'A full-stack service booking platform where users book services and providers manage assigned tasks.',
    image:'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=500',
    tech:['React','TailwindCSS','Framer Motion','Firebase Auth','Node.js','Express','MongoDB'],
    live:'https://service-assignment-f070a.web.app/',
    git:'https://github.com/DevAnikRoy/ServiceHub-Client',
    fullDescription:'ServiceHub connects users with service providers, offering booking, task management, and secure authentication.',
    challenges:['Managing real-time booking conflicts.','Optimizing backend queries for speed.'],
    improvements:['Add mobile app integration.','Implement AI-driven scheduling.'],
    featured:true,
  },
  {
    id:3, num:'03',
    title:'AppStore Platform',
    desc:'An interactive AppStore SPA where users explore, install, and review apps across categories.',
    image:'https://i.ibb.co/rfmssRVY/Screenshot-2025-06-30-024603.png',
    tech:['React.js','Firebase Auth','Tailwind CSS','DaisyUI','Lucide Icons','Vite','Netlify'],
    live:'https://thriving-hamster-fc7ee4.netlify.app/',
    git:'https://github.com/DevAnikRoy/app-store',
    fullDescription:'AppStore Platform lets users browse, install, and review apps with a sleek SPA interface.',
    challenges:['Handling dynamic app categories.','Ensuring smooth authentication flow.'],
    improvements:['Add personalized app recommendations.','Enable offline mode.'],
    featured:true,
  },
];

function Card({ p, onView }) {
  const cardRef = useRef(null);

  const onMouseMove = (e) => {
    const c = cardRef.current; if (!c) return;
    const r = c.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width  - .5) * 18;
    const y = ((e.clientY - r.top)  / r.height - .5) * -18;
    c.style.transform = `perspective(900px) rotateX(${y}deg) rotateY(${x}deg) translateZ(8px)`;
  };
  const onMouseLeave = () => { if (cardRef.current) cardRef.current.style.transform = 'perspective(900px) rotateX(0) rotateY(0) translateZ(0)'; };

  return (
    <article ref={cardRef} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}
      className="card group relative flex flex-col"
      style={{ transformStyle:'preserve-3d', willChange:'transform', cursor:'default' }}>

      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio:'16/9' }}>
        <img src={p.image} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.07]" />
        <div className="absolute inset-0" style={{ background:'linear-gradient(to bottom,transparent 30%,var(--bg2) 100%)' }} />

        {/* Hover actions overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300"
          style={{ background:'rgba(3,6,13,0.65)' }}>
          <a href={p.live} target="_blank" rel="noopener noreferrer" title="Live Demo"
            className="flex items-center justify-center w-10 h-10 rounded-xl transition-transform hover:scale-110"
            style={{ background:'var(--accent)', color:'#000' }}>
            <ExternalLink size={16}/>
          </a>
          <a href={p.git} target="_blank" rel="noopener noreferrer" title="GitHub"
            className="flex items-center justify-center w-10 h-10 rounded-xl transition-transform hover:scale-110"
            style={{ background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', color:'#fff' }}>
            <Github size={16}/>
          </a>
          <button onClick={()=>onView(p)} title="Case Study"
            className="flex items-center justify-center w-10 h-10 rounded-xl transition-transform hover:scale-110"
            style={{ background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', color:'#fff' }}>
            <Eye size={16}/>
          </button>
        </div>

        {/* Number */}
        <span className="absolute top-3 left-3 t-mono" style={{ color:'var(--muted2)', zIndex:2 }}>{p.num}</span>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <h3 className="font-bold text-white" style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1rem,2vw,1.2rem)' }}>
          {p.title}
        </h3>
        <p className="t-body flex-1" style={{ color:'var(--muted)', fontSize:'clamp(0.82rem,1.2vw,0.92rem)' }}>{p.desc}</p>

        <div className="flex flex-wrap gap-1.5">
          {p.tech.slice(0,4).map((t,i)=><span key={i} className="tag">{t}</span>)}
          {p.tech.length>4 && <span className="tag">+{p.tech.length-4}</span>}
        </div>

        <button onClick={()=>onView(p)} className="flex items-center gap-1.5 mt-1 transition-opacity hover:opacity-70"
          style={{ color:'var(--accent)', fontFamily:'var(--font-mono)', fontSize:'0.7rem', letterSpacing:'0.04em' }}>
          View Case Study <ArrowUpRight size={13}/>
        </button>
      </div>

      {/* Glow border on hover */}
      <div className="absolute inset-0 rounded-[1.25rem] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ boxShadow:'inset 0 0 0 1px rgba(0,212,255,0.28)' }} />
    </article>
  );
}

export default function Projects({ onProjectView }) {
  const ref = useRef(null);
  useScrollReveal(ref);

  return (
    <section id="projects" ref={ref} className="relative py-24 xl:py-36" style={{ background:'var(--bg)' }}>

      <div className="absolute inset-0 pointer-events-none" style={{
        background:'radial-gradient(ellipse 50% 60% at 90% 20%, rgba(139,92,246,0.05) 0%, transparent 65%)'
      }} />

      <div className="w-full max-w-[1400px] mx-auto px-5 sm:px-8 xl:px-14">

        {/* Header */}
        <div className="sr mb-14 lg:mb-20">
          <span className="label">Selected Work</span>
          <h2 className="t-section font-extrabold text-white mt-3" style={{ fontFamily:'var(--font-display)' }}>
            Featured <span className="grad-text">Projects</span>
          </h2>
          <p className="t-body mt-4 max-w-xl" style={{ color:'var(--muted)' }}>
            Real-world applications built with modern stacks—each solving a genuine problem.
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {PROJECTS.map((p,i)=>(
            <div key={p.id} className="sr" data-delay={i*0.12}>
              <Card p={p} onView={p2=>{ onProjectView({...p2, liveUrl:p2.live, githubUrl:p2.git}); }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}