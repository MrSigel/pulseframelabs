"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '@/components/landing/ui/ThemeToggle';
import { useLanguage } from '@/context/LanguageContext';
import ToolModal from '@/components/landing/tools/ToolModal';
import RandomSlotGenerator from '@/components/landing/tools/RandomSlotGenerator';
import BonusHuntCalculator from '@/components/landing/tools/BonusHuntCalculator';
import SlotVolatilityComparer from '@/components/landing/tools/SlotVolatilityComparer';
import StreamCountdown from '@/components/landing/tools/StreamCountdown';

function DiceIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="8.5" cy="8.5" r="1" fill="currentColor" />
      <circle cx="15.5" cy="15.5" r="1" fill="currentColor" />
    </svg>
  );
}

function CalcIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="8" y1="10" x2="10" y2="10" />
      <line x1="14" y1="10" x2="16" y2="10" />
      <line x1="8" y1="14" x2="10" y2="14" />
      <line x1="14" y1="14" x2="16" y2="14" />
      <line x1="8" y1="18" x2="16" y2="18" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="4" y1="20" x2="4" y2="10" />
      <line x1="10" y1="20" x2="10" y2="4" />
      <line x1="16" y1="20" x2="16" y2="12" />
      <line x1="22" y1="20" x2="22" y2="8" />
    </svg>
  );
}

function TimerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="12" cy="13" r="9" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="13" x2="15" y2="13" />
      <line x1="10" y1="2" x2="14" y2="2" />
    </svg>
  );
}

const toolIcons = {
  randomSlot: DiceIcon,
  bonusCalc: CalcIcon,
  volatility: ChartIcon,
  countdown: TimerIcon,
};

