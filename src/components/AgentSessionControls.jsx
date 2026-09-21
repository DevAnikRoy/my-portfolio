import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { Mic, MicOff, PhoneOff } from "lucide-react";
import {
  createLiquidGlassDisplacementMap,
  supportsLiquidRefraction,
} from "../utils/liquidGlass";

const STATUS_LABEL = {
  connecting: "Connecting…",
  speaking: "Tia is speaking",
  listening: "Listening",
  thinking: "Thinking…",
  ending: "Wrapping up…",
  error: "Needs attention",
  idle: "With Tia",
};

const STORAGE_KEY = "tia-controls-pos";
const DEFAULT_WIDTH = 352;

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function defaultPosition() {
  if (typeof window === "undefined") return { x: 24, y: 24 };
  const w = Math.min(DEFAULT_WIDTH, window.innerWidth * 0.92);
  const x = (window.innerWidth - w) / 2;
  const y = window.innerHeight - 150;
  return {
    x: clamp(x, 8, Math.max(8, window.innerWidth - w - 8)),
    y: clamp(y, 8, Math.max(8, window.innerHeight - 130)),
  };
}

function loadPosition() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPosition();
    const parsed = JSON.parse(raw);
    if (typeof parsed?.x === "number" && typeof parsed?.y === "number") {
      return {
        x: clamp(parsed.x, 8, Math.max(8, window.innerWidth - 80)),
        y: clamp(parsed.y, 8, Math.max(8, window.innerHeight - 80)),
      };
    }
  } catch {
    /* ignore */
  }
  return defaultPosition();
}

