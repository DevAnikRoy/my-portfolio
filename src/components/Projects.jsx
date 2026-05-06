import React, { useRef, useEffect } from 'react';
import { ExternalLink, Github, Eye, ArrowRight } from 'lucide-react';

const projects = [
  {
    id: 1,
    title: 'Garden Hub Platform',
    description: 'A full-featured e-commerce platform with user authentication, payment processing, and admin dashboard.',
    image: 'https://www.brandywine.org/sites/default/files/styles/body_full/public/2025-04/GardenHub_3.jpg?itok=8L_pb6Vv',
    technologies: ['React', 'Node.js', 'MongoDB', 'Firebase', 'Express.js'],
    liveUrl: 'https://garden-hub-53195.web.app/',
    githubUrl: 'https://github.com/DevAnikRoy/garden-hub-client?tab=readme-ov-file',
    fullDescription: 'Garden Hub is a scalable marketplace for gardening products with secure authentication, payment integration, and an admin dashboard.',
    challenges: ['Implementing secure payment workflows.', 'Ensuring responsive UI across devices.'],
    improvements: ['Add AI-powered plant recommendations.', 'Introduce subscription-based services.'],
    featured: true,
    number: '01',
  },
  {
    id: 2,
    title: 'ServiceHub',
    description: 'A full-stack service booking platform where users book services and providers manage assigned tasks.',
    image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=500',
    technologies: ['React', 'TailwindCSS', 'Framer Motion', 'Firebase Auth', 'Node.js', 'Express', 'MongoDB'],
    liveUrl: 'https://service-assignment-f070a.web.app/',
    githubUrl: 'https://github.com/DevAnikRoy/ServiceHub-Client',
    fullDescription: 'ServiceHub connects users with service providers, offering booking, task management, and secure authentication.',
    challenges: ['Managing real-time booking conflicts.', 'Optimizing backend queries for speed.'],
    improvements: ['Add mobile app integration.', 'Implement AI-driven scheduling.'],
    featured: true,
    number: '02',
  },
  {
    id: 3,
    title: 'AppStore Platform',
    description: 'An interactive AppStore SPA where users explore, install, and review apps across categories.',
    image: 'https://i.ibb.co/rfmssRVY/Screenshot-2025-06-30-024603.png',
    technologies: ['React.js', 'Firebase Auth', 'Tailwind CSS', 'DaisyUI', 'Lucide Icons', 'Vite', 'Netlify'],
    liveUrl: 'https://thriving-hamster-fc7ee4.netlify.app/',
    githubUrl: 'https://github.com/DevAnikRoy/app-store',
    fullDescription: 'AppStore Platform lets users browse, install, and review apps with a sleek SPA interface.',
    challenges: ['Handling dynamic app categories.', 'Ensuring smooth authentication flow.'],
    improvements: ['Add personalized app recommendations.', 'Enable offline mode.'],
    featured: true,
    number: '03',
  },
];

const ProjectCard = ({ project, onProjectView }) => {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -20;
    card.style.transform = `perspective(1000px) rotateX(${y}deg) rotateY(${x}deg) translateZ(10px)`;
  };
  const handleMouseLeave = () => {
    if (cardRef.current) cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: 'var(--clr-surface)',
        border: '1px solid var(--clr-border)',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
    >
      {/* Number label */}
      <div className="absolute top-4 left-4 z-20">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--clr-accent)', opacity: 0.6 }}>
          {project.number}
        </span>
      </div>

      {/* Image */}
      <div className="relative h-48 sm:h-52 overflow-hidden">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 transition-opacity duration-300"
          style={{ background: 'linear-gradient(to bottom, transparent 30%, var(--clr-surface) 100%)' }} />
        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300"
          style={{ background: 'rgba(2,4,8,0.7)' }}>
          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
            className="p-3 rounded-full transition-all duration-200 hover:scale-110"
            style={{ background: 'var(--clr-accent)', color: 'black' }}>
            <ExternalLink size={16} />
          </a>
          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
            className="p-3 rounded-full transition-all duration-200 hover:scale-110"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}>
            <Github size={16} />
          </a>
          <button onClick={() => onProjectView(project)}
            className="p-3 rounded-full transition-all duration-200 hover:scale-110"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}>
            <Eye size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-lg text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          {project.title}
        </h3>
        <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--clr-muted)' }}>
          {project.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {project.technologies.slice(0, 4).map((tech, i) => (
            <span key={i} className="tech-tag">{tech}</span>
          ))}
          {project.technologies.length > 4 && (
            <span className="tech-tag">+{project.technologies.length - 4}</span>
          )}
        </div>

        {/* View detail */}
        <button
          onClick={() => onProjectView(project)}
          className="flex items-center gap-2 text-xs font-semibold transition-all duration-200 group/btn"
          style={{ color: 'var(--clr-accent)', fontFamily: 'var(--font-mono)' }}
        >
          View Case Study
          <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
        </button>
      </div>

      {/* Glow border on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: 'inset 0 0 0 1px rgba(0,212,255,0.3)' }} />
    </div>
  );
};

const Projects = ({ onProjectView }) => {
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
    <section id="projects" ref={sectionRef} className="py-24 lg:py-32 relative"
      style={{ background: 'var(--clr-bg)' }}>

      {/* Background accent */}
      <div className="absolute top-0 right-0 w-1/3 h-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at right top, rgba(124,58,237,0.06) 0%, transparent 60%)' }} />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="reveal-up mb-16">
          <span className="section-label">Selected Work</span>
          <h2 className="mt-3 font-extrabold text-white" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,5vw,3.5rem)' }}>
            Featured <span className="gradient-text">Projects</span>
          </h2>
          <p className="mt-4 text-base max-w-xl" style={{ color: 'var(--clr-muted)' }}>
            A selection of projects showcasing my skills in building scalable, polished web applications.
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <div key={project.id} className="reveal-up" style={{ transitionDelay: `${i * 0.1}s` }}>
              <ProjectCard project={project} onProjectView={onProjectView} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;