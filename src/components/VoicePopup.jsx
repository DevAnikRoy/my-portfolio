import React, { useState, useEffect, useRef } from 'react';
import { X, Mic } from 'lucide-react';
import gsap from 'gsap';

const VoicePopup = ({ onFinish }) => {
  const [isLocked, setIsLocked] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const hasSpokenRef = useRef(false);

  const speakGreeting = () => {
    if (hasSpokenRef.current) return;
    window.speechSynthesis.cancel();

    const msg = new SpeechSynthesisUtterance(
      'Systems ready. Access your navigator by saying: Hey Agent.'
    );

    let voices = window.speechSynthesis.getVoices();
    const maleVoice = voices.find(
      (voice) =>
        voice.name.includes('David') ||
        voice.name.includes('Male') ||
        (voice.name.includes('Google') && voice.name.includes('en-US')) ||
        voice.name.includes('James')
    );

    if (maleVoice) msg.voice = maleVoice;
    msg.rate = 0.8;
    msg.pitch = 0.8;
    msg.volume = 1;
    window.speechSynthesis.speak(msg);
    hasSpokenRef.current = true;
  };

  useEffect(() => {
    gsap.fromTo(
      '.voice-modal',
      { opacity: 0, y: 50, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power4.out' }
    );

    speakGreeting();

    const tl = gsap.timeline({
      onComplete: () => setIsLocked(false),
    });

    [3, 2, 1].forEach((num) => {
      tl.set('.count-text', { innerText: num })
        .fromTo('.count-text', { scale: 1.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4 })
        .to('.count-text', { opacity: 0, scale: 0.8, duration: 0.3, delay: 0.3 });
    });

    tl.fromTo('.instruction-box', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5 }).fromTo(
      '.close-btn-wrapper',
      { opacity: 0 },
      { opacity: 1, duration: 0.5 },
      '-=0.2'
    );
  }, []);

  const handleClose = () => {
    if (isLocked) return;
    gsap.to('.voice-modal-overlay', {
      opacity: 0,
      scale: 0.95,
      duration: 0.4,
      onComplete: () => {
        setIsVisible(false);
        if (onFinish) onFinish();
      },
    });
  };

  if (!isVisible) return null;

  return (
    <div className="voice-modal-overlay fixed inset-0 z-[10000] flex items-end sm:items-center justify-center bg-[#110E1B]/90 backdrop-blur-xl p-0 sm:p-4">
      <div className="voice-modal relative w-full max-w-md bg-[#0E0C17] border border-[#191528] p-6 sm:p-10 rounded-t-[2rem] sm:rounded-[2.5rem] text-center shadow-2xl pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="close-btn-wrapper absolute top-4 right-4 sm:top-6 sm:right-6">
          <button
            onClick={handleClose}
            className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="h-20 flex items-center justify-center mb-6">
          <span className="count-text text-5xl font-bold grad-text" />
          {!isLocked && <Mic size={40} className="text-[#7873F5] animate-pulse" />}
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
          Neural Navigation <span className="grad-text">Active</span>
        </h2>

        <p className="text-[#8E8E93] mb-6 sm:mb-8 text-sm leading-relaxed max-w-[16rem] mx-auto">
          Why scroll when you can speak? Close the popup and say...
        </p>

        <div className="instruction-box bg-[#7873F5]/5 border border-[#7873F5]/20 rounded-2xl p-6">
          <p className="text-2xl font-bold text-white tracking-tight italic">&quot;Hey Agent&quot;</p>
        </div>
      </div>
    </div>
  );
};

export default VoicePopup;
