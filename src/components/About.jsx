import React, { useEffect, useRef, useState } from 'react';
import { Code, Coffee, Mountain, Camera, Play } from 'lucide-react';
import { useScrollReveal } from './SharedScrolled';
import { pauseNavMic, resumeNavMic } from '../services/voice-agent/micMutex';
import img from '../assets/anik-workspace.png';

const INTERESTS = [
  { Icon: Mountain, label: 'Hiking', desc: 'Finding clarity on nature trails.' },
  { Icon: Camera, label: 'Photography', desc: 'Telling stories through light.' },
  { Icon: Coffee, label: 'Coffee', desc: 'Specialty brews power deep work.' },
  { Icon: Code, label: 'Open Source', desc: 'Building for the community.' },
];

function IntroVideo() {
  const videoRef = useRef(null);
  const [active, setActive] = useState(false);

  const start = async () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    try {
      await video.play();
    } catch {
      try {
        video.muted = true;
        await video.play();
      } catch {
        /* browser blocked playback */
      }
    }
  };

  useEffect(() => {
    const onPlayRequest = () => {
      document.getElementById('about-intro')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      void start();
    };
    window.addEventListener('play-intro-video', onPlayRequest);
    return () => window.removeEventListener('play-intro-video', onPlayRequest);
  }, []);

  useEffect(() => () => resumeNavMic(), []);

  return (
    <div id="about-intro" className="relative w-full">
      <div className="absolute -inset-2 md:-inset-4 bg-gradient-to-tr from-[#7873F5]/30 to-[#EC77AB]/30 rounded-[2rem] -rotate-3 blur-2xl -z-10" />
      <div className="relative rounded-[2rem] overflow-hidden border-2 border-[#191528] bg-[#0E0C17] shadow-2xl">
        <div className="relative aspect-[4/3] sm:aspect-[16/10] bg-[#0E0C17]">
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            src="/anik-intro.mp4"
            playsInline
            preload="metadata"
            controls={active}
            onPlay={() => {
              pauseNavMic();
              setActive(true);
            }}
            onPause={() => resumeNavMic()}
            onEnded={() => {
              resumeNavMic();
              setActive(false);
              if (videoRef.current) videoRef.current.currentTime = 0;
            }}
          />

          {!active && (
            <button
              type="button"
              onClick={start}
              className="group absolute inset-0 z-10 block w-full text-left"
              aria-label="Play intro video"
            >
              <img
                src={img}
                alt="Anik Roy at his desk"
                className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <span className="pointer-events-none absolute inset-0 bg-[#0E0C17]/35" />
              <span className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#7873F5] to-[#EC77AB] shadow-[0_12px_40px_rgba(120,115,245,0.45)] transition-transform duration-300 group-hover:scale-105">
                  <Play size={22} className="ml-0.5 fill-white text-white" />
                </span>
                <span className="rounded-full border border-white/15 bg-[#0E0C17]/70 px-3 py-1 text-xs font-medium tracking-wide text-white backdrop-blur-md">
                  Watch intro
                </span>
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function About() {
  const ref = useRef(null);
  useScrollReveal(ref);

  return (
    <section id="about" ref={ref} className="py-10 md:py-24">
      <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-8 lg:gap-12 items-center">
        <div className="order-1">
          <div className="sr" data-delay="0.1">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
              About me
            </h2>
          </div>
          <div className="sr space-y-4 text-[#8E8E93] leading-relaxed" data-delay="0.15">
            <p>
              I have{' '}
              <span className="text-white font-medium">2 years of experience</span>{' '}
              as a Full-Stack and Webflow developer — turning designs into
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

        <div className="sr order-2">
          <IntroVideo />
        </div>
      </div>
    </section>
  );
}
