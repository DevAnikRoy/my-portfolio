import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const CustomCursor = () => {
  const cursorRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const xTo = gsap.quickTo(cursor, "x", { duration: 0.6, ease: "power3" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.6, ease: "power3" });

    const moveCursor = (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };

    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, []);

  return (
    <div
      ref={cursorRef}
      className="fixed w-4 h-4 bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference"
      style={{ marginLeft: -8, marginTop: -8 }}
    />
  );
};

export default CustomCursor;
