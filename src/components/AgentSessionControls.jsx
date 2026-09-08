import React from "react";
import { Mic, MicOff, PhoneOff } from "lucide-react";

const STATUS_LABEL = {
  connecting: "Connecting…",
  speaking: "Sam is speaking",
  listening: "Listening",
  thinking: "Thinking…",
  ending: "Wrapping up…",
  error: "Needs attention",
  idle: "With Sam",
};

/**
 * Slim floating controls for the unified Sam session.
 */
export default function AgentSessionControls({
  status,
  muted,
  error,
  reportStatus,
  onToggleMute,
  onHangUp,
  onRetry,
  ending,
  hidden,
}) {
  if (hidden) return null;

  const listening = status === "listening";

  return (
    <div className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 z-[10055] w-[min(92vw,22rem)] -translate-x-1/2">
      <div className="rounded-2xl border border-[#191528] bg-[#0E0C17]/95 px-4 py-3 shadow-2xl backdrop-blur-md">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-white">
              {muted ? "Muted" : STATUS_LABEL[status] || STATUS_LABEL.idle}
            </p>
            {(error || reportStatus) && (
              <p className="truncate text-[11px] text-[#8E8E93]">
                {error || reportStatus}
              </p>
            )}
          </div>
          {error && (
            <button
              type="button"
              onClick={onRetry}
              className="shrink-0 text-[11px] text-[#7873F5] underline underline-offset-2"
            >
              Retry
            </button>
          )}
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? "Unmute" : "Mute"}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#191528] bg-[#1C1C1E] text-[#8E8E93] transition-colors hover:text-white"
          >
            {muted ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          <div
            className={`relative flex h-14 w-14 items-center justify-center rounded-full ${
              listening
                ? "bg-gradient-to-br from-[#7873F5] to-[#EC77AB] shadow-[0_0_28px_rgba(120,115,245,0.4)]"
                : "border border-[#191528] bg-[#1C1C1E]"
            }`}
            aria-hidden
          >
            {listening && (
              <span className="absolute inset-0 animate-ping rounded-full border border-[#EC77AB]/40" />
            )}
            <Mic size={22} className={listening ? "text-white" : "text-[#7873F5]"} />
          </div>

          <button
            type="button"
            onClick={onHangUp}
            disabled={ending || status === "ending"}
            aria-label="End session with Sam"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-red-500/30 bg-red-500/15 text-red-300 transition-colors hover:bg-red-500/25 disabled:opacity-50"
          >
            <PhoneOff size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
