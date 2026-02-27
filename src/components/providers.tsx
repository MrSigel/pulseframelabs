"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { LanguageProvider } from "@/context/LanguageContext";

/* ── Theme types ── */
type ThemePreference = "dark" | "light" | "system";
type ResolvedTheme = "dark" | "light";

interface ThemeContextValue {
  theme: ResolvedTheme;
  preference: ThemePreference;
  cycleTheme: () => void;
  setTheme: (t: ThemePreference) => void;
  isDark: boolean;
}

const THEME_KEY = "pulseframelabs-theme";
const THEMES: ThemePreference[] = ["dark", "light", "system"];

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getStoredTheme(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored && THEMES.includes(stored as ThemePreference))
      return stored as ThemePreference;
  } catch {
    /* localStorage unavailable */
  }
  return "dark";
}

function resolve(preference: ThemePreference): ResolvedTheme {
  return preference === "system" ? getSystemTheme() : preference;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  preference: "dark",
  cycleTheme: () => {},
  setTheme: () => {},
  isDark: true,
});

export function useThemeContext() {
  return useContext(ThemeContext);
}

/* ── ThemeProvider ── */
function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>("dark");
  const [resolved, setResolved] = useState<ResolvedTheme>("dark");

  const applyTheme = useCallback((theme: ResolvedTheme) => {
    document.documentElement.setAttribute("data-theme", theme);
    setResolved(theme);
  }, []);

  // Hydrate from localStorage
  useEffect(() => {
    const stored = getStoredTheme();
    setPreference(stored);
    applyTheme(resolve(stored));
  }, [applyTheme]);

  const cycleTheme = useCallback(() => {
    setPreference((prev) => {
      const idx = THEMES.indexOf(prev);
      const next = THEMES[(idx + 1) % THEMES.length];
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        /* */
      }
      applyTheme(resolve(next));
      return next;
    });
  }, [applyTheme]);

  const setTheme = useCallback(
    (theme: ThemePreference) => {
      if (!THEMES.includes(theme)) return;
      setPreference(theme);
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch {
        /* */
      }
      applyTheme(resolve(theme));
    },
    [applyTheme],
  );

  // Listen for system theme changes
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (preference === "system") applyTheme(getSystemTheme());
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [preference, applyTheme]);

  return (
    <ThemeContext.Provider
      value={{ theme: resolved, preference, cycleTheme, setTheme, isDark: resolved === "dark" }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

/* ── Combined Providers for Dashboard ── */
export function DashboardProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>{children}</LanguageProvider>
    </ThemeProvider>
  );
}
