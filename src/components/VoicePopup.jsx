import React, { useState, useEffect } from 'react';
import { Mic, X } from 'lucide-react';
import gsap from 'gsap';

const VoicePopup = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show popup after a short delay once site finishes loading
    const timer = setTimeout(() => {
      setIsVisible(true);
      // Lock scroll
      document.body.style.overflow = 'hidden';
      
      // GSAP Entrance Animation
      gsap.fromTo(".voice-modal", 
        { opacity: 0, scale: 0.9, y: 20 }, 
        { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    gsap.to(".voice-modal-overlay", {
      opacity: 0,
      duration: 0.5,
      onComplete: () => {
        setIsVisible(false);
        document.body.style.overflow = 'auto'; // Unlock scroll
        if (onFinish) onFinish(); // Start microphone listener in App.jsx
      }
    });
  };

  if (!isVisible) return null;

  return (
    <div id='voicePopUp' className="voice-modal-overlay fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
      <div className="voice-modal relative max-w-md w-full mx-4 bg-slate-900 border border-slate-700 p-8 rounded-2xl shadow-2xl text-center">
        
        {/* Decorative Mic Icon */}
        <div className="mx-auto w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <Mic size={40} className="text-blue-400" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-4">Voice Activated Portfolio</h2>
        
        <p className="text-slate-300 mb-6 leading-relaxed">
          This site is voice-activated. You can navigate and interact using voice commands. 
          Please allow microphone access to enable the full experience.
        </p>

        <div className="bg-slate-800 rounded-lg p-4 mb-8 border border-slate-700">
          <p className="text-sm text-slate-400">To start, simply say:</p>
          <p className="text-xl font-mono text-blue-400 mt-2">"Hey Agent"</p>
        </div>

        <button
          onClick={handleClose}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25"
        >
          Got it, let's go!
        </button>

        {/* Small close button for UX */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default VoicePopup;
