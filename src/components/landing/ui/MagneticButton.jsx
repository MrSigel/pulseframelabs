"use client";

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function MagneticButton({
  children,
  href,
  onClick,
  variant = 'primary',
  style = {},
  ...props
}) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setPos({ x: x * 0.15, y: y * 0.15 });
  };

  const handleMouseLeave = () => setPos({ x: 0, y: 0 });

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    fontSize: '0.8rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    textDecoration: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    border: 'none',
    position: 'relative',
    overflow: 'hidden',
    willChange: 'transform',
  };

  const variants = {
    primary: {
      padding: '14px 36px',
      background: 'var(--gradient-gold)',
      color: 'var(--text-inverse)',
      boxShadow: 'var(--shadow-gold)',
    },
    secondary: {
      padding: '14px 36px',
      background: 'transparent',
      color: 'var(--gold)',
      border: '1px solid var(--border-gold)',
    },
    ghost: {
      padding: '10px 20px',
      background: 'transparent',
      color: 'var(--gold)',
    },
  };

  const Component = href ? motion.a : motion.button;

  return (
    <Component
      ref={ref}
      href={href}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 300, damping: 25, mass: 0.5 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      style={{ ...baseStyle, ...variants[variant], ...style }}
      {...props}
    >
      {children}
      {variant === 'primary' && (
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.12) 50%, transparent 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 3s ease-in-out infinite',
          }}
        />
      )}
    </Component>
  );
}
