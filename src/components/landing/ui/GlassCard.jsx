"use client";

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function GlassCard({
  children,
  className = '',
  hover3d = true,
  style = {},
  ...props
}) {
  const ref = useRef(null);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!hover3d || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTransform({ rotateY: x * 8, rotateX: -y * 8 });
  };

  const handleMouseLeave = () => {
    setTransform({ rotateX: 0, rotateY: 0 });
    setHovered(false);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: transform.rotateX,
        rotateY: transform.rotateY,
        scale: hovered ? 1.02 : 1,
        borderColor: hovered ? 'var(--border-gold)' : 'var(--bg-glass-border)',
      }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      style={{
        position: 'relative',
        padding: 'clamp(24px, 3vw, 36px)',
        borderRadius: '8px',
        background: 'var(--bg-glass)',
        border: '1px solid var(--bg-glass-border)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        transformStyle: 'preserve-3d',
        perspective: '1000px',
        willChange: 'transform',
        overflow: 'hidden',
        boxShadow: hovered ? '0 8px 40px rgba(201, 168, 76, 0.12), 0 0 20px rgba(201, 168, 76, 0.06)' : 'var(--shadow-sm)',
        transition: 'box-shadow 0.4s ease',
        ...style,
      }}
      {...props}
    >
      {/* Shimmer overlay on hover */}
      <motion.div
        aria-hidden="true"
        animate={{ opacity: hovered ? 1 : 0, x: hovered ? '100%' : '-100%' }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(105deg, transparent 40%, rgba(201, 168, 76, 0.06) 45%, rgba(201, 168, 76, 0.1) 50%, rgba(201, 168, 76, 0.06) 55%, transparent 60%)',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />
      {/* Top gold accent line on hover */}
      <motion.div
        aria-hidden="true"
        animate={{ scaleX: hovered ? 1 : 0, opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute',
          top: 0,
          left: '10%',
          right: '10%',
          height: '1px',
          background: 'var(--gradient-gold)',
          transformOrigin: 'center',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />
      {children}
    </motion.div>
  );
}
