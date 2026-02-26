"use client";

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ── GSAP Defaults ───────────────────────────────────── */
gsap.defaults({
  ease: 'power3.out',
  duration: 1,
});

/* ── Scroll-triggered fade up ────────────────────────── */
export function fadeUp(element, options = {}) {
  return gsap.fromTo(element, {
    y: options.y || 60,
    opacity: 0,
    filter: 'blur(8px)',
  }, {
    y: 0,
    opacity: 1,
    filter: 'blur(0px)',
    duration: options.duration || 1,
    delay: options.delay || 0,
    ease: options.ease || 'power3.out',
    scrollTrigger: {
      trigger: options.trigger || element,
      start: options.start || 'top 85%',
      end: options.end || 'top 20%',
      toggleActions: 'play none none reverse',
      ...options.scrollTrigger,
    },
  });
}

/* ── Staggered children reveal ───────────────────────── */
export function staggerReveal(parent, children, options = {}) {
  return gsap.fromTo(children, {
    y: options.y || 40,
    opacity: 0,
  }, {
    y: 0,
    opacity: 1,
    duration: options.duration || 0.8,
    stagger: options.stagger || 0.1,
    ease: options.ease || 'power3.out',
    scrollTrigger: {
      trigger: parent,
      start: options.start || 'top 80%',
      toggleActions: 'play none none reverse',
      ...options.scrollTrigger,
    },
  });
}

/* ── Parallax effect ─────────────────────────────────── */
export function parallax(element, options = {}) {
  return gsap.to(element, {
    y: options.y || -100,
    ease: 'none',
    scrollTrigger: {
      trigger: options.trigger || element,
      start: options.start || 'top bottom',
      end: options.end || 'bottom top',
      scrub: options.scrub || 1,
      ...options.scrollTrigger,
    },
  });
}

/* ── Scale on scroll ─────────────────────────────────── */
export function scaleOnScroll(element, options = {}) {
  return gsap.fromTo(element, {
    scale: options.from || 0.85,
    opacity: 0,
  }, {
    scale: options.to || 1,
    opacity: 1,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: options.trigger || element,
      start: options.start || 'top 85%',
      end: options.end || 'top 30%',
      scrub: options.scrub || 1,
      ...options.scrollTrigger,
    },
  });
}

/* ── Horizontal scroll ───────────────────────────────── */
export function horizontalScroll(container, track, options = {}) {
  const getScrollWidth = () => track.scrollWidth - container.offsetWidth;
  return gsap.to(track, {
    x: () => -getScrollWidth(),
    ease: 'none',
    scrollTrigger: {
      trigger: container,
      pin: true,
      scrub: 1,
      end: () => `+=${getScrollWidth()}`,
      invalidateOnRefresh: true,
      ...options.scrollTrigger,
    },
  });
}

/* ── Counter animation ───────────────────────────────── */
export function counterUp(element, endValue, options = {}) {
  const obj = { val: 0 };
  return gsap.to(obj, {
    val: endValue,
    duration: options.duration || 2,
    ease: options.ease || 'power2.out',
    onUpdate: () => {
      element.textContent = options.formatter
        ? options.formatter(obj.val)
        : Math.round(obj.val).toLocaleString();
    },
    scrollTrigger: {
      trigger: element,
      start: 'top 85%',
      toggleActions: 'play none none none',
      ...options.scrollTrigger,
    },
  });
}
