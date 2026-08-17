import React from 'react';
import { ArrowLeft, ExternalLink, Github, Calendar, Code, Zap, Target } from 'lucide-react';

const ProjectDetail = ({ project, onBack }) => {
  if (!project) return null;

  const liveUrl = project.liveUrl || project.live;
  const githubUrl = project.githubUrl || project.git;

  return (
    <div className="min-h-screen px-4 pt-[calc(5.5rem+env(safe-area-inset-top))] pb-10 md:p-12 lg:p-16 md:pt-12">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={onBack}
          className="inline-flex items-center text-[#8E8E93] hover:text-white transition-colors duration-200 mb-8 min-h-[44px]"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Projects
        </button>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">{project.title}</h1>
            <p className="text-lg text-[#8E8E93] max-w-3xl">
              {project.description || project.desc}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center min-h-[48px] px-6 py-3 bg-gradient-to-r from-[#7873F5] to-[#EC77AB] text-white font-semibold rounded-2xl transition-all hover:opacity-90"
            >
              <ExternalLink size={18} className="mr-2" />
              Live Site
            </a>
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center min-h-[48px] px-6 py-3 border border-[#191528] text-[#8E8E93] hover:text-white hover:border-[#7873F5]/40 font-semibold rounded-2xl transition-all"
              >
                <Github size={18} className="mr-2" />
                Source Code
              </a>
            )}
          </div>
        </div>

        <div className="mb-12 rounded-3xl overflow-hidden border border-[#191528]">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-52 sm:h-96 object-cover object-top"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-10">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-5 flex items-center">
                <Code className="mr-3 text-[#7873F5]" size={24} />
                Project Overview
              </h2>
              <div className="bg-[#0E0C17] rounded-3xl p-6 border border-[#191528]">
                <p className="text-[#8E8E93] text-lg leading-relaxed">{project.fullDescription}</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-5 flex items-center">
                <Zap className="mr-3 text-[#EC77AB]" size={24} />
                Challenges & Solutions
              </h2>
              <div className="bg-[#0E0C17] rounded-3xl p-6 border border-[#191528]">
                <ul className="space-y-4">
                  {project.challenges.map((challenge, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-[#EC77AB] rounded-full mt-3 mr-4 flex-shrink-0" />
                      <p className="text-[#8E8E93]">{challenge}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-5 flex items-center">
                <Target className="mr-3 text-[#7873F5]" size={24} />
                Future Improvements
              </h2>
              <div className="bg-[#0E0C17] rounded-3xl p-6 border border-[#191528]">
                <ul className="space-y-4">
                  {project.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-[#7873F5] rounded-full mt-3 mr-4 flex-shrink-0" />
                      <p className="text-[#8E8E93]">{improvement}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <div className="bg-[#0E0C17] rounded-3xl p-6 border border-[#191528]">
              <h3 className="text-xl font-semibold text-white mb-4">Technologies Used</h3>
              <div className="flex flex-wrap gap-2">
                {project.tech.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1.5 rounded-xl bg-[#110E1B] border border-[#191528] text-sm text-[#8E8E93]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-[#0E0C17] rounded-3xl p-6 border border-[#191528]">
              <h3 className="text-xl font-semibold text-white mb-4">Project Info</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="text-[#7873F5] mr-3" size={18} />
                  <div>
                    <p className="text-[#8E8E93] text-sm">Development Time</p>
                    <p className="text-white">{project.duration || '3 months'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Code className="text-[#EC77AB] mr-3" size={18} />
                  <div>
                    <p className="text-[#8E8E93] text-sm">Project Type</p>
                    <p className="text-white">{project.type || 'Full Stack Web App'}</p>
                  </div>
                </div>
                {project.featured && (
                  <div className="bg-gradient-to-r from-[#7873F5]/15 to-[#EC77AB]/15 p-3 rounded-xl border border-[#191528]">
                    <p className="grad-text font-semibold text-sm">Featured Project</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#0E0C17] rounded-3xl p-6 border border-[#191528]">
              <h3 className="text-xl font-semibold text-white mb-4">Quick Links</h3>
              <div className="space-y-3">
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center w-full p-3 min-h-[48px] bg-[#110E1B] hover:border-[#7873F5]/40 border border-[#191528] rounded-xl transition-colors"
                >
                  <ExternalLink className="text-[#7873F5] mr-3" size={18} />
                  <span className="text-[#8E8E93]">View Live Site</span>
                </a>
                {githubUrl && (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center w-full p-3 min-h-[48px] bg-[#110E1B] hover:border-[#7873F5]/40 border border-[#191528] rounded-xl transition-colors"
                  >
                    <Github className="text-[#8E8E93] mr-3" size={18} />
                    <span className="text-[#8E8E93]">Source Code</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
