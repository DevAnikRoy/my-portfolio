import { useEffect } from 'react';

export function useScrollReveal(ref, threshold = 0.12) {
  useEffect(() => {
    if (!ref.current) return;
    const els = ref.current.querySelectorAll('.sr');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e, idx) => {
        if (e.isIntersecting) {
          const delay = parseFloat(e.target.dataset.delay || 0);
          setTimeout(() => e.target.classList.add('on'), delay * 1000);
          obs.unobserve(e.target);
        }
      });
    }, { threshold });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}