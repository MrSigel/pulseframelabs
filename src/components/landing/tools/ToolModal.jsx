"use client";

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function ToolModal({ isOpen, onClose, children }) {
  const contentRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1100,
            background: 'var(--overlay-dark)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'clamp(1rem, 4vw, 2rem)',
          }}
        >
          <motion.div
            ref={contentRef}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '600px',
              maxHeight: '85vh',
              overflowY: 'auto',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-medium)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-lg)',
              padding: 'clamp(24px, 4vw, 40px)',
            }}
          >
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-card)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--gold)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 1L11 11M11 1L1 11" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
