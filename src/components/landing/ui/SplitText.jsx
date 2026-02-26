"use client";

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function SplitText({
  children,
  as: Tag = 'span',
  delay = 0,
  stagger = 0.03,
  className = '',
  style = {},
  triggerOnScroll = true,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const text = typeof children === 'string' ? children : el.textContent;
    el.innerHTML = '';

    // Split by words first, then chars within words — preserves natural word wrapping
    const words = text.split(' ');
    const allChars = [];

    words.forEach((word, wi) => {
      const wordSpan = document.createElement('span');
      wordSpan.style.display = 'inline-block';
      wordSpan.style.whiteSpace = 'nowrap';

      word.split('').forEach((char) => {
        const charSpan = document.createElement('span');
        charSpan.textContent = char;
        charSpan.style.display = 'inline-block';
        charSpan.style.willChange = 'transform, opacity';
        wordSpan.appendChild(charSpan);
        allChars.push(charSpan);
      });

      el.appendChild(wordSpan);

      // Add normal space between words (allows line breaking between words)
      if (wi < words.length - 1) {
        const space = document.createElement('span');
        space.innerHTML = '&nbsp;';
        space.style.display = 'inline-block';
        space.style.width = '0.3em';
        el.appendChild(space);
        allChars.push(space);
      }
    });

    const animConfig = { y: 30, opacity: 0 };
    const toConfig = {
      y: 0,
      opacity: 1,
      duration: 0.6,
      stagger,
      delay,
      ease: 'power3.out',
    };

    if (triggerOnScroll) {
      gsap.fromTo(allChars, animConfig, {
        ...toConfig,
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });
    } else {
      gsap.fromTo(allChars, animConfig, toConfig);
    }

    return () => { allChars.forEach(c => gsap.killTweensOf(c)); };
  }, [children, delay, stagger, triggerOnScroll]);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{ ...style }}
    >
      {children}
    </Tag>
  );
}
