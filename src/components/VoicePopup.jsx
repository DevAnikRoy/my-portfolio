import React, { useEffect, useRef, useState } from "react";
import { X, Mic } from "lucide-react";
import gsap from "gsap";

const VoicePopup = ({ onFinish }) => {
  const [showMic, setShowMic] = useState(false);
  const closingRef = useRef(false);
  const overlayRef = useRef(null);
  const modalRef = useRef(null);
  const countRef = useRef(null);

  useEffect(() => {
    const modal = modalRef.current;
    const count = countRef.current;
    if (!modal) return undefined;

    const intro = gsap.fromTo(
      modal,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }
    );

    const tl = gsap.timeline({
      onComplete: () => setShowMic(true),
    });

    if (count) {
      [3, 2, 1].forEach((num) => {
        tl.set(count, { innerText: String(num) })
          .fromTo(count, { scale: 1.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35 })
          .to(count, { opacity: 0, scale: 0.85, duration: 0.25, delay: 0.25 });
      });
    }

    return () => {
      intro.kill();
      tl.kill();
    };
  }, []);

  const handleClose = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    onFinish?.();

    const overlay = overlayRef.current;
    if (!overlay) return;
    gsap.to(overlay, { opacity: 0, duration: 0.25, ease: "power2.out" });
  };

  return (
    <div
      ref={overlayRef}
      className="voice-modal-overlay fixed inset-0 z-[10050] flex items-center justify-center bg-[#110E1B]/90 backdrop-blur-xl p-4 overflow-y-auto"
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        className="voice-modal relative w-full max-w-md my-auto bg-[#0E0C17] border border-[#191528] p-6 sm:p-10 rounded-[1.75rem] sm:rounded-[2.5rem] text-center shadow-2xl max-h-[min(90dvh,640px)] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close voice intro"
          className="absolute top-3 right-3 sm:top-5 sm:right-5 z-10 p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
        >
          <X size={20} />
        </button>

        <div className="h-16 sm:h-20 flex items-center justify-center mb-4 sm:mb-6 mt-6">
          {!showMic ? (
            <span ref={countRef} className="count-text text-5xl font-bold grad-text" />
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
          type="button"
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
