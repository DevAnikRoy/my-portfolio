import React, { useState, useEffect, useRef } from 'react';
import { X, Mic } from 'lucide-react';
import gsap from 'gsap';

const VoicePopup = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showMic, setShowMic] = useState(false);
  const hasSpokenRef = useRef(false);
  const closingRef = useRef(false);

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
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
    );

    speakGreeting();

    const tl = gsap.timeline({
      onComplete: () => setShowMic(true),
    });

    [3, 2, 1].forEach((num) => {
      tl.set('.count-text', { innerText: num })
        .fromTo('.count-text', { scale: 1.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35 })
        .to('.count-text', { opacity: 0, scale: 0.85, duration: 0.25, delay: 0.25 });
    });

    tl.fromTo('.instruction-box', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4 });
  }, []);

  const handleClose = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    window.speechSynthesis.cancel();
    gsap.to('.voice-modal-overlay', {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        setIsVisible(false);
        if (onFinish) onFinish();
      },
    });
  };

  if (!isVisible) return null;

  return (
    <div
      className="voice-modal-overlay fixed inset-0 z-[10050] flex items-center justify-center bg-[#110E1B]/90 backdrop-blur-xl p-4 overflow-y-auto"
      onClick={handleClose}
    >
      <div
        className="voice-modal relative w-full max-w-md my-auto bg-[#0E0C17] border border-[#191528] p-6 sm:p-10 rounded-[1.75rem] sm:rounded-[2.5rem] text-center shadow-2xl max-h-[min(90dvh,640px)] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          aria-label="Close voice intro"
          className="absolute top-3 right-3 sm:top-5 sm:right-5 z-10 p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="h-16 sm:h-20 flex items-center justify-center mb-4 sm:mb-6 mt-6">
          {!showMic ? (
            <span className="count-text text-5xl font-bold grad-text" />
          ) : (
            <Mic size={40} className="text-[#7873F5] animate-pulse" />
          )}
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 px-8">
          Neural Navigation <span className="grad-text">Active</span>
        </h2>

        <p className="text-[#8E8E93] mb-6 text-sm leading-relaxed max-w-xs mx-auto">
          Why scroll when you can speak? Close this and say...
        </p>

        <div className="instruction-box bg-[#7873F5]/5 border border-[#7873F5]/20 rounded-2xl p-5 sm:p-6 mb-5">
          <p className="text-2xl font-bold text-white tracking-tight italic">&quot;Hey Agent&quot;</p>
        </div>

        <button
          onClick={handleClose}
          className="w-full min-h-[48px] rounded-2xl font-semibold text-white text-sm bg-gradient-to-r from-[#7873F5] to-[#EC77AB] hover:opacity-90 transition-opacity"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export default VoicePopup;
