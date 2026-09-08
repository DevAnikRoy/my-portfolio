import React, { useEffect, useState } from "react";

/**
 * Transient top captions for Sam + visitor turns.
 */
export default function AgentFloatingCaptions({
  agentCaption,
  userCaption,
  visible,
  status,
}) {
  const [showAgent, setShowAgent] = useState(false);
  const [showUser, setShowUser] = useState(false);

  useEffect(() => {
    if (!visible || !agentCaption) {
      setShowAgent(false);
      return undefined;
    }
    setShowAgent(true);
    const t = setTimeout(() => setShowAgent(false), Math.min(8000, 2500 + agentCaption.length * 40));
    return () => clearTimeout(t);
  }, [agentCaption, visible]);

  useEffect(() => {
    if (!visible || !userCaption) {
      setShowUser(false);
      return undefined;
    }
    setShowUser(true);
    const t = setTimeout(() => setShowUser(false), 3600);
    return () => clearTimeout(t);
  }, [userCaption, visible]);

  if (!showAgent && !showUser) return null;

  return (
    <div
      className="pointer-events-none fixed top-[max(1rem,env(safe-area-inset-top))] left-1/2 z-[10055] w-[min(92vw,28rem)] -translate-x-1/2 space-y-2"
      aria-live="polite"
    >
      {showAgent && agentCaption && (
        <div className="agent-float-caption rounded-2xl border border-[#7873F5]/30 bg-[#0E0C17]/92 px-4 py-3 shadow-xl backdrop-blur-md">
          <p className="mb-1 text-[10px] uppercase tracking-widest text-[#7873F5]">Sam</p>
          <p className="text-sm leading-relaxed text-white">{agentCaption}</p>
        </div>
      )}
      {showUser && userCaption && (
        <div className="agent-float-caption rounded-2xl border border-[#191528] bg-[#110E1B]/92 px-4 py-3 shadow-xl backdrop-blur-md">
          <p className="mb-1 text-[10px] uppercase tracking-widest text-[#48484A]">You</p>
          <p className="text-sm leading-relaxed text-[#8E8E93]">{userCaption}</p>
        </div>
      )}
      {status === "thinking" && (
        <p className="text-center text-[11px] text-[#8E8E93]">One moment…</p>
      )}
    </div>
  );
}