/**
 * Floating Tia controls — Apple-style liquid glass (rim refraction on Chromium).
 * Drag the top handle to move anywhere on screen.
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
  const reactId = useId().replace(/:/g, "");
  const filterId = `sam-lg-${reactId}`;

  const [navOpen, setNavOpen] = useState(false);
  const [pos, setPos] = useState(() =>
    typeof window !== "undefined" ? loadPosition() : { x: 24, y: 24 }
  );
  const [dragging, setDragging] = useState(false);
  const [map, setMap] = useState(null);
  const [refractionOn, setRefractionOn] = useState(false);

  const panelRef = useRef(null);
  const glassRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    const sync = () => setNavOpen(document.body.classList.contains("nav-locked"));
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    setRefractionOn(!reduced && supportsLiquidRefraction());
  }, []);

  // Rebuild displacement map whenever the glass panel size changes
  useEffect(() => {
    if (!refractionOn || hidden || navOpen) return undefined;
    const el = glassRef.current;
    if (!el) return undefined;

    let raf = 0;
    const rebuild = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        if (rect.width < 8 || rect.height < 8) return;
        const next = createLiquidGlassDisplacementMap({
          width: rect.width,
          height: rect.height,
          radius: 22,
          bezel: 20,
        });
        if (next) setMap(next);
      });
    };

    rebuild();
    const ro = new ResizeObserver(rebuild);
    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [refractionOn, hidden, navOpen]);

  useEffect(() => {
    const onResize = () => {
      setPos((prev) => {
        const el = panelRef.current;
        const w = el?.offsetWidth || Math.min(DEFAULT_WIDTH, window.innerWidth * 0.92);
        const h = el?.offsetHeight || 130;
        return {
          x: clamp(prev.x, 8, Math.max(8, window.innerWidth - w - 8)),
          y: clamp(prev.y, 8, Math.max(8, window.innerHeight - h - 8)),
        };
      });
    };
    window.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
    };
  }, []);

  const persist = useCallback((next) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const onPointerDown = (e) => {
    if (e.button != null && e.button !== 0) return;
    const el = panelRef.current;
    if (!el) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const rect = el.getBoundingClientRect();
    dragRef.current = {
      pointerId: e.pointerId,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      w: rect.width,
      h: rect.height,
    };
    setDragging(true);
  };

  const onPointerMove = (e) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    e.preventDefault();
    const next = {
      x: clamp(e.clientX - drag.offsetX, 8, Math.max(8, window.innerWidth - drag.w - 8)),
      y: clamp(e.clientY - drag.offsetY, 8, Math.max(8, window.innerHeight - drag.h - 8)),
    };
    setPos(next);
  };

  const endDrag = (e) => {
    const drag = dragRef.current;
    if (!drag || (e.pointerId != null && drag.pointerId !== e.pointerId)) return;
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {
      /* ignore */
    }
    dragRef.current = null;
    setDragging(false);
    setPos((prev) => {
      persist(prev);
      return prev;
    });
  };

  if (hidden || navOpen) return null;

  const listening = status === "listening";
  const backdropStyle =
    refractionOn && map
      ? {
          backdropFilter: `url(#${filterId}) blur(2.5px) saturate(1.35) brightness(0.92)`,
          WebkitBackdropFilter: `url(#${filterId}) blur(2.5px) saturate(1.35) brightness(0.92)`,
        }
      : undefined;

  return (
    <div
      ref={panelRef}
      className="fixed z-[10055] w-[min(92vw,22rem)] select-none"
      style={{
        left: pos.x,
        top: pos.y,
        cursor: dragging ? "grabbing" : undefined,
      }}
    >
      {refractionOn && map && (
        <svg
          aria-hidden
          width={0}
          height={0}
          className="pointer-events-none absolute"
          style={{ position: "fixed", width: 0, height: 0, overflow: "hidden" }}
        >
          <defs>
            <filter
              id={filterId}
              x="0"
              y="0"
              width={map.width}
              height={map.height}
              filterUnits="userSpaceOnUse"
              primitiveUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feImage
                href={map.dataUrl}
                x="0"
                y="0"
                width={map.width}
                height={map.height}
                preserveAspectRatio="none"
                result="map"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="map"
                scale={map.scale}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
      )}

      <div
        ref={glassRef}
        className={`sam-liquid-glass px-4 pb-3 pt-1.5 ${
          refractionOn ? "sam-liquid-glass--refract" : ""
        } ${dragging ? "sam-liquid-glass--dragging scale-[1.02]" : ""} transition-transform duration-150`}
        style={backdropStyle}
      >
        <div
          role="button"
          tabIndex={0}
          aria-label="Drag Tia controls to move"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className="flex cursor-grab flex-col items-center gap-1.5 py-1.5 active:cursor-grabbing"
          style={{ touchAction: "none" }}
        >
          <span
            className="sam-liquid-glass__drag block h-1.5 w-12 rounded-full"
            aria-hidden
          />
          <div className="flex w-full items-center justify-between gap-2">
            <p className="truncate text-xs font-medium text-white/95 drop-shadow-sm">
              {muted ? "Muted" : STATUS_LABEL[status] || STATUS_LABEL.idle}
              <span className="ml-2 font-normal text-white/50">· drag</span>
            </p>
            {error && (
              <button
                type="button"
                onClick={(ev) => {
                  ev.stopPropagation();
                  onRetry?.();
                }}
                onPointerDown={(ev) => ev.stopPropagation()}
                className="shrink-0 text-[11px] text-[#C4C1FF] underline underline-offset-2"
              >
                Retry
              </button>
            )}
          </div>
          {(error || reportStatus) && (
            <p className="w-full truncate text-left text-[11px] text-white/55">
              {error || reportStatus}
            </p>
          )}
        </div>

        <div className="mt-1 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? "Unmute" : "Mute"}
            className="sam-liquid-glass__btn flex h-11 w-11 items-center justify-center rounded-full text-white/70 transition-colors hover:text-white"
          >
            {muted ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          <div
            className={`relative flex h-14 w-14 items-center justify-center rounded-full ${
              listening
                ? "bg-gradient-to-br from-[#7873F5]/95 to-[#EC77AB]/95 shadow-[0_0_28px_rgba(120,115,245,0.45)]"
                : "sam-liquid-glass__btn"
            }`}
            aria-hidden
          >
            {listening && (
              <span className="absolute inset-0 animate-ping rounded-full border border-[#EC77AB]/40" />
            )}
            <Mic size={22} className={listening ? "text-white" : "text-[#C4C1FF]"} />
          </div>

          <button
            type="button"
            onClick={onHangUp}
            disabled={ending || status === "ending"}
            aria-label="End session with Tia"
            className="sam-liquid-glass__btn sam-liquid-glass__btn--hang flex h-11 w-11 items-center justify-center rounded-full transition-colors disabled:opacity-50"
          >
            <PhoneOff size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
