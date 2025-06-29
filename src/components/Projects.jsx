import React from 'react';
import { ExternalLink, Github, Eye } from 'lucide-react';

const Projects = ({ onProjectView }) => {
  const projects = [
    {
      id: 1,
      title: 'Garden Hub Platform',
      description: 'A full-featured e-commerce platform with user authentication, payment processing, and admin dashboard.',
      image: 'https://i.ibb.co/SwLTVhPn/gardenhub-img.png',
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
      title: 'Task Management App',
      description: 'A collaborative task management application with real-time updates and team collaboration features.',
      image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=500',
      technologies: ['Vue.js', 'Express.js', 'PostgreSQL', 'Socket.io', 'Redis'],
      liveUrl: 'https://taskapp-demo.com',
      githubUrl: 'https://github.com/username/task-management',
      featured: true,
      fullDescription: 'A collaborative task management platform that enables teams to organize, track, and complete projects efficiently. Features real-time updates, team collaboration, deadline tracking, and comprehensive reporting.',
      challenges: [
        'Implementing real-time collaboration with Socket.io',
        'Designing efficient database schema for complex relationships',
        'Building intuitive drag-and-drop interface',
        'Managing concurrent user actions and data consistency'
      ],
      improvements: [
        'Add Gantt chart visualization for project timelines',
        'Implement advanced reporting and analytics',
        'Add integration with popular calendar applications',
        'Include time tracking and productivity metrics'
      ]
    },
    {
      id: 3,
      title: 'Weather Dashboard',
      description: 'A beautiful weather dashboard with location-based forecasts and interactive maps.',
      image: 'https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=500',
      technologies: ['React', 'TypeScript', 'OpenWeather API', 'Mapbox', 'Chart.js'],
      liveUrl: 'https://weather-dashboard-demo.com',
      githubUrl: 'https://github.com/username/weather-dashboard',
      featured: true,
      fullDescription: 'An elegant weather dashboard that provides comprehensive weather information with stunning visualizations. Features location-based forecasts, interactive maps, weather alerts, and historical data analysis.',
      challenges: [
        'Integrating multiple weather APIs for comprehensive data',
        'Creating responsive charts and visualizations',
        'Implementing efficient location-based services',
        'Handling API rate limits and error states gracefully'
      ],
      improvements: [
        'Add severe weather notifications and alerts',
        'Implement weather prediction models',
        'Add social sharing of weather conditions',
        'Include air quality and UV index information'
      ]
    },
    {
      id: 4,
      title: 'Social Media Analytics',
      description: 'Analytics dashboard for social media performance tracking and insights.',
      image: 'https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=500',
      technologies: ['Next.js', 'Python', 'D3.js', 'PostgreSQL', 'Docker'],
      liveUrl: 'https://analytics-demo.com',
      githubUrl: 'https://github.com/username/social-analytics',
      featured: false,
      fullDescription: 'A comprehensive social media analytics platform that helps businesses track their social media performance across multiple platforms. Provides detailed insights, engagement metrics, and growth recommendations.',
      challenges: [
        'Processing large datasets efficiently',
        'Creating interactive data visualizations',
        'Integrating with multiple social media APIs',
        'Building scalable data processing pipelines'
      ],
      improvements: [
        'Add AI-powered content recommendations',
        'Implement competitor analysis features',
        'Add automated reporting and alerts',
        'Include sentiment analysis for comments and mentions'
      ]
    }
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
            href="https://github.com"
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