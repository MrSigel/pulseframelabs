import { createContext, useContext, useState, useEffect } from 'react'
import { setOne } from '../lib/store'

const ThemeContext = createContext(null)
const STORAGE_KEY = 'pfl_theme_mode'

const themes = {
  dark: {
    mode: 'dark',
    bg: '#07070f', bgAlt: '#0c0b14', bgCard: '#100f1a', bgInput: '#0a0918',
    bgNav: 'rgba(7,7,15,0.92)',
    text: '#e8e2d4', textSub: '#9a9488', textMuted: '#5a5548', textDim: '#2e2c28',
    border: 'rgba(212,175,55,0.08)', borderLight: 'rgba(212,175,55,0.06)',
    gold: '#d4af37', goldDark: '#b8962e',
    cardGrad: 'linear-gradient(135deg, #0c0b14, #100f1a)',
    particle: '212,175,55',
  },
  light: {
    mode: 'light',
    bg: '#f5f3ee', bgAlt: '#edeae3', bgCard: '#ffffff', bgInput: '#f8f6f1',
    bgNav: 'rgba(245,243,238,0.92)',
    text: '#1a1714', textSub: '#6b6560', textMuted: '#9a9488', textDim: '#c8c4bb',
    border: 'rgba(139,109,31,0.1)', borderLight: 'rgba(139,109,31,0.06)',
    gold: '#8B6D1F', goldDark: '#6b5318',
    cardGrad: 'linear-gradient(135deg, #ffffff, #f8f6f1)',
    particle: '139,109,31',
  },
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem(STORAGE_KEY) || 'dark')
  const theme = themes[mode]

  const toggle = () => {
    const next = mode === 'dark' ? 'light' : 'dark'
    setMode(next)
    localStorage.setItem(STORAGE_KEY, next)
    // Also save to Supabase so overlays via OBS URL can read it
    setOne('pfl_theme_mode', next)
  }

  useEffect(() => {
    document.body.style.background = theme.bg
    document.body.style.color = theme.text
    document.body.style.transition = 'background 0.4s, color 0.4s'
    document.documentElement.setAttribute('data-theme', mode)
  }, [mode])

  return (
    <ThemeContext.Provider value={{ theme, mode, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
