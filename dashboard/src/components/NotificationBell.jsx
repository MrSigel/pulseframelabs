import { useState, useEffect, useRef } from 'react'
import { useSubscription } from '../context/SubscriptionContext'
import { useLang } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { Bell, Crown, Coins, CheckCheck, X } from 'lucide-react'

const gold = '#d4af37'

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function NotificationBell() {
  const { subscription, hasActivePlan, transactions } = useSubscription()
  const { t } = useLang()
  const { theme: th, mode } = useTheme()
  const { user } = useAuth()
  const isDark = mode === 'dark'
  const tn = t.notifications
  const [open, setOpen] = useState(false)
  const [readIds, setReadIds] = useState([])
  const ref = useRef(null)

  const storageKey = `notif-read-${user?.id || 'anon'}`

  // Load read IDs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) setReadIds(JSON.parse(stored))
    } catch { /* ignore */ }
  }, [storageKey])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Build notifications from subscription data
  const notifications = []

  // Subscription expiry warnings
  if (hasActivePlan && subscription?.expires_at) {
    const daysLeft = Math.ceil((new Date(subscription.expires_at) - new Date()) / (1000 * 60 * 60 * 24))
    if (daysLeft <= 3 && daysLeft > 0) {
      notifications.push({
        id: `sub-expiring-${subscription.id || 'active'}`,
        icon: <Crown size={14} style={{ color: '#fbbf24' }} />,
        text: tn.subExpiring.replace('{days}', daysLeft),
        time: new Date().toISOString(),
        type: 'warning',
      })
    }
  }

  if (subscription?.expires_at && new Date(subscription.expires_at) < new Date() && !hasActivePlan) {
    notifications.push({
      id: `sub-expired-${subscription.id || 'expired'}`,
      icon: <Crown size={14} style={{ color: '#f87171' }} />,
      text: tn.subExpired,
      time: subscription.expires_at,
      type: 'error',
    })
  }

  // Recent transactions as notifications
  const recentTxns = (transactions || []).slice(0, 5)
  for (const tx of recentTxns) {
    const isPurchase = tx.type === 'purchase'
    const isPlanActivation = tx.type === 'plan_activation'
    notifications.push({
      id: `tx-${tx.id}`,
      icon: isPlanActivation
        ? <Crown size={14} style={{ color: gold }} />
        : <Coins size={14} style={{ color: isPurchase ? '#34d399' : gold }} />,
      text: isPlanActivation ? tn.planActivated : isPurchase ? tn.paymentConfirmed : (tx.description || tx.type),
      time: tx.created_at,
      type: isPurchase ? 'success' : 'info',
    })
  }

  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length

  const markAllRead = () => {
    const allIds = notifications.map(n => n.id)
    setReadIds(allIds)
    try { localStorage.setItem(storageKey, JSON.stringify(allIds)) } catch { /* ignore */ }
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'relative', width: 34, height: 34, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
          cursor: 'pointer', transition: 'all 0.3s', color: gold, padding: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = `${gold}40`; e.currentTarget.style.boxShadow = `0 0 12px ${gold}15` }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'; e.currentTarget.style.boxShadow = 'none' }}
      >
        <Bell size={15} />
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute', top: -4, right: -4,
            width: 18, height: 18, borderRadius: '50%',
            background: '#ef4444', color: '#fff',
            fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `2px solid ${isDark ? '#0a0918' : '#f5f3ee'}`,
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 42, right: 0, width: 320,
          borderRadius: 14, overflow: 'hidden', zIndex: 1000,
          background: isDark ? 'linear-gradient(135deg, #0c0b14, #100f1a)' : 'linear-gradient(135deg, #ffffff, #f8f6f1)',
          border: `1px solid ${isDark ? 'rgba(212,175,55,0.15)' : 'rgba(139,109,31,0.15)'}`,
          boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.12)',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px',
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: th.text }}>{tn.title}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {unreadCount > 0 && (
                <button onClick={markAllRead} style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 10, fontWeight: 600, color: gold, padding: 0,
                }}>
                  <CheckCheck size={12} /> {tn.markAllRead}
                </button>
              )}
              <button onClick={() => setOpen(false)} style={{
                background: 'none', border: 'none', cursor: 'pointer', color: th.textMuted, padding: 0,
              }}>
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '28px 16px', textAlign: 'center', fontSize: 12, color: th.textMuted }}>
                {tn.noNotifications}
              </div>
            ) : (
              notifications.map((n, i) => {
                const isRead = readIds.includes(n.id)
                return (
                  <div key={n.id} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px',
                    borderBottom: i < notifications.length - 1 ? `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}` : 'none',
                    background: isRead ? 'transparent' : (isDark ? 'rgba(212,175,55,0.03)' : 'rgba(212,175,55,0.04)'),
                    transition: 'background 0.2s',
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0, marginTop: 1,
                      background: isDark ? 'rgba(212,175,55,0.08)' : 'rgba(139,109,31,0.08)',
                      border: `1px solid ${isDark ? 'rgba(212,175,55,0.15)' : 'rgba(139,109,31,0.15)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {n.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: isRead ? 400 : 600, color: th.text, lineHeight: 1.4 }}>
                        {n.text}
                      </div>
                      <div style={{ fontSize: 10, color: th.textMuted, marginTop: 3 }}>
                        {timeAgo(n.time)}
                      </div>
                    </div>
                    {!isRead && (
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: gold, flexShrink: 0, marginTop: 6 }} />
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
