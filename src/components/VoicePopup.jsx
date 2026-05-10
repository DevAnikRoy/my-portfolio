import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, Info } from 'lucide-react';
import gsap from 'gsap';

const VoicePopup = ({ onFinish }) => {
  const [isLocked, setIsLocked] = useState(true);
  const hasSpokenRef = useRef(false);

  const speakGreeting = () => {
    if (hasSpokenRef.current) return;
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(
      "Welcome. This site is voice-enhanced. To begin, simply say, Hey Agent."
    );
    msg.rate = 0.95;
    window.speechSynthesis.speak(msg);
    hasSpokenRef.current = true;
  };

  useEffect(() => {
    // Entrance Animation
    gsap.fromTo(".voice-modal", 
      { opacity: 0, y: 50, scale: 0.9 }, 
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power4.out" }
    );

    speakGreeting();

    // The 3-2-1 Animation Timeline
    const tl = gsap.timeline({
      onComplete: () => setIsLocked(false)
    });

    // Countdown sequence
    [3, 2, 1].forEach((num) => {
      tl.set(".count-text", { innerText: num })
        .fromTo(".count-text", { scale: 1.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4 })
        .to(".count-text", { opacity: 0, scale: 0.8, duration: 0.3, delay: 0.3 });
    });

    // Fade in the command and the close button
    tl.fromTo(".instruction-box", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5 })
      .fromTo(".close-btn-wrapper", { opacity: 0 }, { opacity: 1, duration: 0.5 }, "-=0.2");

  }, []);

  const handleClose = () => {
    if (isLocked) return;
    gsap.to(".voice-modal-overlay", {
      opacity: 0,
      scale: 0.95,
      duration: 0.4,
      onComplete: () => {
        if (onFinish) onFinish();
      }
    });
  };

  return (
    <div className="voice-modal-overlay fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4">
      <div className="voice-modal relative max-w-md w-full bg-slate-900 border border-white/10 p-10 rounded-[2.5rem] text-center shadow-2xl">
        
        {/* Hidden/Locked Close Button at top right */}
        <div className="close-btn-wrapper absolute top-6 right-6">
          <button 
            onClick={handleClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Animation Area */}
        <div className="h-20 flex items-center justify-center mb-6">
          <span className="count-text text-5xl font-bold text-blue-500"></span>
          {!isLocked && <Mic size={40} className="text-blue-500 animate-pulse" />}
        </div>

        <h2 className="text-2xl font-bold text-white mb-3">
          Neural Navigation <span className="text-blue-500">Active</span>
        </h2>
        
        <p className="text-slate-400 mb-8 text-sm leading-relaxed">
          Experience a new way of browsing. Use natural voice commands to navigate through my projects and skills.
        </p>

        {/* Instruction Box */}
        <div className="instruction-box bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6">
          <p className="text-xs text-blue-400 font-mono uppercase tracking-widest mb-2">Voice Trigger</p>
          <p className="text-2xl font-bold text-white tracking-tight italic">
            "Hey Agent"
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-500 uppercase">
            <Info size={12} />
            <span>Say this to start navigating</span>
          </div>
        </div>

        {!isLocked && (
          <p className="mt-6 text-[10px] text-slate-600 animate-bounce">
            Click the "X" to explore manually
          </p>
        )}
      </div>
    </div>
  );
};

export default VoicePopup;