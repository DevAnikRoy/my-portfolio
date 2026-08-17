import React, { useRef } from 'react';
import { Code, Coffee, Mountain, Camera } from 'lucide-react';
import { useScrollReveal } from './SharedScrolled';
import img from '../assets/anik-front-of-monitor.jpg';

const INTERESTS = [
  { Icon: Mountain, label: 'Hiking', desc: 'Finding clarity on nature trails.' },
  { Icon: Camera, label: 'Photography', desc: 'Telling stories through light.' },
  { Icon: Coffee, label: 'Coffee', desc: 'Specialty brews power deep work.' },
  { Icon: Code, label: 'Open Source', desc: 'Building for the community.' },
];

export default function About() {
  const ref = useRef(null);
  useScrollReveal(ref);

  return (
    <section id="about" ref={ref} className="py-10 md:py-24">
      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12 items-start">
        <div className="sr order-2 lg:order-1">
          <div className="relative w-full max-w-md mx-auto lg:mx-0">
            <div className="absolute -inset-2 md:-inset-4 bg-gradient-to-tr from-[#7873F5]/30 to-[#EC77AB]/30 rounded-[2rem] rotate-6 blur-2xl -z-10" />
            <div className="relative rounded-[2rem] overflow-hidden border-2 border-[#191528] bg-[#0E0C17] shadow-2xl group">
              <img
                src={img}
                alt="Anik Roy"
                className="w-full h-full object-cover aspect-[4/5] transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <div className="sr" data-delay="0.1">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
              About me
            </h2>
          </div>
          <div className="sr space-y-4 text-[#8E8E93] leading-relaxed" data-delay="0.15">
            <p>
              I have{' '}
              <span className="text-white font-medium">2 years of experience</span>{' '}
              as a frontend developer and Webflow developer — turning designs into
              fast, production-ready websites and apps.
            </p>
            <p>
              Day to day I ship in{' '}
              <span className="text-white">React, Tailwind,</span> and{' '}
              <span className="text-white">Webflow CMS</span>, with Node.js when a
              project needs a custom backend. The common thread is clean UI,
              performance, and sites that are easy for clients to run after launch.
            </p>
            <p>
              The work that excites me most: challenging problems, performance
              optimization, and products with{' '}
              <span className="text-white font-medium">genuine impact</span>.
            </p>
          </div>

          <div className="sr grid grid-cols-2 gap-3 mt-8" data-delay="0.25">
            {INTERESTS.map(({ Icon, label, desc }) => (
              <div
                key={label}
                className="p-4 rounded-2xl bg-[#0E0C17] border border-[#191528] hover:border-[#7873F5]/30 transition-all"
              >
                <Icon size={18} className="mb-2.5 text-[#7873F5]" />
                <p className="font-semibold text-white text-sm">{label}</p>
                <p className="text-xs mt-1 text-[#8E8E93]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
