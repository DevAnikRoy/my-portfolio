import React from 'react';
import { ExternalLink, Github, Eye } from 'lucide-react';

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
      featured: true,
      fullDescription: 'Garden Hub is a community-driven web application built for gardening enthusiasts. It’s a platform where users can connect with local gardeners, share tips, explore gardening ideas, ask plant care questions, and join events. The application promotes knowledge sharing in areas such as composting, hydroponics, and balcony gardening, offering a seamless experience with authentication, CRUD operations, and dynamic content.',
      challenges: [
        'Implementing secure payment processing with Stripe API',
        'Optimizing database queries for large product catalogs',
        'Building a responsive design that works across all devices',
        'Managing complex state with shopping cart and user sessions',
        'Securing Firebase authentication flow with route protection',
        'Fetching and filtering gardening tips with real-time feedback',
        'Animating UI components using AOS and React Awesome Reveal',
        'Integrating Swiper.js for interactive carousels in mobile view',
        'Creating private routes and persistent login sessions',
        'Designing clean UI layouts with Tailwind and DaisyUI',
        'Displaying gardener profiles with dynamic tip counts from MongoDB',

      ],
      improvements: [
        'Advanced search and tip filtering',
        'Real-time chat for gardeners',
        'Smart recommendations for users',
        'Multiple payment options for events',
        'Role-based dashboards and profiles',
        'Badges and gamification rewards'
      ]
    },
    {
      id: 2,
      title: 'ServiceHub',
      description: 'A full-stack service booking platform where users book services and providers manage assigned tasks.',
      image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=500', // Replace with your actual screenshot URL
      technologies: [
        'React',
        'Vite',
        'TailwindCSS',
        'Framer Motion',
        'Firebase Auth',
        'Node.js',
        'Express',
        'MongoDB'
      ],
      liveUrl: 'https://service-assignment-f070a.web.app/',
      githubUrl: 'https://github.com/DevAnikRoy/ServiceHub-Client',
      featured: true,
      fullDescription: 'ServiceHub is a full-stack service management platform that allows users to browse and book services while enabling providers to track tasks through a responsive dashboard. Built with React, TailwindCSS, and Firebase Auth, it ensures smooth booking flows and status management through dynamic UI and backend logic.',
      challenges: [
        'Implementing secure user and provider role-based dashboards',
        'Synchronizing service status updates between frontend and backend',
        'Designing intuitive booking flow with scheduling and instructions',
        'Handling authentication and route protection for different user types'
      ],
      improvements: [
        'Add advanced search and service filtering',
        'Enable real-time chat between users and providers',
        'Integrate payment gateway for premium bookings',
        'Add service reviews and provider rating system'
      ]
    },
    {
      id: 3,
      title: 'AppStore Platform',
      description: 'An interactive AppStore SPA where users explore, install, and review apps across categories.',
      image: 'https://i.ibb.co/rfmssRVY/Screenshot-2025-06-30-024603.png', // You can update this with your actual app preview
      technologies: [
        'React.js',
        'Firebase Auth',
        'Tailwind CSS',
        'DaisyUI',
        'Lucide Icons',
        'React Hot Toast',
        'React Router DOM v7',
        'Vite',
        'Netlify'
      ],
      liveUrl: 'https://thriving-hamster-fc7ee4.netlify.app/',
      githubUrl: 'https://github.com/DevAnikRoy/app-store', 
      featured: true,
      fullDescription: 'A user-friendly AppStore experience with secure authentication and smooth navigation. Users can browse trending apps by category, install/uninstall apps, and submit reviews—all wrapped in responsive design and enhanced routing logic.',
      challenges: [
        'Securing access with Firebase Auth and protected routes',
        'Designing conditional UI for installed vs. uninstalled apps',
        'Managing dynamic routing with URL parameters and error fallback',
        'Handling in-session review system without database persistence'
      ],
      improvements: [
        'Add persistent reviews and ratings using Firestore or MongoDB',
        'Enable developer profile pages with listed apps',
        'Integrate install analytics per app',
        'Implement app bookmarking and share features'
      ]
    },
  ];

  const handleProjectClick = (project) => {
    onProjectView(project);
  };

  return (
    <section id="projects" className="py-20 bg-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Featured Projects</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto mb-6"></div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Here are some of my recent projects that showcase my skills and passion for development
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 group"
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