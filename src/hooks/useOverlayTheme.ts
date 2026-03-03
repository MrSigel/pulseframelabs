"use client";

import { useMemo } from "react";
import { useOverlayData } from "./useOverlayData";
import type { ThemeColors } from "@/lib/supabase/types";

interface ThemeSettingsRow {
  colors: ThemeColors | null;
}

const DEFAULTS: ThemeColors = {
  bgColor: "#1a1f2e",
  bgOpacity: 45,
  iconColor: "#06b6d4",
  highlightColor: "#3b82f6",
  textColor: "#ffffff",
  fontFamily: "Inter",
  borderRadius: 10,
  borderEnabled: true,
  shadowEnabled: true,
};

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16) || 0;
  const g = parseInt(hex.slice(3, 5), 16) || 0;
  const b = parseInt(hex.slice(5, 7), 16) || 0;
  return `rgba(${r},${g},${b},${alpha.toFixed(2)})`;
}

/**
 * Fetches theme_settings for the given overlay uid and returns
 * typed ThemeColors with defaults. Subscribes to Realtime so
 * changes pushed by the streamer auto-update all open overlays.
 */
export function useOverlayTheme(uid: string | null) {
  const { data, loading } = useOverlayData<ThemeSettingsRow>({
    table: "theme_settings",
    userId: uid,
    single: true,
  });

  const theme: ThemeColors = useMemo(() => {
    if (!data?.colors || typeof data.colors !== "object") return DEFAULTS;
    const c = data.colors as ThemeColors;
    return {
      bgColor: c.bgColor ?? DEFAULTS.bgColor,
      bgOpacity: c.bgOpacity ?? DEFAULTS.bgOpacity,
      iconColor: c.iconColor ?? DEFAULTS.iconColor,
      highlightColor: c.highlightColor ?? DEFAULTS.highlightColor,
      textColor: c.textColor ?? DEFAULTS.textColor,
      fontFamily: c.fontFamily ?? DEFAULTS.fontFamily,
      borderRadius: c.borderRadius ?? DEFAULTS.borderRadius,
      borderEnabled: c.borderEnabled ?? DEFAULTS.borderEnabled,
      shadowEnabled: c.shadowEnabled ?? DEFAULTS.shadowEnabled,
    };
  }, [data]);

  const cssVars: React.CSSProperties = useMemo(() => {
    const alpha = theme.bgOpacity / 100;
    const bgRgba = hexToRgba(theme.bgColor, alpha);
    const bgMidRgba = hexToRgba(theme.bgColor, Math.min(1, alpha * 1.15));
    const borderColor = theme.borderEnabled
      ? `${theme.highlightColor}1a`
      : "transparent";
    const shadow = theme.shadowEnabled
      ? "0 4px 24px rgba(0,0,0,0.30)"
      : "none";

    return {
      "--overlay-bg-dark": bgRgba,
      "--overlay-bg-mid": bgMidRgba,
      "--overlay-border": borderColor,
      "--overlay-shadow-sm": shadow,
      "--overlay-shadow-md": shadow,
      "--overlay-shadow-lg": shadow,
      "--overlay-icon-color": theme.iconColor,
      "--overlay-highlight": theme.highlightColor,
      "--overlay-border-radius": `${theme.borderRadius}px`,
      color: theme.textColor,
      fontFamily: `'${theme.fontFamily}', system-ui, sans-serif`,
    } as React.CSSProperties;
  }, [theme]);

  return { theme, cssVars, loading };
}
