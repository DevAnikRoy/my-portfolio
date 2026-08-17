import React, { useRef, useEffect } from 'react';
import { GraduationCap, Calendar, MapPin, Award } from 'lucide-react';

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
      'Mentored junior developers',
    ],
  },
  {
    degree: 'Bachelor of Science, Botany',
    institution: 'University of Dhaka',
    location: 'Dhaka, Bangladesh',
    period: '2018 – 2022',
    highlights: [],
  },
];

const Education = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('visible');
        }),
      { threshold: 0.1 }
    );
    sectionRef.current?.querySelectorAll('.reveal-up').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section id="education" ref={sectionRef} className="py-10 md:py-24">
      <div className="reveal-up mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
          Education
        </h2>
        <p className="mt-3 text-[#8E8E93] max-w-xl">
          The academic journey that built my foundation
        </p>
      </div>

      <div className="space-y-6">
        {educationData.map((edu, i) => (
          <div key={i} className="reveal-up" style={{ transitionDelay: `${i * 0.12}s` }}>
            <div className="p-6 lg:p-8 rounded-3xl bg-[#0E0C17] border border-[#191528] hover:border-[#7873F5]/30 transition-all group">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#110E1B] border border-[#191528] group-hover:border-[#7873F5]/50 transition-colors">
                    <GraduationCap size={22} className="text-[#7873F5]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{edu.degree}</h3>
                    <p className="text-sm mt-1 text-[#8E8E93]">{edu.institution}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 lg:text-right flex-shrink-0">
                  <div className="flex items-center gap-2 text-xs lg:justify-end text-[#8E8E93]">
                    <Calendar size={12} /> {edu.period}
                  </div>
                  <div className="flex items-center gap-2 text-xs lg:justify-end text-[#8E8E93]">
                    <MapPin size={12} /> {edu.location}
                  </div>
                  {edu.gpa && (
                    <div className="flex items-center gap-2 text-xs lg:justify-end text-[#EC77AB]">
                      <Award size={12} /> {edu.gpa}
                    </div>
                  )}
                </div>
              </div>
              {edu.highlights.length > 0 && (
                <div className="mt-5 pt-5 flex flex-wrap gap-2 border-t border-[#191528]">
                  {edu.highlights.map((h) => (
                    <span
                      key={h}
                      className="px-3 py-1.5 rounded-xl bg-[#110E1B] border border-[#191528] text-xs text-[#8E8E93]"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Education;
