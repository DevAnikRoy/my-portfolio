import React from 'react';
import { GraduationCap, Calendar, MapPin } from 'lucide-react';

const Education = () => {
  const educationData = [
    
    {
      degree: 'Full Stack Web Development Bootcamp',
      institution: 'Programming Hero',
      location: 'Online',
      period: '2025',
      gpa: 'Certificate of Excellence',
      highlights: [
        'Intensive 6-month program',
        'Focus on MERN stack development',
        'Capstone project: E-commerce platform',
        'Mentored junior developers'
      ]
    },
    {
      degree: 'Bachelor of Science Botany',
      institution: 'University of Dhaka',
      location: 'Dhaka, Bangladesh',
      period: '2018 - 2022',
      highlights: [
      ]
    },
  ];

  return (
    <section id="education" className="py-20 bg-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Education</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto mb-6"></div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            My educational journey that laid the foundation for my technical expertise
          </p>
        </div>

        <div className="space-y-8">
          {educationData.map((edu, index) => (
            <div key={index} className="bg-slate-800 rounded-lg p-8 border border-slate-700 hover:border-blue-500/50 transition-colors duration-300">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-lg">
                    <GraduationCap className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-white mb-2">{edu.degree}</h3>
                    <p className="text-blue-400 text-lg font-medium">{edu.institution}</p>
                  </div>
                </div>
                
                <div className="mt-4 lg:mt-0 lg:text-right">
                  <div className="flex items-center text-gray-400 mb-2">
                    <Calendar size={16} className="mr-2" />
                    <span>{edu.period}</span>
                  </div>
                  <div className="flex items-center text-gray-400 mb-2">
                    <MapPin size={16} className="mr-2" />
                    <span>{edu.location}</span>
                  </div>
                  <div className="text-green-400 font-semibold">
                    {edu.gpa}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-6">
                <h4 className="text-white font-semibold mb-4">Key Highlights:</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {edu.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-center text-gray-300">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Certifications */}
        <div className="mt-16">
          <h3 className="text-2xl font-semibold text-white mb-8 text-center">Certifications</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              'AWS Certified Developer Associate',
              'Google Cloud Platform Professional',
              'MongoDB Certified Developer',
              'React Developer Certification',
              'Node.js Application Developer',
              'Agile Development Practitioner'
            ].map((cert, index) => (
              <div key={index} className="bg-slate-700/50 p-4 rounded-lg text-center hover:bg-slate-700 transition-colors duration-200">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <GraduationCap className="text-white" size={20} />
                </div>
                <p className="text-gray-300 font-medium">{cert}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Education;