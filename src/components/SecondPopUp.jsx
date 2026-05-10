import React, { useEffect } from 'react';
import { CheckCircle, X, Mic } from 'lucide-react';
import gsap from 'gsap';

const SecondPopUp = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      gsap.fromTo('.second-popup-content',
        { opacity: 0, scale: 0.8, y: 40 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(1.7)' }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center px-4"
      style={{ background: 'rgba(2,4,8,0.9)', backdropFilter: 'blur(20px)' }}>
      <div className="second-popup-content relative max-w-sm w-full rounded-3xl p-8 text-center"
        style={{
          background: 'var(--clr-surface)',
          border: '2px solid rgba(34,197,94,0.3)',
          boxShadow: '0 0 60px rgba(34,197,94,0.12)'
        }}>

        <div className="relative mx-auto mb-6 w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full animate-ping"
            style={{ background: 'rgba(34,197,94,0.15)', animationDuration: '2s' }} />
          <div className="absolute inset-0 rounded-full"
            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)' }} />
          <CheckCircle size={40} style={{ color: '#22c55e' }} />
        </div>

        <p className="section-label mb-3" style={{ color: '#22c55e' }}>System Online</p>
        <h2 className="text-2xl font-extrabold text-white mb-3" style={{ fontFamily: 'var(--font-display)' }}>
          Agent Activated
        </h2>
        <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--clr-muted)' }}>
          The voice interface is now live. Navigate the site and view projects using voice commands.
        </p>

        <button onClick={onClose}
          className="w-full py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all duration-300 hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
          <Mic size={15} /> START INTERACTING
        </button>

        <button onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ color: 'var(--clr-muted)', background: 'rgba(255,255,255,0.05)' }}>
          <X size={15} />
        </button>
      </div>
    </div>
  );
};

export default SecondPopUp;