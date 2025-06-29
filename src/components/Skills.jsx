import React from 'react';

const Skills = () => {
  const skillCategories =
    [
      {
        "title": "Frontend",
        "skills": [
          { "name": "React", "level": 95 },
          { "name": "TypeScript", "level": 70 },
          { "name": "Next.js", "level": 70 },
          { "name": "Tailwind CSS", "level": 95 },
        ]
      },
      {
        "title": "Backend",
        "skills": [
          { "name": "Node.js", "level": 90 },
          { "name": "Express.js", "level": 90 },
          { "name": "PostgreSQL", "level": 50 },
          { "name": "MongoDB", "level": 80 }
        ]
      },
      {
        "title": "Tools & Others",
        "skills": [
          { "name": "Git", "level": 92 },
          { "name": "Docker", "level": 78 },
          { "name": "Figma", "level": 85 },
        ]
      }
    ];

  const SkillBar = ({ skill }) => (
    <div className="mb-4">
      <div className="flex justify-between mb-2">
        <span className="text-gray-300 font-medium">{skill.name}</span>
        <span className="text-blue-400 text-sm font-semibold">{skill.level}%</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${skill.level}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <section id="skills" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Skills & Technologies</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto mb-6"></div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Here are the technologies and tools I work with to bring ideas to life
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skillCategories.map((category, index) => (
            <div key={index} className="bg-slate-800/50 p-8 rounded-lg hover:bg-slate-800 transition-colors duration-300 border border-slate-700">
              <h3 className="text-2xl font-semibold text-white mb-6 text-center">
                {category.title}
              </h3>
              <div>
                {category.skills.map((skill, skillIndex) => (
                  <SkillBar key={skillIndex} skill={skill} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;