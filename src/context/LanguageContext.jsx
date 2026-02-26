"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from '@/i18n/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  // Always start with 'en' for SSR consistency — localStorage read deferred to useEffect
  const [lang, setLangState] = useState('en');

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('pfl-lang');
      if (stored && translations[stored]) {
        setLangState(stored);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  const setLang = useCallback((newLang) => {
    setLangState(newLang);
    try {
      localStorage.setItem('pfl-lang', newLang);
    } catch {
      // localStorage unavailable
    }
  }, []);

  const t = translations[lang] || translations.en;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
