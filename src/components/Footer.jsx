import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';

function greetingForHour(hour) {
  if (hour < 5) return 'Good Night';
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  if (hour < 21) return 'Good Evening';
  return 'Good Night';
}

const Footer = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const h12 = hours % 12 || 12;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hh = String(h12).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const greeting = greetingForHour(hours);
  const minuteDeg = minutes * 6;
  const hourDeg = (hours % 12) * 30 + minutes * 0.5;

  return (
    <footer className="w-full border-t border-[#191528] bg-[#0E0C17] pb-[max(6.5rem,calc(env(safe-area-inset-bottom)+5.5rem))] md:pb-0">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:items-start items-center text-center md:text-left gap-1">
            <h3 className="text-lg font-bold text-white">{greeting}</h3>
            <a
              href="#contact"
              className="text-[#8E8E93] hover:text-white flex items-center gap-2 group transition-colors text-sm"
            >
              Reach out
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="flex items-center gap-4 bg-[#151516] border border-[#191528] px-4 py-2 rounded-full shadow-sm hover:border-[#2C2C2E] transition-colors">
            <div className="relative w-8 h-8 rounded-full bg-[#1C1C1E] border border-[#2C2C2E]">
              <div
                className="absolute top-1/2 left-1/2 w-0.5 h-2 bg-[#7873F5] rounded-full origin-bottom"
                style={{ transform: `translate(-50%, -100%) rotate(${hourDeg}deg)` }}
              />
              <div
                className="absolute top-1/2 left-1/2 w-0.5 h-3 bg-[#EC77AB] rounded-full origin-bottom"
                style={{ transform: `translate(-50%, -100%) rotate(${minuteDeg}deg)` }}
              />
              <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="flex items-center text-sm font-medium text-[#8E8E93] h-5">
              <span>{hh}</span>
              <span className="animate-pulse mx-0.5">:</span>
              <span>{mm}</span>
              <span className="ml-1.5 w-6 text-center text-[10px] font-bold uppercase tracking-wider grad-text">
                {ampm}
              </span>
            </div>
          </div>

          <div className="text-[#8E8E93] text-xs text-center md:text-right">
            © {now.getFullYear()} Anik Roy. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
