import React, { useEffect, useRef } from 'react';

const CustomCursor = () => {
  const cursorRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    let raf;
    let target = { x: 0, y: 0 };
    let current = { x: 0, y: 0 };

    const onMouse = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
    };

    const tick = () => {
      current.x += (target.x - current.x) * 0.12;
      current.y += (target.y - current.y) * 0.12;

      cursor.style.left = current.x + 'px';
      cursor.style.top = current.y + 'px';

      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMouse, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMouse);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 w-4 h-4 bg-white rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2"
      style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.12), 0 0 6px rgba(0,0,0,0.15)' }}
    />
  );
};

export default CustomCursor;