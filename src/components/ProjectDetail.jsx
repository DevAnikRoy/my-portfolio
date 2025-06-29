import React from 'react';
import { ArrowLeft, ExternalLink, Github, Calendar, Code, Zap, Target } from 'lucide-react';

const ProjectDetail = ({ project, onBack }) => {
  if (!project) return null;

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-200 mb-6"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Projects
          </button>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">{project.title}</h1>
              <p className="text-xl text-gray-300 max-w-3xl">{project.description}</p>
            </div>
            
            <div className="flex space-x-4 mt-6 lg:mt-0">
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-lg transition-all duration-200"
              >
                <ExternalLink size={18} className="mr-2" />
                Live Demo
              </a>
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 border-2 border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white font-semibold rounded-lg transition-all duration-200"
              >
                <Github size={18} className="mr-2" />
                Source Code
              </a>
            </div>
          </div>
        </div>

        {/* Project Image */}
        <div className="mb-12">
          <div className="rounded-lg overflow-hidden shadow-2xl">
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-96 object-cover"
            />
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Overview */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
                <Code className="mr-3 text-blue-400" size={24} />
                Project Overview
              </h2>
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <p className="text-gray-300 text-lg leading-relaxed">
                  {project.fullDescription}
                </p>
              </div>
            </section>

            {/* Challenges */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
                <Zap className="mr-3 text-yellow-400" size={24} />
                Challenges & Solutions
              </h2>
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <ul className="space-y-4">
                  {project.challenges.map((challenge, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                      <p className="text-gray-300">{challenge}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Future Improvements */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
                <Target className="mr-3 text-green-400" size={24} />
                Future Improvements
              </h2>
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <ul className="space-y-4">
                  {project.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                      <p className="text-gray-300">{improvement}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Technologies */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-4">Technologies Used</h3>
              <div className="space-y-3">
                {project.technologies.map((tech, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mr-3"></div>
                    <span className="text-gray-300">{tech}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Project Info */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-4">Project Info</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="text-blue-400 mr-3" size={18} />
                  <div>
                    <p className="text-gray-400 text-sm">Development Time</p>
                    <p className="text-gray-300">3 months</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Code className="text-purple-400 mr-3" size={18} />
                  <div>
                    <p className="text-gray-400 text-sm">Project Type</p>
                    <p className="text-gray-300">Full Stack Web App</p>
                  </div>
                </div>
                {project.featured && (
                  <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-3 rounded-lg">
                    <p className="text-blue-400 font-semibold text-sm">⭐ Featured Project</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-4">Quick Links</h3>
              <div className="space-y-3">
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center w-full p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors duration-200"
                >
                  <ExternalLink className="text-blue-400 mr-3" size={18} />
                  <span className="text-gray-300">View Live Site</span>
                </a>
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center w-full p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors duration-200"
                >
                  <Github className="text-gray-400 mr-3" size={18} />
                  <span className="text-gray-300">Source Code</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;