"use client";

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function RevealText({
  children,
  as: Tag = 'div',
  delay = 0,
  className = '',
  style = {},
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    gsap.fromTo(el, {
      clipPath: 'inset(0 100% 0 0)',
      opacity: 0,
    }, {
      clipPath: 'inset(0 0% 0 0)',
      opacity: 1,
      duration: 1.2,
      delay,
      ease: 'power4.inOut',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    });
  }, [delay]);

  return (
    <Tag ref={ref} className={className} style={{ willChange: 'clip-path, opacity', ...style }}>
      {children}
    </Tag>
  );
}
