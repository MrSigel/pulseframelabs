import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, Gem, Trophy, Sword, MessageSquare, Bot, LogOut, Radio, Medal, Gauge, Sparkles, Flame, Target, ChevronDown, Globe, Coins, Swords, Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useLang } from '../context/LanguageContext'

function useNavSections(ts) {
  return [
    {
      items: [
        { path: '/', label: ts.dashboard, Icon: LayoutDashboard },
      ],
    },
    {
      label: ts.overlays,
      items: [
        { path: '/wager',          label: ts.wagerBar,      Icon: Gauge },
        { path: '/personal-bests', label: ts.personalBests, Icon: Medal },
        { path: '/slot-requests',  label: ts.slotRequests,  Icon: Sparkles },
        { path: '/bonushunts',     label: ts.bonushunt,      Icon: Gem },
        { path: '/tournaments',    label: ts.tournaments,    Icon: Trophy },
        { path: '/bossfight',      label: ts.bossFight,     Icon: Sword },
      ],
    },
    {
      label: ts.community,
      items: [
        { path: '/hotwords',    label: ts.hotWords,    Icon: Flame },
        { path: '/predictions', label: ts.predictions,  Icon: Target },
        { path: '/join',        label: ts.join,          Icon: Radio },
      ],
    },
    {
      label: ts.stream,
      items: [
        { path: '/chat',           label: ts.chat,       Icon: MessageSquare },
        { path: '/twitch-chatbot', label: ts.twitchBot,  Icon: Bot },
        { path: '/points-battle',  label: ts.pointsBattle, Icon: Swords },
        { path: '/stream-points',  label: ts.streamPoints, Icon: Coins },
        { path: '/website',        label: ts.website,     Icon: Globe },
      ],
    },
  ]
}

// ── Animated Logo ────────────────────────────────────────────────────────
function AnimatedLogo() {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: 10, flexShrink: 0, position: 'relative',
      background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))',
      border: '1px solid rgba(212,175,55,0.25)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {/* Rotating ring */}
      <div style={{
        position: 'absolute', inset: 2,
        border: '1.5px solid transparent',
        borderTopColor: 'rgba(212,175,55,0.6)',
        borderRightColor: 'rgba(212,175,55,0.2)',
        borderRadius: '50%',
        animation: 'spin 3s linear infinite',
      }} />
      {/* Inner pulse */}
      <div style={{
        width: 14, height: 14, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(212,175,55,0.4) 0%, rgba(212,175,55,0.05) 70%)',
        animation: 'glow-pulse 2s ease-in-out infinite',
      }} />
      {/* P letter */}
      <span style={{
        position: 'absolute', fontSize: 13, fontWeight: 800, color: '#d4af37',
        textShadow: '0 0 8px rgba(212,175,55,0.3)',
      }}>P</span>
    </div>
  )
}

// ── Dynamic Tab Title ────────────────────────────────────────────────────
function usePageTitle(navSections) {
  const location = useLocation()
  const allItems = navSections.flatMap(s => s.items)
  useEffect(() => {
    const item = allItems.find(i => i.path === location.pathname)
    const pageName = item ? item.label : 'Dashboard'
    document.title = `Pulseframelabs - ${pageName}`
  }, [location.pathname, allItems])
}

// ── Nav Item ─────────────────────────────────────────────────────────────
function NavItem({ path, label, Icon }) {
  const [hovered, setHovered] = useState(false)
  const { mode } = useTheme()
  const gold = '#d4af37'
  const isDark = mode === 'dark'
  const textDefault = isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.7)'
  const textHover = isDark ? '#ffffff' : '#000000'
  const iconDefault = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'
  const iconHover = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
  const hoverBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)'
  const hoverBorder = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'

  return (
    <NavLink
      to={path}
      end={path === '/'}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={({ isActive }) => ({
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 12px', borderRadius: 10,
        fontSize: 13, fontWeight: isActive ? 600 : 500,
        textDecoration: 'none', transition: 'all 0.15s ease',
        position: 'relative', overflow: 'hidden',
        ...(isActive ? {
          background: isDark ? 'rgba(212,175,55,0.08)' : 'rgba(139,109,31,0.08)',
          color: isDark ? '#ffffff' : '#000000',
          border: `1px solid ${isDark ? 'rgba(212,175,55,0.2)' : 'rgba(139,109,31,0.2)'}`,
          boxShadow: `0 0 12px ${isDark ? 'rgba(212,175,55,0.08)' : 'rgba(139,109,31,0.06)'}`,
        } : hovered ? {
          background: hoverBg,
          color: textHover,
          border: `1px solid ${hoverBorder}`,
          transform: 'translateX(3px)',
        } : {
          color: textDefault,
          border: '1px solid transparent',
        }),
      })}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <div style={{
              position: 'absolute', left: 0, top: '15%', bottom: '15%', width: 2,
              background: `linear-gradient(180deg, transparent 0%, ${gold} 50%, transparent 100%)`,
              borderRadius: 2,
            }} />
          )}
          <Icon size={14} style={{ color: isActive ? gold : hovered ? iconHover : iconDefault, transition: 'color 0.15s', flexShrink: 0 }} />
          <span>{label}</span>
          {isActive && (
            <div style={{
              marginLeft: 'auto', width: 5, height: 5, borderRadius: '50%',
              background: gold, boxShadow: `0 0 6px ${gold}`,
              animation: 'glow-pulse 2s ease-in-out infinite', flexShrink: 0,
            }} />
          )}
        </>
      )}
    </NavLink>
  )
}

