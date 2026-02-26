"use client";

import { useState, useEffect, useCallback } from 'react';

const THEME_KEY = 'pulseframelabs-theme';
const THEMES = ['dark', 'light', 'system'];

function getSystemTheme() {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored && THEMES.includes(stored)) return stored;
  } catch (e) { /* localStorage unavailable */ }
  return 'dark';
}

function getResolvedTheme(preference) {
  if (preference === 'system') return getSystemTheme();
  return preference;
}

export function useTheme() {
  // Always start with 'dark' for SSR consistency — localStorage read deferred to useEffect
  const [preference, setPreference] = useState('dark');
  const [resolved, setResolved] = useState('dark');

  const applyTheme = useCallback((theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    setResolved(theme);
  }, []);

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    const stored = getStoredTheme();
    setPreference(stored);
    applyTheme(getResolvedTheme(stored));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cycleTheme = useCallback(() => {
    setPreference(prev => {
      const idx = THEMES.indexOf(prev);
      const next = THEMES[(idx + 1) % THEMES.length];
      try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* */ }
      const resolvedNext = getResolvedTheme(next);
      applyTheme(resolvedNext);
      return next;
    });
  }, [applyTheme]);

  const setTheme = useCallback((theme) => {
    if (!THEMES.includes(theme)) return;
    setPreference(theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* */ }
    applyTheme(getResolvedTheme(theme));
  }, [applyTheme]);

  // Listen for system theme changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (preference === 'system') {
        applyTheme(getSystemTheme());
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [preference, applyTheme]);

  return {
    theme: resolved,       // 'dark' | 'light' (actual applied theme)
    preference,            // 'dark' | 'light' | 'system' (user selection)
    cycleTheme,            // Toggle to next theme
    setTheme,              // Set specific theme
    isDark: resolved === 'dark',
  };
}
