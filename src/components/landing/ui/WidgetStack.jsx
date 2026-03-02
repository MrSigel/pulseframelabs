"use client";

import { useState, useEffect } from 'react';
import AnimationToggle from './AnimationToggle';
import ThemeToggleWidget from './ThemeToggleWidget';
import LanguageWidget from './LanguageWidget';

const STORAGE_KEY = 'pfl-bg-animation';

export default function WidgetStack({ theme, onAnimationChange }) {
  const [animationEnabled, setAnimationEnabled] = useState(false); // default OFF

  // Hydrate from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      const val = stored === 'true';
      setAnimationEnabled(val);
      onAnimationChange?.(val);
    } else {
      // Default is OFF
      onAnimationChange?.(false);
    }
  }, []);

  function toggleAnimation() {
    const next = !animationEnabled;
    setAnimationEnabled(next);
    localStorage.setItem(STORAGE_KEY, String(next));
    onAnimationChange?.(next);
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 1001,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '8px',
    }}>
      <AnimationToggle enabled={animationEnabled} onToggle={toggleAnimation} />
      <ThemeToggleWidget preference={theme.preference} onCycle={theme.cycleTheme} />
      <LanguageWidget />
    </div>
  );
}
