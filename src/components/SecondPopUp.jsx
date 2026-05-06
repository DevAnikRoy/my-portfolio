import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';
import gsap from 'gsap';

const SecondPopUp = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      // Lock scroll when the second popup opens
      document.body.style.overflow = 'hidden';
      
      gsap.fromTo(".second-popup-content", 
        { opacity: 0, scale: 0.8, y: 40 }, 
        { 
          opacity: 1, 
          scale: 1, 
          y: 0, 
          duration: 0.6, 
          ease: "back.out(1.7)" 
        }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
      <div className="second-popup-content relative max-w-sm w-full mx-4 bg-slate-900 border-2 border-green-500/30 p-8 rounded-3xl text-center shadow-[0_0_50px_rgba(34,197,94,0.15)]">
        <div className="mx-auto w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={44} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Agent Activated</h2>
        <p className="text-slate-300 mb-8 text-sm leading-relaxed">
          The voice interface is now live. You can navigate the site and view projects using voice commands.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-all duration-300"
        >
          START INTERACTING
        </button>
      </div>
    </div>
  );
};

export default SecondPopUp;