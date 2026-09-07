import React, { useEffect, useState } from "react";
import { Mic, MicOff, PhoneOff, Phone } from "lucide-react";
import useVoiceAgent from "../hooks/useVoiceAgent";

const STATUS_COPY = {
  connecting: "Connecting…",
  speaking: "Sam is speaking…",
  listening: "Listening — go ahead",
  thinking: "One moment…",
  ending: "Wrapping up…",
  error: "Something went wrong",
  idle: "On the line",
};

export default function VoiceCallModal({ isOpen, onClose }) {
  const {
    status,
    muted,
    error,
    userCaption,
    agentCaption,
    reportStatus,
    hangUp,
    toggleMute,
    retryListen,
  } = useVoiceAgent({ active: isOpen });

  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setClosing(false);
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleHangUp = async () => {
    if (closing) return;
    setClosing(true);
    await hangUp();
    onClose();
  };

  const isListening = status === "listening";
  const isSpeaking = status === "speaking";
  const waveOn = isListening || isSpeaking;

  return (
    <div className="fixed inset-0 z-[10060] flex items-end sm:items-center justify-center bg-[#110E1B]/92 backdrop-blur-xl p-0 sm:p-4">
      <div className="relative w-full sm:max-w-md bg-[#0E0C17] border border-[#191528] rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] max-h-[100dvh] overflow-y-auto">
        <div className="px-6 pt-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[#7873F5]/30 to-[#EC77AB]/30 border border-[#191528] flex items-center justify-center">
              <Phone size={18} className="text-[#7873F5]" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">Live with Sam</p>
              <p className="text-[#8E8E93] text-xs truncate">
                {muted ? "Muted" : STATUS_COPY[status] || STATUS_COPY.idle}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 flex flex-col items-center text-center">
          <div
            className={`flex items-end justify-center gap-1.5 h-16 mb-6 ${
              waveOn ? "opacity-100" : "opacity-40"
            }`}
            aria-hidden
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="w-1.5 rounded-full bg-gradient-to-t from-[#7873F5] to-[#EC77AB] voice-wave-bar"
                style={{
                  animationDelay: `${i * 0.12}s`,
                  height: waveOn ? undefined : "12px",
                  animationPlayState: waveOn ? "running" : "paused",
                }}
              />
            ))}
          </div>

          <div className="w-full min-h-[7.5rem] space-y-3 mb-6 text-left">
            {agentCaption && (
              <div className="rounded-2xl border border-[#7873F5]/25 bg-[#7873F5]/5 px-4 py-3">
                <p className="text-[10px] uppercase tracking-widest text-[#7873F5] mb-1">Sam</p>
                <p className="text-sm text-white leading-relaxed">{agentCaption}</p>
              </div>
            )}
            {userCaption && (
              <div className="rounded-2xl border border-[#191528] bg-[#110E1B] px-4 py-3">
                <p className="text-[10px] uppercase tracking-widest text-[#48484A] mb-1">You</p>
                <p className="text-sm text-[#8E8E93] leading-relaxed">{userCaption}</p>
              </div>
            )}
            {error && (
              <div className="space-y-2">
                <p className="text-sm text-red-300/90 leading-relaxed">{error}</p>
                <button
                  type="button"
                  onClick={retryListen}
                  className="text-xs text-[#7873F5] underline underline-offset-2"
                >
                  Try listening again
                </button>
              </div>
            )}
            {reportStatus && (
              <p className="text-xs text-[#8E8E93]">{reportStatus}</p>
            )}
          </div>

          <div className="flex items-center justify-center gap-5 w-full">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "Unmute" : "Mute"}
              className="w-12 h-12 rounded-full bg-[#1C1C1E] border border-[#191528] flex items-center justify-center text-[#8E8E93] hover:text-white transition-colors"
            >
              {muted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            <div
              className={`relative w-20 h-20 rounded-full flex items-center justify-center ${
                isListening
                  ? "bg-gradient-to-br from-[#7873F5] to-[#EC77AB] shadow-[0_0_40px_rgba(120,115,245,0.45)]"
                  : "bg-[#1C1C1E] border border-[#191528]"
              }`}
              aria-hidden
            >
              {isListening && (
                <span className="absolute inset-0 rounded-full border-2 border-[#EC77AB]/50 animate-ping" />
              )}
              <Mic size={28} className={isListening ? "text-white" : "text-[#7873F5]"} />
            </div>

            <button
              type="button"
              onClick={handleHangUp}
              disabled={closing || status === "ending"}
              aria-label="Hang up"
              className="w-12 h-12 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-300 hover:bg-red-500/25 transition-colors disabled:opacity-50"
            >
              <PhoneOff size={20} />
            </button>
          </div>

          <p className="mt-5 text-[11px] text-[#48484A] max-w-[18rem] leading-relaxed">
            The call starts as soon as you connect. Speak naturally after Sam finishes —
            silence ends your turn. Hang up anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
