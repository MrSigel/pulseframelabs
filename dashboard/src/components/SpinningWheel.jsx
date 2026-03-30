import { useState, useRef, useCallback } from 'react'

const SEGMENT_COLORS = [
  '#6366f1', '#8b5cf6', '#3b82f6', '#22d3ee', '#34d399',
  '#ec4899', '#fb923c', '#ef4444', '#a78bfa', '#14b8a6',
  '#f59e0b', '#6d28d9', '#059669', '#e11d48', '#0ea5e9',
  '#d946ef',
]

export default function SpinningWheel({ participants, selectCount, onComplete, onClose }) {
  const [phase, setPhase] = useState('ready') // 'ready' | 'spinning' | 'revealing' | 'done'
  const [selected, setSelected] = useState([])
  const [currentDisplay, setCurrentDisplay] = useState('')
  const [currentHighlight, setCurrentHighlight] = useState(false)
  const [spinLabel, setSpinLabel] = useState('')
  const cancelRef = useRef(false)

  const effectiveCount = Math.min(selectCount, participants.length)

  const startSpin = useCallback(() => {
    setPhase('spinning')
    setSelected([])
    cancelRef.current = false
    spinNext([...participants], [], 0)
  }, [participants, selectCount])

  const spinNext = (pool, alreadySelected, round) => {
    if (cancelRef.current) return
    if (alreadySelected.length >= effectiveCount || pool.length === 0) {
      setPhase('done')
      setCurrentDisplay('')
      setCurrentHighlight(false)
      return
    }

    setSpinLabel(`Selecting ${round + 1} / ${effectiveCount}`)
    setCurrentHighlight(false)

    let ticks = 0
    const totalTicks = 30 + Math.floor(Math.random() * 10)

    const interval = () => {
      if (cancelRef.current) return
      ticks++
      const rand = pool[Math.floor(Math.random() * pool.length)]
      setCurrentDisplay(rand.username)

      if (ticks >= totalTicks) {
        // Pick winner
        const winnerIndex = Math.floor(Math.random() * pool.length)
        const winner = pool[winnerIndex]
        setCurrentDisplay(winner.username)
        setCurrentHighlight(true)
        const newSelected = [...alreadySelected, winner]
        setSelected(newSelected)

        // Remove from pool and spin next after delay
        const newPool = pool.filter((_, i) => i !== winnerIndex)
        setTimeout(() => {
          if (!cancelRef.current) {
            spinNext(newPool, newSelected, round + 1)
          }
        }, 1000)
        return
      }

      // Increasing delay for deceleration effect
      const delay = ticks < 10 ? 40 : ticks < 20 ? 80 : ticks < 27 ? 160 : 280
      setTimeout(interval, delay)
    }
    setTimeout(interval, 40)
  }

  const handleClose = () => {
    cancelRef.current = true
    onClose()
  }

  const handleDone = () => {
    cancelRef.current = true
    onComplete(selected)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fade-up 0.25s ease-out',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #14142a, #111126)',
        border: '1px solid rgba(139,92,246,0.3)',
        borderRadius: 18,
        padding: 32,
        width: '90%',
        maxWidth: 560,
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(139,92,246,0.15)',
        position: 'relative',
      }}>
        {/* Close X */}
        <button onClick={handleClose} style={{
          position: 'absolute', top: 12, right: 14,
          background: 'none', border: 'none', color: '#44447a',
          fontSize: 20, cursor: 'pointer', padding: '4px 8px',
          lineHeight: 1, transition: 'color 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
          onMouseLeave={e => e.currentTarget.style.color = '#44447a'}
        >
          x
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            fontSize: 22, fontWeight: 800, color: '#e2e8f0',
            letterSpacing: '0.04em',
          }}>
            Lucky Wheel
          </div>
          <div style={{ fontSize: 12, color: '#6060a0', marginTop: 4 }}>
            {effectiveCount} of {participants.length} participants to select
          </div>
        </div>

        {/* Spinning display area */}
        <div style={{
          background: 'rgba(10,10,20,0.8)',
          border: '1px solid rgba(139,92,246,0.2)',
          borderRadius: 14,
          padding: '28px 20px',
          marginBottom: 20,
          textAlign: 'center',
          minHeight: 100,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {phase === 'ready' && (
            <div style={{ color: '#44447a', fontSize: 14 }}>
              Press "Spin" to start
            </div>
          )}

          {(phase === 'spinning' || (phase === 'done' && !currentDisplay)) && phase !== 'ready' && (
            <>
              {spinLabel && (
                <div style={{
                  fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.15em', color: '#6366f1', marginBottom: 10,
                }}>
                  {phase === 'done' ? 'Done!' : spinLabel}
                </div>
              )}
              {currentDisplay && (
                <div style={{
                  fontSize: 32, fontWeight: 800, color: currentHighlight ? '#fbbf24' : '#e2e8f0',
                  textShadow: currentHighlight
                    ? '0 0 20px rgba(251,191,36,0.6), 0 0 40px rgba(251,191,36,0.3)'
                    : '0 0 10px rgba(99,102,241,0.3)',
                  transition: 'color 0.15s, text-shadow 0.15s',
                  letterSpacing: '0.02em',
                }}>
                  {currentDisplay}
                </div>
              )}
            </>
          )}

          {phase === 'done' && (
            <div style={{
              fontSize: 16, fontWeight: 700, color: '#34d399',
              textShadow: '0 0 12px rgba(52,211,153,0.4)',
            }}>
              All selected!
            </div>
          )}

          {/* Decorative spinning indicator */}
          {phase === 'spinning' && !currentHighlight && (
            <div style={{
              position: 'absolute', top: 8, right: 12,
              width: 10, height: 10, borderRadius: '50%',
              border: '2px solid #6366f1',
              borderTopColor: 'transparent',
              animation: 'spin 0.6s linear infinite',
            }} />
          )}
        </div>

        {/* Selected list */}
        {selected.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.15em', color: '#44447a', marginBottom: 8,
            }}>
              Selected ({selected.length} / {effectiveCount})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {selected.map((p, i) => (
                <div key={p.username} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '5px 10px', borderRadius: 8,
                  background: 'rgba(52,211,153,0.12)',
                  border: '1px solid rgba(52,211,153,0.3)',
                  animation: 'fade-up 0.2s ease-out',
                  animationFillMode: 'both',
                }}>
                  <span style={{
                    width: 14, height: 14, borderRadius: '50%',
                    background: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 8, fontWeight: 800, color: '#fff', flexShrink: 0,
                  }}>
                    {i + 1}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>
                    {p.username}
                  </span>
                  <span style={{ fontSize: 10, color: '#34d399' }}>
                    &#10003;
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Participant pool preview */}
        {phase === 'ready' && (
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.15em', color: '#44447a', marginBottom: 8,
            }}>
              Participant Pool ({participants.length})
            </div>
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 4,
              maxHeight: 120, overflow: 'auto',
            }}>
              {participants.map((p, i) => (
                <span key={p.username} style={{
                  padding: '3px 8px', borderRadius: 6, fontSize: 11,
                  background: 'rgba(99,102,241,0.08)',
                  border: '1px solid rgba(99,102,241,0.15)',
                  color: '#9090c0',
                }}>
                  {p.username}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
          {phase === 'ready' && (
            <button onClick={startSpin} style={{
              padding: '12px 32px', borderRadius: 12,
              background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              border: '1px solid rgba(139,92,246,0.5)',
              color: '#fff', fontSize: 15, fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: '0 0 20px rgba(139,92,246,0.3)',
              letterSpacing: '0.04em',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 0 30px rgba(139,92,246,0.5)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '0 0 20px rgba(139,92,246,0.3)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              Spin
            </button>
          )}

          {phase === 'spinning' && (
            <div style={{
              padding: '10px 24px', borderRadius: 10,
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.2)',
              color: '#818cf8', fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <div style={{
                width: 12, height: 12, borderRadius: '50%',
                border: '2px solid #818cf8',
                borderTopColor: 'transparent',
                animation: 'spin 0.6s linear infinite',
              }} />
              Spinning...
            </div>
          )}

          {phase === 'done' && (
            <button onClick={handleDone} style={{
              padding: '12px 32px', borderRadius: 12,
              background: 'linear-gradient(135deg, #059669, #047857)',
              border: '1px solid rgba(52,211,153,0.5)',
              color: '#fff', fontSize: 15, fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: '0 0 20px rgba(52,211,153,0.3)',
              letterSpacing: '0.04em',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 0 30px rgba(52,211,153,0.5)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '0 0 20px rgba(52,211,153,0.3)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              Done
            </button>
          )}
        </div>
      </div>

      {/* Inline keyframes for spin animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
