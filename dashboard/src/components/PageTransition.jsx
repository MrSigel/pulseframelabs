import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const TRANSITION_MS = 500

export default function PageTransition({ children }) {
  const location = useLocation()
  const [phase, setPhase] = useState('visible')     // 'visible' | 'blurring' | 'revealing'
  const [displayChildren, setDisplayChildren] = useState(children)
  const prevPath = useRef(location.pathname)

  useEffect(() => {
    if (location.pathname === prevPath.current) {
      setDisplayChildren(children)
      return
    }
    prevPath.current = location.pathname

    // Phase 1: blur out current content
    setPhase('blurring')

    const t1 = setTimeout(() => {
      // Phase 2: swap content and reveal
      setDisplayChildren(children)
      setPhase('revealing')
    }, TRANSITION_MS / 2)

    const t2 = setTimeout(() => {
      setPhase('visible')
    }, TRANSITION_MS)

    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [location.pathname, children])

  const style = {
    transition: `filter ${TRANSITION_MS / 2}ms ease, opacity ${TRANSITION_MS / 2}ms ease`,
    filter: phase === 'blurring' ? 'blur(8px)' : phase === 'revealing' ? 'blur(4px)' : 'blur(0px)',
    opacity: phase === 'blurring' ? 0.25 : phase === 'revealing' ? 0.7 : 1,
    minHeight: '100%',
  }

  return <div style={style}>{displayChildren}</div>
}