export default function Navigation({ theme }) {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [mobileToolsExpanded, setMobileToolsExpanded] = useState(false);
  const [activeToolModal, setActiveToolModal] = useState(null);
  const toolsDropdownRef = useRef(null);

  const navLinksLeft = [
    { label: t.nav.widgets, href: '#widgets' },
    { label: t.nav.features, href: '#features' },
  ];

  const navLinksRight = [
    { label: t.nav.pricing, href: '#pricing' },
  ];

  const toolsList = [
    { id: 'randomSlot', label: t.tools.randomSlot.title },
    { id: 'bonusCalc', label: t.tools.bonusCalc.title },
    { id: 'volatility', label: t.tools.volatility.title },
    { id: 'countdown', label: t.tools.countdown.title },
  ];

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(e.target)) {
        setToolsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleClick = (e, href) => {
    e.preventDefault();
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openTool = (toolId) => {
    setToolsDropdownOpen(false);
    setMobileOpen(false);
    setActiveToolModal(toolId);
  };

  const navLinkStyle = {
    fontSize: '0.8rem',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    transition: 'color 0.3s',
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: scrolled ? '14px 0' : '20px 0',
          borderBottom: scrolled ? '1px solid var(--border-gold)' : '1px solid transparent',
          background: scrolled ? 'var(--nav-bg)' : 'transparent',
          backdropFilter: scrolled ? 'blur(24px) saturate(1.2)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(24px) saturate(1.2)' : 'none',
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 clamp(1.5rem, 4vw, 4rem)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: 'clamp(1rem, 1.5vw, 1.15rem)',
              letterSpacing: '0.02em',
              color: 'var(--text-primary)',
              textDecoration: 'none',
            }}
          >
            Pulseframelabs
          </a>

          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
            {navLinksLeft.map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleClick(e, link.href)}
                style={navLinkStyle}
                onMouseEnter={e => e.target.style.color = 'var(--gold)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
              >
                {link.label}
              </a>
            ))}

            {/* Tools Dropdown */}
            <div ref={toolsDropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                style={{
                  ...navLinkStyle,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: 0,
                  color: toolsDropdownOpen ? 'var(--gold)' : 'var(--text-secondary)',
                }}
                onMouseEnter={e => { if (!toolsDropdownOpen) e.currentTarget.style.color = 'var(--gold)'; }}
                onMouseLeave={e => { if (!toolsDropdownOpen) e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                {t.nav.tools}
                <motion.svg
                  animate={{ rotate: toolsDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  width="8" height="8" viewBox="0 0 10 10" fill="none"
                >
                  <path d="M2 4L5 6.5L8 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
              </button>

              <AnimatePresence>
                {toolsDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 14px)',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      minWidth: '220px',
                      padding: '6px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-medium)',
                      background: 'var(--bg-elevated)',
                      boxShadow: 'var(--shadow-lg)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                    }}
                  >
                    {toolsList.map((tool) => {
                      const Icon = toolIcons[tool.id];
                      return (
                        <button
                          key={tool.id}
                          onClick={() => openTool(tool.id)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <span style={{ color: 'var(--gold)', display: 'flex' }}>
                            <Icon />
                          </span>
                          <span style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            color: 'var(--text-secondary)',
                            letterSpacing: '0.02em',
                          }}>
                            {tool.label}
                          </span>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {navLinksRight.map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleClick(e, link.href)}
                style={navLinkStyle}
                onMouseEnter={e => e.target.style.color = 'var(--gold)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <ThemeToggle preference={theme.preference} onCycle={theme.cycleTheme} />
            <a
              href="/login"
              className="hide-mobile"
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '10px 24px',
                borderRadius: '4px',
                background: 'var(--gradient-gold)',
                color: 'var(--text-inverse)',
                textDecoration: 'none',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              {t.nav.getStarted}
            </a>

            <button
              className="hide-desktop"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '4px' }}
            >
              <motion.span animate={mobileOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                style={{ width: '20px', height: '1.5px', background: 'var(--gold)', display: 'block' }} />
              <motion.span animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                style={{ width: '20px', height: '1.5px', background: 'var(--gold)', display: 'block' }} />
              <motion.span animate={mobileOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                style={{ width: '20px', height: '1.5px', background: 'var(--gold)', display: 'block' }} />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => setMobileOpen(false)}
            className="hide-desktop"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 999,
              background: 'var(--overlay-dark)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '36px',
            }}
          >
            {[...navLinksLeft, ...navLinksRight].map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={(e) => handleClick(e, link.href)}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.8rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                }}
              >
                {link.label}
              </motion.a>
            ))}

            {/* Tools section in mobile */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              style={{ textAlign: 'center' }}
            >
              <button
                onClick={() => setMobileToolsExpanded(!mobileToolsExpanded)}
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.8rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {t.nav.tools}
                <motion.svg
                  animate={{ rotate: mobileToolsExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  width="14" height="14" viewBox="0 0 10 10" fill="none"
                >
                  <path d="M2 4L5 6.5L8 4" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
              </button>

              <AnimatePresence>
                {mobileToolsExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '16px' }}>
                      {toolsList.map((tool, i) => (
                        <motion.button
                          key={tool.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          onClick={() => openTool(tool.id)}
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '1.1rem',
                            fontWeight: 400,
                            color: 'var(--text-secondary)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px 0',
                          }}
                        >
                          {tool.label}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.a
              href="/login"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                padding: '14px 40px',
                borderRadius: '4px',
                background: 'var(--gradient-gold)',
                color: 'var(--text-inverse)',
                textDecoration: 'none',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              {t.nav.getStarted}
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tool Modals */}
      <ToolModal isOpen={activeToolModal === 'randomSlot'} onClose={() => setActiveToolModal(null)}>
        <RandomSlotGenerator />
      </ToolModal>
      <ToolModal isOpen={activeToolModal === 'bonusCalc'} onClose={() => setActiveToolModal(null)}>
        <BonusHuntCalculator />
      </ToolModal>
      <ToolModal isOpen={activeToolModal === 'volatility'} onClose={() => setActiveToolModal(null)}>
        <SlotVolatilityComparer />
      </ToolModal>
      <ToolModal isOpen={activeToolModal === 'countdown'} onClose={() => setActiveToolModal(null)}>
        <StreamCountdown />
      </ToolModal>
    </>
  );
}
