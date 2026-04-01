import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getAllPublic, getOnePublic, onTableChange } from '../lib/store'

const FEATURES = [
  { key: 'chat_relay',    label: 'Chat Relay' },
  { key: 'hotwords',      label: 'Hot Words' },
  { key: 'slot_requests', label: 'Slot Requests' },
  { key: 'quick_guesses', label: 'Quick Guesses' },
  { key: 'points_battle', label: 'Points Battle' },
  { key: 'loyalty',       label: 'Loyalty' },
]

const base = { fontFamily:'monospace', background:'rgba(10,10,22,0.92)', border:'1px solid #1e1e40', borderRadius:12, backdropFilter:'blur(12px)' }

const Placeholder = ({ text }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:100, fontFamily:'monospace', color:'#444466', fontSize:12 }}>{text}</div>
)

export default function BotOverlay() {
  const [params] = useSearchParams()
  const mode = params.get('mode') || 'status'
  const uid = params.get('uid')
  const [connection, setConnection] = useState(null)
  const [commands, setCommands] = useState([])
  const [log, setLog] = useState([])

  const loadData = async () => {
    // uid is optional - fallback to logged-in user
    const conn = await getOnePublic('twitch_connection', uid)
    const cmds = await getAllPublic('bot_commands', uid)
    setConnection(conn)
    setCommands((cmds || []).filter(c => c.enabled !== false))
    const msgs = await getAllPublic('chat_messages', uid)
    setLog((msgs || []).slice(0, 20))
  }

  useEffect(() => {
    // uid is optional - fallback to logged-in user
    loadData()
    const off1 = onTableChange('user_settings', loadData)
    const off2 = onTableChange('bot_commands', loadData)
    const off3 = onTableChange('chat_messages', () => getAllPublic('chat_messages', uid).then(d => setLog((d || []).slice(0, 20))))
    return () => { off1(); off2(); off3() }
  }, [uid])

  if (!connection) return <Placeholder text="No bot connection found" />

  const features = connection.feature_toggles || {}
  const activeFeatures = FEATURES.filter(f => features[f.key])

  if (mode === 'log') {
    return (
      <div style={{ ...base, padding:16, minWidth:360 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12, paddingBottom:8, borderBottom:'1px solid #1e1e40' }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e', boxShadow:'0 0 6px #22c55e' }} />
          <span style={{ fontSize:9, color:'#44447a', textTransform:'uppercase', letterSpacing:'0.15em' }}>Bot Activity</span>
          <span style={{ fontSize:9, color:'#2e2e5a', marginLeft:'auto' }}>#{connection.channel_name}</span>
        </div>
        {log.length === 0 ? (
          <div style={{ color:'#333355', fontSize:12, textAlign:'center', padding:16 }}>Waiting for activity…</div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {log.map((m, i) => (
              <div key={m.id || i} style={{ display:'flex', alignItems:'flex-start', gap:8, padding:'4px 0', borderBottom:'1px solid #0f0f22' }}>
                <span style={{ fontSize:9, color:'#2e2e5a', flexShrink:0, marginTop:2, fontVariantNumeric:'tabular-nums', width:32 }}>
                  {(() => { const d = new Date(m.sent_at||m.created_at); return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}` })()}
                </span>
                <span style={{ fontSize:11, fontWeight:700, flexShrink:0, color:'#818cf8' }}>{m.username}:</span>
                <span style={{ fontSize:11, color:'#a0a0d0', wordBreak:'break-word', minWidth:0, lineHeight:1.4 }}>{m.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ ...base, padding:20, minWidth:320 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <div>
          <div style={{ fontSize:9, color:'#44447a', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:3 }}>Twitch Bot</div>
          <div style={{ fontSize:14, fontWeight:700, color:'#fff' }}>#{connection.channel_name}</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:'#22c55e', boxShadow:'0 0 6px #22c55e' }} />
          <span style={{ fontSize:10, color:'#22c55e', fontWeight:600 }}>online</span>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8, marginBottom:14 }}>
        {[
          { l:'Commands', v:commands.length },
          { l:'Features', v:activeFeatures.length },
        ].map(s => (
          <div key={s.l} style={{ background:'#0f0f22', border:'1px solid #1e1e40', borderRadius:8, padding:'6px 8px', textAlign:'center' }}>
            <div style={{ fontSize:8, color:'#44447a', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:2 }}>{s.l}</div>
            <div style={{ fontSize:18, fontWeight:700, color:'#fff', fontVariantNumeric:'tabular-nums' }}>{s.v}</div>
          </div>
        ))}
      </div>

      {activeFeatures.length > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {activeFeatures.map(f => (
            <span key={f.key} style={{ fontSize:9, padding:'2px 8px', borderRadius:6, background:'rgba(99,102,241,0.15)', color:'#818cf8', border:'1px solid rgba(99,102,241,0.2)' }}>{f.label}</span>
          ))}
        </div>
      )}
    </div>
  )
}
