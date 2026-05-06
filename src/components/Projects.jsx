import React from 'react';
import { ExternalLink, Github, Eye, Star } from 'lucide-react';

const Projects = ({ onProjectView }) => {
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
      challenges: [
        'Implementing secure payment workflows.',
        'Ensuring responsive UI across devices.',
      ],
      improvements: [
        'Add AI-powered plant recommendations.',
        'Introduce subscription-based services.',
      ],
      featured: true,
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
      challenges: [
        'Managing real-time booking conflicts.',
        'Optimizing backend queries for speed.',
      ],
      improvements: [
        'Add mobile app integration.',
        'Implement AI-driven scheduling.',
      ],
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
      fullDescription: 'AppStore Platform lets users browse, install, and review apps with a sleek SPA interface.',
      challenges: [
        'Handling dynamic app categories.',
        'Ensuring smooth authentication flow.',
      ],
      improvements: [
        'Add personalized app recommendations.',
        'Enable offline mode.',
      ],
      featured: true,
    },
  ];

  return (
    <section id="projects" className="py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4">Featured Projects</h2>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto"></div>
      </div>

      {/* Responsive Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto px-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-blue-500/50 transition-all duration-300 flex flex-col group shadow-lg hover:shadow-[0_0_25px_rgba(59,130,246,0.4)]"
          >

            {/* Image */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
                <div className="flex space-x-2">
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-500 rounded-full text-white hover:scale-110 transition-transform"><ExternalLink size={14} /></a>
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-700 rounded-full text-white hover:scale-110 transition-transform"><Github size={14} /></a>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 flex-grow flex flex-col">
              <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {project.technologies.slice(0, 3).map((tech, idx) => (
                  <span key={idx} className="px-2 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 rounded text-xs">{tech}</span>
                ))}
              </div>
              <button
                onClick={() => onProjectView(project)}
                className="mt-auto w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-2 rounded-lg text-sm flex items-center justify-center hover:shadow-[0_0_20px_rgba(139,92,246,0.6)] transition-all"
              >
                <Eye size={14} className="mr-2" /> View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Projects;