// ── Nav Section ──────────────────────────────────────────────────────────
function NavSection({ label, items, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  const { mode } = useTheme()
  const isDark = mode === 'dark'

  if (!label) {
    return items.map(item => <NavItem key={item.path} {...item} />)
  }

  return (
    <div style={{ marginTop: 12 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '5px 12px', marginBottom: 4,
          background: 'none', border: 'none', cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: isDark ? '#ffffff' : '#000000' }}>
          {label}
        </span>
        <ChevronDown size={10} style={{
          color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)', transition: 'transform 0.2s',
          transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
        }} />
      </button>
      <div style={{
        overflow: 'hidden', maxHeight: open ? 500 : 0,
        transition: 'max-height 0.25s ease',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {items.map(item => <NavItem key={item.path} {...item} />)}
        </div>
      </div>
    </div>
  )
}

// ── Sidebar ──────────────────────────────────────────────────────────────
export default function Sidebar() {
  const { signOut, user } = useAuth()
  const { theme: th, mode, toggle: toggleTheme } = useTheme()
  const { lang, toggle: toggleLang, t: translations } = useLang()
  const ts = translations.sidebar
  const navSections = useNavSections(ts)
  usePageTitle(navSections)

  return (
    <aside style={{
      width: 220,
      background: mode === 'dark' ? 'linear-gradient(180deg, #0a0914 0%, #080710 50%, #0a0914 100%)' : 'linear-gradient(180deg, #f0ede6 0%, #e8e5de 50%, #f0ede6 100%)',
      borderRight: `1px solid ${th.borderLight}`,
      transition: 'background 0.4s',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      position: 'relative',
    }}>
      {/* Gold accent line */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0, left: 0, width: 1,
        background: 'linear-gradient(180deg, transparent 0%, rgba(212,175,55,0.25) 40%, rgba(212,175,55,0.15) 70%, transparent 100%)',
      }} />

      {/* Brand */}
      <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid rgba(212,175,55,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <AnimatedLogo />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: mode === 'dark' ? '#ffffff' : '#000000', letterSpacing: '0.02em', lineHeight: 1.2 }}>
              Pulseframe<span style={{ color: '#d4af37' }}>labs</span>
            </p>
            <p style={{ fontSize: 9, color: mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>
              {user?.email || user?.user_metadata?.username || 'admin'}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '6px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
        {navSections.map((section, i) => (
          <NavSection key={section.label || i} {...section} />
        ))}
      </nav>

      {/* Language toggle + Theme toggle + Sign out */}
      <div style={{ padding: '10px 10px 14px', borderTop: `1px solid ${th.borderLight}`, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button onClick={toggleLang} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 12px', width: '100%', borderRadius: 10,
          fontSize: 12, fontWeight: 600, border: `1px solid ${th.border}`,
          color: mode === 'dark' ? '#ffffff' : '#000000', background: 'none', cursor: 'pointer', transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = `${th.gold}40`; e.currentTarget.style.background = `${th.gold}08` }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = th.border; e.currentTarget.style.background = 'none' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: th.gold }}>{lang === 'en' ? 'DE' : 'EN'}</span>
          {lang === 'en' ? 'Deutsch' : 'English'}
        </button>
        <button onClick={toggleTheme} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 12px', width: '100%', borderRadius: 10,
          fontSize: 12, fontWeight: 600, border: `1px solid ${th.border}`,
          color: mode === 'dark' ? '#ffffff' : '#000000', background: 'none', cursor: 'pointer', transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = `${th.gold}40`; e.currentTarget.style.background = `${th.gold}08` }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = th.border; e.currentTarget.style.background = 'none' }}>
          {mode === 'dark' ? <Sun size={14} style={{ color: th.gold }} /> : <Moon size={14} style={{ color: th.gold }} />}
          {mode === 'dark' ? ts.lightMode : ts.darkMode}
        </button>
        <button
          onClick={signOut}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', width: '100%', borderRadius: 10,
            fontSize: 13, fontWeight: 600,
            border: '1px solid rgba(239,68,68,0.3)',
            color: mode === 'dark' ? '#ffffff' : '#000000', background: 'none', cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.1)'
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'
            e.currentTarget.style.boxShadow = '0 0 12px rgba(239,68,68,0.1)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'none'
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <LogOut size={14} style={{ color: '#f87171' }} />
          {ts.signOut}
        </button>
      </div>
    </aside>
  )
}
