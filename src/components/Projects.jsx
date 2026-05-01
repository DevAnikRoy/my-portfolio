import React, { useEffect, useRef } from 'react';
import { ExternalLink, Github, Eye } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register the ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const Projects = ({ onProjectView }) => {
  const sectionRef = useRef(null);

  const projects = [
    {
      id: 1,
      title: 'Garden Hub Platform',
      description: 'A full-featured e-commerce platform with user authentication, payment processing, and admin dashboard.',
      image: 'https://www.brandywine.org/sites/default/files/styles/body_full/public/2025-04/GardenHub_3.jpg?itok=8L_pb6Vv',
      technologies: ['React', 'Node.js', 'MongoDB', 'Firebase', 'Express.js'],
      liveUrl: 'https://garden-hub-53195.web.app/',
      githubUrl: 'https://github.com/DevAnikRoy/garden-hub-client?tab=readme-ov-file',
      featured: true,
      fullDescription: 'Garden Hub is a community-driven web application built for gardening enthusiasts...',
      challenges: [
        'Implementing secure payment processing with Stripe API',
        'Optimizing database queries for large product catalogs',
        // ... rest of your challenges
      ],
      improvements: ['Advanced search', 'Real-time chat', 'Smart recommendations']
    },
    {
      id: 2,
      title: 'ServiceHub',
      description: 'A full-stack service booking platform where users book services and providers manage assigned tasks.',
      image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=500',
      technologies: ['React', 'Vite', 'TailwindCSS', 'Framer Motion', 'Firebase Auth', 'Node.js', 'Express', 'MongoDB'],
      liveUrl: 'https://service-assignment-f070a.web.app/',
      githubUrl: 'https://github.com/DevAnikRoy/ServiceHub-Client',
      featured: true,
    },
    {
      id: 3,
      title: 'AppStore Platform',
      description: 'An interactive AppStore SPA where users explore, install, and review apps across categories.',
      image: 'https://i.ibb.co/rfmssRVY/Screenshot-2025-06-30-024603.png',
      technologies: ['React.js', 'Firebase Auth', 'Tailwind CSS', 'DaisyUI', 'Lucide Icons', 'Vite', 'Netlify'],
      liveUrl: 'https://thriving-hamster-fc7ee4.netlify.app/',
      githubUrl: 'https://github.com/DevAnikRoy/app-store', 
      featured: true,
    },
  ];

  useEffect(() => {
    // Select all elements with the project-card class
    const cards = gsap.utils.toArray('.project-card');
    
    cards.forEach((card, i) => {
      gsap.fromTo(card, 
        { opacity: 0, y: 50 }, 
        { 
          opacity: 1, 
          y: 0, 
          duration: 1,
          delay: i * 0.1, // Stagger effect based on index
          scrollTrigger: {
            trigger: card,
            start: "top 85%", 
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  const handleProjectClick = (project) => {
    onProjectView(project);
  };

  return (
    <section id="projects" ref={sectionRef} className="py-20 bg-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4 overflow-hidden">
            <span className="block">Featured Projects</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto mb-6"></div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Here are some of my recent projects that showcase my skills and passion for development
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div
              key={project.id}
              className="project-card bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 group"
            >
              <div className="relative overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-4 flex space-x-2">
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-white transition-colors duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={16} />
                    </a>
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center text-white transition-colors duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Github size={16} />
                    </a>
                  </div>
                </div>
                {project.featured && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Featured
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-3">{project.title}</h3>
                <p className="text-gray-400 mb-4 line-clamp-3">{project.description}</p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {project.technologies.slice(0, 3).map((tech, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-slate-700 text-gray-300 rounded text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 3 && (
                    <span className="px-2 py-1 bg-slate-700 text-gray-300 rounded text-xs">
                      +{project.technologies.length - 3} more
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleProjectClick(project)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
                >
                  <Eye size={18} className="mr-2" />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-400 mb-4">Want to see more of my work?</p>
          <a
            href="https://github.com/DevAnikRoy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 border-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white font-semibold rounded-lg transition-all duration-200"
          >
            <Github size={20} className="mr-2" />
            Visit My GitHub
          </a>
        </div>
      </div>
    </section>
  );
};

export default Projects;