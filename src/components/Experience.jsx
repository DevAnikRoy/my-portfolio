import React from 'react';
import { Briefcase, Calendar, MapPin, ChevronRight } from 'lucide-react';

const Experience = () => {
  const experiences = [
    {
      title: 'Junior Web Developer',
      company: 'Softvence',
      location: 'Sheridan, WY, USA',
      period: 'July 2025 - Present',
      type: 'Full-time',
      responsibilities: [
        "Developed and maintained responsive Webflow websites for international clients",
        "Collaborated with designers to translate Figma mockups into interactive UI components",
        "Integrated dynamic data and CMS features within Webflow for scalable content management",
        "Worked with React and Tailwind CSS to create reusable UI components outside Webflow",
        "Optimized website performance, SEO, and accessibility for production-level deployments"
      ],
      technologies: [
        'React',
        'TypeScript',
        'Next.js',
        'Tailwind CSS',
        'Node.js',
        'Express.js',
        'MongoDB',
        'Git',
        'Figma'
      ]

    }
  ];

  return (
    <section id="experience" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Work Experience</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto mb-6"></div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Professional journey and key achievements in my development career
          </p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500 hidden lg:block"></div>

          <div className="space-y-12">
            {experiences.map((exp, index) => (
              <div key={index} className="relative">
                {/* Timeline dot */}
                <div className="absolute left-6 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full hidden lg:block"></div>

                <div className="lg:ml-16">
                  <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                      <div className="flex items-start space-x-4">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-lg">
                          <Briefcase className="text-white" size={24} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-semibold text-white mb-1">{exp.title}</h3>
                          <p className="text-blue-400 text-lg font-medium">{exp.company}</p>
                          <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full mt-2">
                            {exp.type}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 lg:mt-0 lg:text-right">
                        <div className="flex items-center text-gray-400 mb-2">
                          <Calendar size={16} className="mr-2" />
                          <span>{exp.period}</span>
                        </div>
                        <div className="flex items-center text-gray-400">
                          <MapPin size={16} className="mr-2" />
                          <span>{exp.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-700 pt-6">
                      <h4 className="text-white font-semibold mb-4">Key Responsibilities:</h4>
                      <ul className="space-y-3 mb-6">
                        {exp.responsibilities.map((resp, idx) => (
                          <li key={idx} className="flex items-start text-gray-300">
                            <ChevronRight size={16} className="text-blue-400 mr-2 mt-1 flex-shrink-0" />
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>

                      <div>
                        <h4 className="text-white font-semibold mb-3">Technologies Used:</h4>
                        <div className="flex flex-wrap gap-2">
                          {exp.technologies.map((tech, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-slate-700 text-gray-300 rounded-full text-sm hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white transition-all duration-200"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;