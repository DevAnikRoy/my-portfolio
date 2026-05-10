import React, { useRef, useEffect, useState } from "react";

import {
  SiReact,
  SiNodedotjs,
  SiMongodb,
  SiTypescript,
  SiTailwindcss,
  SiNextdotjs,
  SiExpress,
  SiGit,
  SiFigma,
  SiDocker,
  SiFirebase,
  SiWebflow
} from "react-icons/si";

const skillCategories = [
  {
    title: "Frontend",
    color: "#00d4ff",
    skills: [
      { name: "React", level: 95 },
      { name: "TypeScript", level: 70 },
      { name: "Next.js", level: 70 },
      { name: "Tailwind CSS", level: 95 }
    ]
  },
  {
    title: "Backend",
    color: "#7c3aed",
    skills: [
      { name: "Node.js", level: 90 },
      { name: "Express.js", level: 90 },
      { name: "PostgreSQL", level: 50 },
      { name: "MongoDB", level: 80 }
    ]
  },
  {
    title: "Tools & Others",
    color: "#00d4ff",
    skills: [
      { name: "Git", level: 92 },
      { name: "Docker", level: 78 },
      { name: "Figma", level: 85 },
      { name: "Webflow", level: 90 }
    ]
  }
];

const techIcons = [
  { icon: SiReact, color: "#61DAFB" },
  { icon: SiNodedotjs, color: "#68A063" },
  { icon: SiMongodb, color: "#47A248" },
  { icon: SiTypescript, color: "#3178C6" },
  { icon: SiTailwindcss, color: "#06B6D4" },
  { icon: SiNextdotjs, color: "#ffffff" },
  { icon: SiExpress, color: "#ffffff" },
  { icon: SiGit, color: "#F05032" },
  { icon: SiFigma, color: "#F24E1E" },
  { icon: SiDocker, color: "#2496ED" },
  { icon: SiFirebase, color: "#FFCA28" },
  { icon: SiWebflow, color: "#4353FF" }
];

function SkillBar({ skill, color, animate }) {
  return (
    <div className="mb-5">
      <div className="flex justify-between mb-2">
        <span
          className="text-sm"
          style={{
            color: "var(--clr-text)",
            fontWeight: 500
          }}
        >
          {skill.name}
        </span>

        <span
          className="text-xs"
          style={{
            color,
            fontWeight: 700
          }}
        >
          {skill.level}%
        </span>
      </div>

      <div
        className="w-full h-[5px] rounded-full"
        style={{
          background: "rgba(255,255,255,0.06)"
        }}
      >
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: animate ? `${skill.level}%` : "0%",
            background: `linear-gradient(90deg, ${color}, ${color}99)`,
            boxShadow: animate
              ? `0 0 12px ${color}50`
              : "none"
          }}
        />
      </div>
    </div>
  );
}

export default function Skills() {
  const sectionRef = useRef(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimate(true);
        }
      },
      {
        threshold: 0.2
      }
    );

    if (sectionRef.current) {
      obs.observe(sectionRef.current);
    }

    return () => obs.disconnect();
  }, []);

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="py-24 lg:py-32 relative overflow-hidden"
      style={{
        background: "var(--clr-bg)"
      }}
    >
      {/* Top Accent */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24"
        style={{
          background:
            "linear-gradient(to bottom,var(--clr-accent),transparent)"
        }}
      />

      <div className="max-w-7xl mx-auto px-5">

        {/* Header */}
        <div className="text-center mb-20">
          <span className="section-label">
            Capabilities
          </span>

          <h2
            className="mt-4 font-bold text-white"
            style={{
              fontSize: "clamp(2.2rem,5vw,4rem)",
              lineHeight: 1,
              letterSpacing: "-0.04em"
            }}
          >
            Skills &{" "}
            <span className="gradient-text">
              Technologies
            </span>
          </h2>

          <p
            className="mt-5 max-w-xl mx-auto"
            style={{
              color: "var(--clr-muted)"
            }}
          >
            Tools, frameworks, and systems I use
            to craft high-performance products.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {skillCategories.map((cat, i) => (
            <div
              key={i}
              className="p-7 rounded-3xl transition-all duration-300 hover:-translate-y-1"
              style={{
                background: "var(--clr-surface)",
                border: "1px solid var(--clr-border)"
              }}
            >

              {/* Title */}
              <div className="flex items-center gap-4 mb-8">

                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: `${cat.color}15`,
                    border: `1px solid ${cat.color}25`,
                    color: cat.color,
                    fontWeight: 700
                  }}
                >
                  {i === 0
                    ? "FE"
                    : i === 1
                    ? "BE"
                    : "DX"}
                </div>

                <h3
                  className="text-white font-bold"
                  style={{
                    fontSize: "1.1rem"
                  }}
                >
                  {cat.title}
                </h3>

              </div>

              {/* Skills */}
              {cat.skills.map((skill, index) => (
                <SkillBar
                  key={index}
                  skill={skill}
                  color={cat.color}
                  animate={animate}
                />
              ))}

            </div>
          ))}

        </div>

        {/* Logo Slider */}
        <div className="mt-24">

          <p className="section-label text-center mb-8">
            Tools I Work With
          </p>

          <div className="overflow-hidden">

            <div className="tech-slider flex gap-6 min-w-max">

              {[...techIcons, ...techIcons].map(
                ({ icon: Icon, color }, i) => (
                  <div
                    key={i}
                    className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-110"
                    style={{
                      background:
                        "var(--clr-surface)",
                      border:
                        "1px solid var(--clr-border)"
                    }}
                  >
                    <Icon
                      size={32}
                      color={color}
                    />
                  </div>
                )
              )}

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}