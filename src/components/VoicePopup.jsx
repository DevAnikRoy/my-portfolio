import React, { useState, useEffect } from 'react';
import { Mic, X, Zap } from 'lucide-react';
import gsap from 'gsap';

const VoicePopup = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
      gsap.fromTo('.voice-modal',
        { opacity: 0, scale: 0.85, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: 'back.out(1.7)' }
      );
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    gsap.to('.voice-modal-overlay', {
      opacity: 0, duration: 0.4,
      onComplete: () => {
        setIsVisible(false);
        document.body.style.overflow = 'auto';
        if (onFinish) onFinish();
      }
    });
  };

  if (!isVisible) return null;

  return (
    <div className="voice-modal-overlay fixed inset-0 z-[9999] flex items-center justify-center px-4"
      style={{ background: 'rgba(2,4,8,0.9)', backdropFilter: 'blur(20px)' }}>
      <div className="voice-modal relative w-full max-w-md rounded-3xl p-8 text-center"
        style={{ background: 'var(--clr-surface)', border: '1px solid rgba(0,212,255,0.2)', boxShadow: '0 0 80px rgba(0,212,255,0.1)' }}>

        {/* Animated mic icon */}
        <div className="relative mx-auto mb-7 w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full animate-ping"
            style={{ background: 'rgba(0,212,255,0.15)', animationDuration: '2s' }} />
          <div className="absolute inset-0 rounded-full"
            style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.3)' }} />
          <Mic size={36} style={{ color: 'var(--clr-accent)' }} />
        </div>

        <p className="section-label mb-3">Voice Interface</p>
        <h2 className="text-2xl font-extrabold text-white mb-4" style={{ fontFamily: 'var(--font-display)' }}>
          Voice-Activated Portfolio
        </h2>

        <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--clr-muted)' }}>
          This portfolio responds to voice commands. Navigate sections, view projects, and interact hands-free. Allow microphone access to enable the full experience.
        </p>

        {/* Command hint */}
        <div className="p-4 rounded-2xl mb-7"
          style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)' }}>
          <p className="text-xs mb-2" style={{ color: 'var(--clr-muted)', fontFamily: 'var(--font-mono)' }}>
            To activate, say:
          </p>
          <p className="text-xl font-bold" style={{ color: 'var(--clr-accent)', fontFamily: 'var(--font-mono)' }}>
            "Hey Agent"
          </p>
        </div>

        <button onClick={handleClose}
          className="w-full py-4 rounded-2xl font-bold text-black text-sm flex items-center justify-center gap-2 transition-all duration-300 hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, var(--clr-accent), var(--clr-accent2))', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
          <Zap size={16} /> Got it, let's go!
        </button>

        <button onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:text-white"
          style={{ color: 'var(--clr-muted)', background: 'rgba(255,255,255,0.05)' }}>
          <X size={15} />
        </button>
      </div>
    </div>
  );
};

export default VoicePopup;