"use client";

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useSmoothScroll() {
  useEffect(() => {
    // Refresh ScrollTrigger after all content loads
    const timeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    // Handle resize
    const handleResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', handleResize);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);
}

export { gsap, ScrollTrigger };
