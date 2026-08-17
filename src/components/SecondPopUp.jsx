import React, { useEffect } from 'react';
import { CheckCircle, X, Mic } from 'lucide-react';
import gsap from 'gsap';

const SecondPopUp = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      gsap.fromTo(
        '.second-popup-content',
        { opacity: 0, scale: 0.8, y: 40 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(1.7)' }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[10050] flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(17,14,27,0.92)', backdropFilter: 'blur(20px)' }}
    >
      <div className="second-popup-content relative max-w-sm w-full my-auto rounded-3xl p-6 sm:p-8 text-center bg-[#0E0C17] border border-[#7873F5]/30 shadow-[0_0_60px_rgba(120,115,245,0.12)]">
        <div className="relative mx-auto mb-6 w-20 h-20 flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{ background: 'rgba(120,115,245,0.15)', animationDuration: '2s' }}
          />
          <div className="absolute inset-0 rounded-full bg-[#7873F5]/10 border border-[#7873F5]/30" />
          <CheckCircle size={40} className="text-[#7873F5]" />
        </div>

        <p className="text-xs font-bold uppercase tracking-widest mb-3 text-[#EC77AB]">
          System Online
        </p>
        <h2 className="text-2xl font-extrabold text-white mb-3">Agent Activated</h2>
        <p className="text-sm leading-relaxed mb-8 text-[#8E8E93]">
          The voice interface is now live. Navigate the site and view projects using voice
          commands.
        </p>

        <button
          onClick={onClose}
          className="w-full py-4 min-h-[48px] rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all duration-300 hover:opacity-90 bg-gradient-to-r from-[#7873F5] to-[#EC77AB]"
        >
          <Mic size={15} /> START INTERACTING
        </button>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-11 h-11 rounded-full flex items-center justify-center text-[#8E8E93] bg-white/5 hover:text-white"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
};

export default SecondPopUp;
