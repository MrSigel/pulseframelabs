import { useEffect, useState, useRef } from 'react'
import { getAll, getOne, setOne, insert, update, remove, onTableChange } from '../lib/store'
import { supabase } from '../lib/supabase'
import { Info, Plus, Trash2, Check, Coins, Search, ChevronDown, Gift, ShoppingBag, Settings, Upload, Image } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'

const gold = '#d4af37'
const S = {
  card: { background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 14 },
  label: { display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--label-color)', marginBottom: 8 },
}

function HoverBtn({ onClick, children, style, hoverStyle, disabled }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display:'flex', alignItems:'center', gap:6, borderRadius:10, padding:'8px 14px', fontSize:13, fontWeight:600, cursor: disabled ? 'not-allowed' : 'pointer', transition:'all 0.15s', border:'1px solid transparent', ...style, ...(hov && !disabled ? hoverStyle : {}) }}>
      {children}
    </button>
  )
}

export default function StreamPoints() {
  const { t } = useLang()
  const { user } = useAuth()
  const tc = t.common
  const ts = t.streamPoints
  const [activeTab, setActiveTab] = useState('points')
  const fileInputRef = useRef(null)
  const [showInfo, setShowInfo] = useState(false)
  const [viewers, setViewers] = useState([])
  const [items, setItems] = useState([])
  const [redemptions, setRedemptions] = useState([])
  const [search, setSearch] = useState('')
  const [config, setConfig] = useState(null)
  const [editId, setEditId] = useState(null)
  const [editAmount, setEditAmount] = useState('')
  const [showAddItem, setShowAddItem] = useState(false)
  const [itemForm, setItemForm] = useState({ name: '', description: '', price: '', quantity: '-1', visible: true, image_url: '' })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    getAll('stream_viewers').then(d => setViewers(d))
    getAll('store_items').then(d => setItems(d))
    getAll('store_redemptions').then(d => setRedemptions(d))
    getOne('stream_points_config').then(d => setConfig(d))
    const off1 = onTableChange('stream_viewers', () => getAll('stream_viewers').then(d => setViewers(d)))
    const off2 = onTableChange('store_items', () => getAll('store_items').then(d => setItems(d)))
    const off3 = onTableChange('store_redemptions', () => getAll('store_redemptions').then(d => setRedemptions(d)))
    return () => { off1(); off2(); off3() }
  }, [])

  const saveConfig = async () => { await setOne('stream_points_config', config) }

  const adjustPoints = async (viewerId, amount) => {
    const v = viewers.find(x => x.id === viewerId)
    if (!v) return
    const newTotal = Math.max(0, (v.total_points || 0) + amount)
    await update('stream_viewers', viewerId, { total_points: newTotal })
    await insert('points_transactions', { viewer_id: viewerId, amount: Math.abs(amount), type: amount > 0 ? 'add' : 'remove', reason: 'Manual adjustment' })
    setViewers(prev => prev.map(x => x.id === viewerId ? { ...x, total_points: newTotal } : x))
    setEditId(null)
    setEditAmount('')
  }

  const uploadImage = async (file) => {
    if (!file || !user) return null
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${user.id}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('store-images').upload(path, file, { upsert: true })
    setUploading(false)
    if (error) { console.error('Upload error:', error); return null }
    const { data } = supabase.storage.from('store-images').getPublicUrl(path)
    return data?.publicUrl || null
  }

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 512 * 1024) { alert('Max 512 KB'); return }
    const url = await uploadImage(file)
    if (url) setItemForm(p => ({ ...p, image_url: url }))
  }

  const addItem = async () => {
    if (!itemForm.name.trim() || !itemForm.price) return
    await insert('store_items', { name: itemForm.name.trim(), description: itemForm.description.trim(), price_points: Number(itemForm.price), quantity_available: Number(itemForm.quantity), visible: itemForm.visible, image_url: itemForm.image_url || '' })
    setItems(await getAll('store_items'))
    setItemForm({ name: '', description: '', price: '', quantity: '-1', visible: true, image_url: '' })
    setShowAddItem(false)
  }

  const deleteItem = async (id) => { await remove('store_items', id); setItems(prev => prev.filter(x => x.id !== id)) }

  const completeRedemption = async (id) => {
    await update('store_redemptions', id, { status: 'completed', completed_at: new Date().toISOString() })
    setRedemptions(await getAll('store_redemptions'))
  }

  const refundRedemption = async (id) => {
    await update('store_redemptions', id, { status: 'refunded' })
    setRedemptions(await getAll('store_redemptions'))
  }

  const filtered = viewers.filter(v => !search || v.username?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (b.total_points || 0) - (a.total_points || 0))

  const totalPoints = viewers.reduce((s, v) => s + (v.total_points || 0), 0)

  return (
    <div>
      {/* Action bar */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
        {config && (
          <HoverBtn onClick={() => setShowInfo(!showInfo)}
            style={{ background: showInfo ? 'rgba(212,175,55,0.12)' : 'rgba(212,175,55,0.05)', borderColor: showInfo ? 'rgba(212,175,55,0.35)' : 'rgba(212,175,55,0.12)', color: showInfo ? gold : '#4a4842' }}
            hoverStyle={{ background:'rgba(212,175,55,0.1)', borderColor:'rgba(212,175,55,0.3)', color:gold, transform:'translateY(-1px)' }}>
            <Info size={14} /> {tc.info}
          </HoverBtn>
        )}
        {!config && (
          <HoverBtn onClick={async () => { const c = { points_per_minute:1, points_per_follow:50, points_per_sub:500, is_active:true }; await setOne('stream_points_config', c); setConfig(c) }}
            style={{ background:`linear-gradient(135deg,${gold},#b8962e)`, borderColor:'rgba(212,175,55,0.4)', color:'#fff', boxShadow:'0 0 14px rgba(212,175,55,0.2)' }}
            hoverStyle={{ background:`linear-gradient(135deg,#e8c84a,${gold})`, boxShadow:'0 0 22px rgba(212,175,55,0.35)', transform:'translateY(-1px)' }}>
            <Plus size={14} /> {ts.newStreamPoints}
          </HoverBtn>
        )}
      </div>

      {!config ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'#4a4842', fontSize:13 }}>{ts.empty}</div>
      ) : <>

      {showInfo && (
        <div style={{ display:'flex', alignItems:'flex-start', gap:12, background:'rgba(212,175,55,0.04)', border:'1px solid rgba(212,175,55,0.12)', borderRadius:12, padding:'14px 18px', marginBottom:16 }}>
          <Coins size={16} style={{ color:gold, flexShrink:0, marginTop:1 }} />
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <span style={{ fontSize:12, fontWeight:600, color:gold }}>{ts.title}</span>
            <span style={{ fontSize:12, color:'#8a8478', lineHeight:1.6 }}>
              {ts.infoText}
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:20 }}>
        {[{ key:'points', label: ts.points, Icon: Coins }, { key:'store', label: ts.store, Icon: ShoppingBag }].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:9, fontSize:12, fontWeight:600, cursor:'pointer',
            background: activeTab === tab.key ? 'rgba(212,175,55,0.12)' : 'var(--input-bg)',
            border: `1px solid ${activeTab === tab.key ? 'rgba(212,175,55,0.3)' : 'rgba(212,175,55,0.06)'}`,
            color: activeTab === tab.key ? gold : '#5a5548', transition:'all 0.15s',
          }}>
            <tab.Icon size={12} /> {tab.label}
          </button>
        ))}
      </div>

      {/* ── Points Tab ────────────────────────────────────────────────── */}
      {activeTab === 'points' && (
        <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
          {/* Left: Config */}
          <div style={{ flex:'1 1 280px', display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ ...S.card, padding:20 }}>
              <span style={S.label}>{ts.pointsConfig}</span>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {[
                  { key:'points_per_minute', label: ts.pointsPerMinute },
                  { key:'points_per_follow', label: ts.pointsPerFollow },
                  { key:'points_per_sub', label: ts.pointsPerSub },
                ].map(f => (
                  <div key={f.key}>
                    <span style={{ ...S.label, marginBottom:4 }}>{f.label}</span>
                    <input className="input" type="number" value={config[f.key] || 0}
                      onChange={e => setConfig(p => ({ ...p, [f.key]: Number(e.target.value) }))} />
                  </div>
                ))}
                <HoverBtn onClick={saveConfig}
                  style={{ background:`linear-gradient(135deg,${gold},#b8962e)`, borderColor:'rgba(212,175,55,0.4)', color:'#fff', justifyContent:'center' }}
                  hoverStyle={{ boxShadow:'0 0 18px rgba(212,175,55,0.3)', transform:'translateY(-1px)' }}>
                  <Check size={14} /> {tc.save}
                </HoverBtn>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div style={{ ...S.card, padding:'12px 16px', textAlign:'center' }}>
                <div style={{ fontSize:9, color:'#4a4842', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>{ts.viewers}</div>
                <div style={{ fontSize:18, fontWeight:700, color:'#e8e2d4' }}>{viewers.length}</div>
              </div>
              <div style={{ ...S.card, padding:'12px 16px', textAlign:'center' }}>
                <div style={{ fontSize:9, color:'#4a4842', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>{ts.totalPoints}</div>
                <div style={{ fontSize:18, fontWeight:700, color:gold }}>{totalPoints.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Right: Viewer list */}
          <div style={{ flex:'2 1 400px', ...S.card, padding:20 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <span style={S.label}>{ts.viewers} ({filtered.length})</span>
              <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(212,175,55,0.06)', borderRadius:8, padding:'4px 10px' }}>
                <Search size={12} style={{ color:'#4a4842' }} />
                <input placeholder={tc.search} value={search} onChange={e => setSearch(e.target.value)}
                  style={{ background:'none', border:'none', outline:'none', color:'#e8e2d4', fontSize:11, width:120 }} />
              </div>
            </div>
            <div style={{ maxHeight:400, overflowY:'auto' }}>
              {filtered.length === 0 ? (
                <div style={{ textAlign:'center', padding:'20px 0', color:'#4a4842', fontSize:12 }}>{ts.noViewers}</div>
              ) : filtered.map(v => (
                <div key={v.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 0', borderBottom:'1px solid rgba(212,175,55,0.04)' }}>
                  <span style={{ fontSize:12, fontWeight:600, color:'#d4cfc4', flex:1 }}>{v.username}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:gold, fontVariantNumeric:'tabular-nums', width:80, textAlign:'right' }}>
                    {(v.total_points || 0).toLocaleString()}
                  </span>
                  {editId === v.id ? (
                    <div style={{ display:'flex', gap:4, alignItems:'center' }}>
                      <input type="number" value={editAmount} onChange={e => setEditAmount(e.target.value)}
                        style={{ width:60, background:'rgba(212,175,55,0.05)', border:'1px solid rgba(212,175,55,0.2)', borderRadius:6, color:'#e8e2d4', fontSize:11, padding:'3px 6px', outline:'none' }} />
                      <button onClick={() => adjustPoints(v.id, Number(editAmount))} style={{ background:'none', border:'none', cursor:'pointer', color:'#34d399', padding:0 }}><Plus size={14} /></button>
                      <button onClick={() => adjustPoints(v.id, -Number(editAmount))} style={{ background:'none', border:'none', cursor:'pointer', color:'#f87171', padding:0 }}>-</button>
                      <button onClick={() => setEditId(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'#4a4842', padding:0 }}>×</button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditId(v.id); setEditAmount('') }}
                      style={{ fontSize:10, color:gold, background:'rgba(212,175,55,0.08)', border:'1px solid rgba(212,175,55,0.15)', borderRadius:5, padding:'3px 8px', cursor:'pointer' }}>
                      {tc.edit}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Store Tab ─────────────────────────────────────────────────── */}
      {activeTab === 'store' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* Add item button */}
          <HoverBtn onClick={() => setShowAddItem(!showAddItem)}
            style={{ background:`linear-gradient(135deg,${gold},#b8962e)`, borderColor:'rgba(212,175,55,0.4)', color:'#fff', boxShadow:'0 0 14px rgba(212,175,55,0.2)', alignSelf:'flex-start' }}
            hoverStyle={{ boxShadow:'0 0 22px rgba(212,175,55,0.35)', transform:'translateY(-1px)' }}>
            <Plus size={14} /> {ts.addStoreItem}
          </HoverBtn>

          {/* Add item form */}
          {showAddItem && (
            <div style={{ ...S.card, padding:20 }}>
              <span style={S.label}>{ts.newStoreItem}</span>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
                <div><span style={{ ...S.label, marginBottom:4 }}>{ts.itemName}</span><input className="input" placeholder={ts.egItem} value={itemForm.name} onChange={e => setItemForm(p => ({ ...p, name: e.target.value }))} /></div>
                <div><span style={{ ...S.label, marginBottom:4 }}>{ts.pricePoints}</span><input className="input" type="number" placeholder="500" value={itemForm.price} onChange={e => setItemForm(p => ({ ...p, price: e.target.value }))} /></div>
                <div><span style={{ ...S.label, marginBottom:4 }}>{ts.quantity}</span><input className="input" type="number" value={itemForm.quantity} onChange={e => setItemForm(p => ({ ...p, quantity: e.target.value }))} /></div>
                <div style={{ display:'flex', alignItems:'flex-end', paddingBottom:4 }}>
                  <label style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer' }}>
                    <input type="checkbox" checked={itemForm.visible} onChange={e => setItemForm(p => ({ ...p, visible: e.target.checked }))} />
                    <span style={{ fontSize:11, color:'#8a8478' }}>{ts.visible}</span>
                  </label>
                </div>
              </div>
              <div style={{ marginBottom:12 }}>
                <span style={{ ...S.label, marginBottom:4 }}>{ts.description}</span>
                <input className="input" placeholder={ts.itemDesc} value={itemForm.description} onChange={e => setItemForm(p => ({ ...p, description: e.target.value }))} />
              </div>

              {/* Image upload */}
              <div style={{ marginBottom:12 }}>
                <span style={{ ...S.label, marginBottom:4 }}>{ts.itemImage}</span>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} style={{ display:'none' }} />
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  {itemForm.image_url ? (
                    <div style={{ position:'relative' }}>
                      <img src={itemForm.image_url} alt="" style={{ width:60, height:60, objectFit:'cover', borderRadius:10, border:'1px solid rgba(212,175,55,0.2)' }} />
                      <button onClick={() => setItemForm(p => ({ ...p, image_url: '' }))} style={{
                        position:'absolute', top:-6, right:-6, width:18, height:18, borderRadius:'50%',
                        background:'#f87171', border:'none', color:'#fff', fontSize:11, cursor:'pointer',
                        display:'flex', alignItems:'center', justifyContent:'center',
                      }}>×</button>
                    </div>
                  ) : (
                    <button onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{
                      width:60, height:60, borderRadius:10, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4,
                      background:'rgba(212,175,55,0.04)', border:'1px dashed rgba(212,175,55,0.2)',
                      cursor: uploading ? 'wait' : 'pointer', color:'#5a5548', transition:'all 0.15s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(212,175,55,0.4)'; e.currentTarget.style.background='rgba(212,175,55,0.08)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(212,175,55,0.2)'; e.currentTarget.style.background='rgba(212,175,55,0.04)' }}>
                      {uploading ? <div style={{ width:14, height:14, border:'2px solid rgba(212,175,55,0.3)', borderTopColor:gold, borderRadius:'50%', animation:'spin 1s linear infinite' }} /> : <Upload size={14} />}
                      <span style={{ fontSize:8 }}>{uploading ? '...' : 'Upload'}</span>
                    </button>
                  )}
                  <span style={{ fontSize:10, color:'#4a4842' }}>{ts.imageHint}</span>
                </div>
              </div>

              <HoverBtn onClick={addItem} disabled={!itemForm.name.trim() || !itemForm.price}
                style={{ background:`linear-gradient(135deg,${gold},#b8962e)`, borderColor:'rgba(212,175,55,0.4)', color:'#fff', opacity: (!itemForm.name.trim() || !itemForm.price) ? 0.5 : 1 }}
                hoverStyle={{ boxShadow:'0 0 18px rgba(212,175,55,0.3)', transform:'translateY(-1px)' }}>
                <Check size={14} /> {ts.createItem}
              </HoverBtn>
            </div>
          )}

          {/* Items list */}
          <div style={{ ...S.card, padding:20 }}>
            <span style={S.label}>{ts.storeItems} ({items.length})</span>
            {items.length === 0 ? (
              <div style={{ textAlign:'center', padding:'20px 0', color:'#4a4842', fontSize:12 }}>{ts.noStoreItems}</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {items.map(item => (
                  <div key={item.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:10, background:'rgba(212,175,55,0.02)', border:'1px solid rgba(212,175,55,0.06)' }}>
                    {item.image_url ? (
                      <img src={item.image_url} alt="" style={{ width:36, height:36, objectFit:'cover', borderRadius:8, flexShrink:0, border:'1px solid rgba(212,175,55,0.15)' }} />
                    ) : (
                      <Gift size={16} style={{ color:gold, flexShrink:0 }} />
                    )}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:'#e8e2d4' }}>{item.name}</div>
                      {item.description && <div style={{ fontSize:10, color:'#5a5548', marginTop:2 }}>{item.description}</div>}
                    </div>
                    <span style={{ fontSize:13, fontWeight:700, color:gold, flexShrink:0 }}>{item.price_points} pts</span>
                    <span style={{ fontSize:10, color:'#5a5548', flexShrink:0 }}>
                      {item.quantity_available === -1 ? ts.unlimited : `${item.quantity_available} ${ts.left}`}
                    </span>
                    <span style={{ fontSize:10, padding:'2px 6px', borderRadius:4, background: item.visible ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)', color: item.visible ? '#34d399' : '#f87171', border: `1px solid ${item.visible ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`, flexShrink:0 }}>
                      {item.visible ? ts.visible : ts.hidden}
                    </span>
                    <button onClick={() => deleteItem(item.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#4a4842', padding:0, flexShrink:0 }}
                      onMouseEnter={e => e.currentTarget.style.color='#f87171'} onMouseLeave={e => e.currentTarget.style.color='#4a4842'}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Redemptions */}
          {redemptions.length > 0 && (
            <div style={{ ...S.card, padding:20 }}>
              <span style={S.label}>{ts.redemptions} ({redemptions.length})</span>
              <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                {redemptions.map(r => {
                  const item = items.find(i => i.id === r.item_id)
                  return (
                    <div key={r.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 0', borderBottom:'1px solid rgba(212,175,55,0.04)' }}>
                      <span style={{ fontSize:12, fontWeight:600, color:'#d4cfc4', flex:1 }}>{r.viewer_username}</span>
                      <span style={{ fontSize:11, color:'#5a5548' }}>{item?.name || '?'}</span>
                      <span style={{
                        fontSize:9, fontWeight:700, padding:'2px 8px', borderRadius:4, textTransform:'uppercase',
                        background: r.status === 'completed' ? 'rgba(52,211,153,0.1)' : r.status === 'refunded' ? 'rgba(248,113,113,0.1)' : 'rgba(251,191,36,0.1)',
                        color: r.status === 'completed' ? '#34d399' : r.status === 'refunded' ? '#f87171' : '#fbbf24',
                        border: `1px solid ${r.status === 'completed' ? 'rgba(52,211,153,0.2)' : r.status === 'refunded' ? 'rgba(248,113,113,0.2)' : 'rgba(251,191,36,0.2)'}`,
                      }}>{r.status === 'completed' ? ts.completed : r.status === 'refunded' ? ts.refunded : ts.pending}</span>
                      {r.status === 'pending' && (
                        <div style={{ display:'flex', gap:4 }}>
                          <button onClick={() => completeRedemption(r.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#34d399', padding:0 }}><Check size={13} /></button>
                          <button onClick={() => refundRedemption(r.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#f87171', padding:0 }}>↩</button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
      </>}
    </div>
  )
}
