import React, { useEffect } from "react";
import { Mic, MicOff, PhoneOff, Phone } from "lucide-react";
import useVoiceAgent from "../hooks/useVoiceAgent";

const STATUS_COPY = {
  idle: "Tap and hold to speak",
  listening: "Listening… release when done",
  thinking: "Thinking…",
  speaking: "Speaking…",
  error: "Something went wrong",
};

export default function VoiceCallModal({ isOpen, onClose }) {
  const {
    status,
    muted,
    error,
    userCaption,
    agentCaption,
    startListening,
    stopListeningAndProcess,
    hangUp,
    toggleMute,
  } = useVoiceAgent({ active: isOpen });

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleHangUp = () => {
    hangUp();
    onClose();
  };

  const canRecord = !muted && (status === "idle" || status === "error");
  const isListening = status === "listening";
  const isBusy = status === "thinking" || status === "speaking";

  return (
    <div className="fixed inset-0 z-[10060] flex items-end sm:items-center justify-center bg-[#110E1B]/92 backdrop-blur-xl p-0 sm:p-4">
      <div className="relative w-full sm:max-w-md bg-[#0E0C17] border border-[#191528] rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="px-6 pt-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[#7873F5]/30 to-[#EC77AB]/30 border border-[#191528] flex items-center justify-center">
              <Phone size={18} className="text-[#7873F5]" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#EC77AB] animate-pulse" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">Call AI Agent</p>
              <p className="text-[#8E8E93] text-xs truncate">
                {muted ? "Muted" : STATUS_COPY[status] || STATUS_COPY.idle}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 flex flex-col items-center text-center">
          <div
            className={`flex items-end justify-center gap-1.5 h-16 mb-6 ${
              isListening || status === "speaking" ? "opacity-100" : "opacity-40"
            }`}
            aria-hidden
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="w-1.5 rounded-full bg-gradient-to-t from-[#7873F5] to-[#EC77AB] voice-wave-bar"
                style={{
                  animationDelay: `${i * 0.12}s`,
                  height: isListening || status === "speaking" ? undefined : "12px",
                  animationPlayState:
                    isListening || status === "speaking" ? "running" : "paused",
                }}
              />
            ))}
          </div>

          <div className="w-full min-h-[7.5rem] space-y-3 mb-6">
            {userCaption && (
              <div className="text-left rounded-2xl border border-[#191528] bg-[#110E1B] px-4 py-3">
                <p className="text-[10px] uppercase tracking-widest text-[#48484A] mb-1">You</p>
                <p className="text-sm text-[#8E8E93] leading-relaxed">{userCaption}</p>
              </div>
            )}
            {agentCaption && (
              <div className="text-left rounded-2xl border border-[#7873F5]/25 bg-[#7873F5]/5 px-4 py-3">
                <p className="text-[10px] uppercase tracking-widest text-[#7873F5] mb-1">Agent</p>
                <p className="text-sm text-white leading-relaxed">{agentCaption}</p>
              </div>
            )}
            {error && (
              <p className="text-sm text-red-300/90 leading-relaxed">{error}</p>
            )}
          </div>

          <div className="flex items-center justify-center gap-4 w-full">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "Unmute" : "Mute"}
              className="w-12 h-12 rounded-full bg-[#1C1C1E] border border-[#191528] flex items-center justify-center text-[#8E8E93] hover:text-white transition-colors"
            >
              {muted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            <button
              type="button"
              disabled={muted || isBusy}
              onMouseDown={(e) => {
                e.preventDefault();
                if (canRecord) startListening();
              }}
              onMouseUp={() => {
                if (isListening) stopListeningAndProcess();
              }}
              onMouseLeave={() => {
                if (isListening) stopListeningAndProcess();
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                if (canRecord) startListening();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                if (isListening) stopListeningAndProcess();
              }}
              aria-label="Hold to speak"
              className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all disabled:opacity-40 ${
                isListening
                  ? "scale-110 bg-gradient-to-br from-[#7873F5] to-[#EC77AB] shadow-[0_0_40px_rgba(120,115,245,0.45)]"
                  : "bg-[#1C1C1E] border border-[#191528] hover:border-[#7873F5]/50"
              }`}
            >
              {isListening && (
                <span className="absolute inset-0 rounded-full border-2 border-[#EC77AB]/50 animate-ping" />
              )}
              <Mic size={28} className={isListening ? "text-white" : "text-[#7873F5]"} />
            </button>

            <button
              type="button"
              onClick={handleHangUp}
              aria-label="Hang up"
              className="w-12 h-12 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-300 hover:bg-red-500/25 transition-colors"
            >
              <PhoneOff size={20} />
            </button>
          </div>

          <p className="mt-5 text-[11px] text-[#48484A] max-w-[16rem]">
            Hold the mic to talk. Release to send. Hang up anytime — site voice navigation resumes after.
          </p>
        </div>
      </div>
    </div>
  );
}
