import { useState } from 'react'
import { Copy, Check, Lock } from 'lucide-react'
import { useSubscription } from '../context/SubscriptionContext'
import { useLang } from '../context/LanguageContext'

const gold = '#d4af37'

export default function ObsUrlBar({ obsUrl, children }) {
  const { hasActivePlan } = useSubscription()
  const { t } = useLang()
  const ts = t.shop
  const tc = t.common
  const [copied, setCopied] = useState(false)

  const copyUrl = () => {
    if (!hasActivePlan) return
    navigator.clipboard.writeText(obsUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(212,175,55,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 5, height: 5, borderRadius: '50%', background: hasActivePlan ? gold : '#4a4842', animation: hasActivePlan ? 'glow-pulse 2s ease-in-out infinite' : 'none', flexShrink: 0 }} />

      {hasActivePlan ? (
        <span style={{ fontSize: 10, color: 'var(--input-text)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          {obsUrl}
        </span>
      ) : (
        <span style={{ fontSize: 10, color: '#4a4842', fontFamily: 'monospace', flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Lock size={10} />
          {'••••••••••••••••••••'}
          <span style={{ fontSize: 9, color: gold, fontFamily: 'system-ui', fontWeight: 600, marginLeft: 4 }}>{ts.activateToUnlock}</span>
        </span>
      )}

      <button onClick={copyUrl} disabled={!hasActivePlan}
        style={{
          display: 'flex', alignItems: 'center', gap: 5, borderRadius: 8, padding: '7px 14px',
          fontSize: 12, fontWeight: 700, cursor: hasActivePlan ? 'pointer' : 'not-allowed',
          background: !hasActivePlan ? 'rgba(74,72,66,0.1)' : copied ? 'rgba(52,211,153,0.15)' : 'rgba(212,175,55,0.18)',
          borderColor: !hasActivePlan ? 'rgba(74,72,66,0.2)' : copied ? 'rgba(52,211,153,0.5)' : 'rgba(212,175,55,0.5)',
          border: `1px solid ${!hasActivePlan ? 'rgba(74,72,66,0.2)' : copied ? 'rgba(52,211,153,0.5)' : 'rgba(212,175,55,0.5)'}`,
          color: !hasActivePlan ? '#4a4842' : copied ? '#34d399' : gold,
          opacity: hasActivePlan ? 1 : 0.5,
          transition: 'all 0.15s',
        }}>
        {copied ? <Check size={11} /> : <Copy size={11} />}
        {copied ? tc.copied : tc.copyObs}
      </button>

      {children}
    </div>
  )
}
