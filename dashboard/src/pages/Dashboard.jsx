import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'
import { Gauge, Medal, Sparkles, Gem, Trophy, Sword, Flame, Target, Radio, MessageSquare, Bot, Globe, Swords, Coins } from 'lucide-react'

const gold = '#d4af37'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t } = useLang()
  const { theme: th, mode } = useTheme()
  const isDark = mode === 'dark'
  const td = t.dashboard
  const tc = t.common

  const QUICK_ACTIONS = [
    { path: '/wager',          label: t.sidebar.wagerBar,      Icon: Gauge,          desc: td.actions.wagerBar },
    { path: '/personal-bests', label: t.sidebar.personalBests, Icon: Medal,          desc: td.actions.personalBests },
    { path: '/slot-requests',  label: t.sidebar.slotRequests,  Icon: Sparkles,       desc: td.actions.slotRequests },
    { path: '/bonushunts',     label: t.sidebar.bonushunt,     Icon: Gem,            desc: td.actions.bonushunt },
    { path: '/tournaments',    label: t.sidebar.tournaments,   Icon: Trophy,         desc: td.actions.tournaments },
    { path: '/bossfight',      label: t.sidebar.bossFight,     Icon: Sword,          desc: td.actions.bossFight },
    { path: '/hotwords',       label: t.sidebar.hotWords,      Icon: Flame,          desc: td.actions.hotWords },
    { path: '/predictions',    label: t.sidebar.predictions,   Icon: Target,         desc: td.actions.predictions },
    { path: '/join',           label: t.sidebar.join,           Icon: Radio,          desc: td.actions.join },
    { path: '/chat',           label: t.sidebar.chat,           Icon: MessageSquare,  desc: td.actions.chat },
    { path: '/twitch-chatbot', label: t.sidebar.twitchBot,     Icon: Bot,            desc: td.actions.twitchBot },
    { path: '/points-battle',  label: t.sidebar.pointsBattle,  Icon: Swords,  desc: td.actions.pointsBattle },
    { path: '/stream-points',  label: t.sidebar.streamPoints,  Icon: Coins,   desc: td.actions.streamPoints },
    { path: '/website',        label: t.sidebar.website,       Icon: Globe,          color: '#d4af37', desc: td.actions.website },
  ]

  const hour = new Date().getHours()
  const greeting = hour < 12 ? td.morning : hour < 18 ? td.afternoon : td.evening
  const displayName = user?.user_metadata?.username || user?.email?.split('@')[0] || 'Streamer'

  return (
    <div>
      {/* Welcome banner */}
      <div style={{
        textAlign:'center', marginBottom:28, padding:'30px 24px',
        background:`linear-gradient(135deg, rgba(212,175,55,0.04) 0%, rgba(212,175,55,0.02) 50%, rgba(212,175,55,0.04) 100%)`,
        border:`1px solid rgba(212,175,55,0.1)`, borderRadius:16,
        position:'relative', overflow:'hidden',
      }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:`linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.3) 30%, rgba(212,175,55,0.4) 50%, rgba(212,175,55,0.3) 70%, transparent 100%)` }} />
        <p style={{ fontSize:22, fontWeight:700, color: th.text, marginBottom:8 }}>
          {greeting}, <span style={{ color: gold }}>{displayName}</span>
        </p>
        <p style={{ fontSize:13, color: th.textSub, lineHeight:1.7, maxWidth:520, margin:'0 auto' }}>
          {td.welcomeMsg}
        </p>
        <p style={{ fontSize:11, color: th.textMuted, marginTop:10 }}>
          {td.supportMsg}
        </p>
      </div>

      {/* Quick Actions */}
      <div>
        <p style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.14em', color: th.textMuted, marginBottom:14 }}>{td.quickActions}</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:12 }}>
          {QUICK_ACTIONS.map(qa => (
            <button key={qa.path} onClick={() => navigate(qa.path)} style={{
              display:'flex', alignItems:'center', gap:12, padding:'14px 16px',
              background: isDark ? 'linear-gradient(135deg, #0c0b14, #100f1a)' : 'linear-gradient(135deg, #ffffff, #f8f6f1)',
              border: `1px solid ${isDark ? 'rgba(212,175,55,0.06)' : 'rgba(139,109,31,0.1)'}`,
              borderRadius:12, cursor:'pointer', textAlign:'left',
              transition:'all 0.2s', position:'relative', overflow:'hidden',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = isDark ? 'rgba(212,175,55,0.25)' : 'rgba(139,109,31,0.3)'; e.currentTarget.style.boxShadow = isDark ? '0 0 18px rgba(212,175,55,0.08)' : '0 4px 16px rgba(0,0,0,0.06)'; e.currentTarget.style.transform='translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = isDark ? 'rgba(212,175,55,0.06)' : 'rgba(139,109,31,0.1)'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.transform='none' }}>
              <div style={{
                width:36, height:36, borderRadius:10, flexShrink:0,
                background: isDark ? 'rgba(212,175,55,0.08)' : 'rgba(139,109,31,0.08)',
                border: `1px solid ${isDark ? 'rgba(212,175,55,0.15)' : 'rgba(139,109,31,0.15)'}`,
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <qa.Icon size={16} style={{ color: isDark ? gold : '#8B6D1F' }} />
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color: th.text }}>{qa.label}</div>
                <div style={{ fontSize:10, color: th.textMuted, marginTop:2 }}>{qa.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
