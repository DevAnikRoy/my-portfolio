import React from "react";
import { Mic, MicOff } from "lucide-react";

const COPY = {
  idle: "Tap to enable · Hey Agent",
  listening: 'Say “Hey Agent”',
  active: "Listening for a command…",
  blocked: "Mic blocked · tap to retry",
};

export default function VoiceHint({ status, onEnable, hidden }) {
  if (hidden) return null;

  return (
    <button
      type="button"
      onClick={onEnable}
      aria-label={COPY[status] || COPY.idle}
      className="fixed z-40 left-4 bottom-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.75rem))] md:bottom-6 md:left-[calc(320px+1.5rem)] inline-flex items-center gap-2 min-h-[44px] pl-3 pr-4 rounded-full border border-[#191528] bg-[#0E0C17]/95 backdrop-blur-xl text-xs sm:text-sm text-white hover:border-[#7873F5]/50"
    >
      <span className="relative flex items-center justify-center w-8 h-8 rounded-full bg-[#7873F5]/15">
        {status === "blocked" ? (
          <MicOff size={14} className="text-[#EC77AB]" />
        ) : (
          <Mic size={14} className="text-[#7873F5]" />
        )}
        {(status === "listening" || status === "active") && (
          <span className="absolute inset-0 rounded-full border border-[#EC77AB]/50 animate-ping" />
        )}
      </span>
      <span className="font-medium tracking-wide">{COPY[status] || COPY.idle}</span>
    </button>
  );
}
