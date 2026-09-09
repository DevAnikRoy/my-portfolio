import React, { useEffect, useRef, useState } from "react";

/**
 * Soft thought-stream captions — top-right, slide in/out, no boxy cards.
 * Feels like thoughts floating above a conversation.
 */
export default function AgentFloatingCaptions({
  agentCaption,
  userCaption,
  visible,
  status,
}) {
  const [items, setItems] = useState([]);
  const lastAgent = useRef("");
  const lastUser = useRef("");
  const idRef = useRef(0);

  useEffect(() => {
    if (!visible || !agentCaption || agentCaption === lastAgent.current) return;
    lastAgent.current = agentCaption;
    const id = ++idRef.current;
    const ttl = Math.min(7800, 2800 + agentCaption.length * 38);
    setItems((prev) =>
      [{ id, role: "sam", text: agentCaption, leaving: false }, ...prev].slice(0, 3)
    );
    const leave = setTimeout(() => {
      setItems((prev) =>
        prev.map((row) => (row.id === id ? { ...row, leaving: true } : row))
      );
    }, ttl);
    const remove = setTimeout(() => {
      setItems((prev) => prev.filter((row) => row.id !== id));
    }, ttl + 420);
    return () => {
      clearTimeout(leave);
      clearTimeout(remove);
    };
  }, [agentCaption, visible]);

  useEffect(() => {
    if (!visible || !userCaption || userCaption === lastUser.current) return;
    lastUser.current = userCaption;
    const id = ++idRef.current;
    const ttl = 3400;
    setItems((prev) =>
      [{ id, role: "you", text: userCaption, leaving: false }, ...prev].slice(0, 3)
    );
    const leave = setTimeout(() => {
      setItems((prev) =>
        prev.map((row) => (row.id === id ? { ...row, leaving: true } : row))
      );
    }, ttl);
    const remove = setTimeout(() => {
      setItems((prev) => prev.filter((row) => row.id !== id));
    }, ttl + 420);
    return () => {
      clearTimeout(leave);
      clearTimeout(remove);
    };
  }, [userCaption, visible]);

  useEffect(() => {
    if (visible) return;
    setItems((prev) => prev.map((row) => ({ ...row, leaving: true })));
    const t = setTimeout(() => setItems([]), 420);
    return () => clearTimeout(t);
  }, [visible]);

  const showThinking = status === "thinking" && !items.some((i) => !i.leaving && i.role === "sam");

  if (!items.length && !showThinking) return null;

  return (
    <div
      className="agent-thought-rail pointer-events-none fixed top-[max(0.85rem,env(safe-area-inset-top))] right-[max(0.75rem,env(safe-area-inset-right))] z-[10055] flex w-[min(78vw,17.5rem)] flex-col items-end gap-2.5 sm:w-[min(42vw,18.5rem)]"
      aria-live="polite"
    >
      {showThinking && (
        <div className="agent-thought-chip agent-thought-chip--thinking">
          <span className="agent-thought-dots" aria-hidden>
            <i />
            <i />
            <i />
          </span>
          <p className="agent-thought-text agent-thought-text--muted">thinking…</p>
        </div>
      )}

      {items.map((item) => (
        <div
          key={item.id}
          className={`agent-thought-chip agent-thought-chip--${item.role}${
            item.leaving ? " is-leaving" : ""
          }`}
        >
          <span className="agent-thought-who">
            {item.role === "sam" ? "Sam" : "You"}
          </span>
          <p className="agent-thought-text">{item.text}</p>
          <span className="agent-thought-trail" aria-hidden>
            <i />
            <i />
            <i />
          </span>
        </div>
      ))}
    </div>
  );
}
