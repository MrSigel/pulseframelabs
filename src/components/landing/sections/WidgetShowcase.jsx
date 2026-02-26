"use client";

import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/landing/ui/GlassCard';
import RevealText from '@/components/landing/ui/RevealText';
import { useLanguage } from '@/context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

// ── Data ────────────────────────────────────────────────
const bonusHuntData = {
  title: 'Bonus Hunt #5', opened: '3/12 opened',
  buyins: '2,500$', totalWin: '8,340$', bestX: '187x', biggestWin: '4,200$',
  slots: [
    { pos: 1, name: 'Sweet Bonanza', bet: '2.5$', win: '4,200$', multi: '187x' },
    { pos: 2, name: 'Gates of Olympus', bet: '2.5$', win: '1,850$', multi: '74x' },
    { pos: 3, name: 'Big Bass Bonanza', bet: '2.5$', win: '960$', multi: '38x' },
    { pos: 4, name: 'Wanted Dead or a Wild', bet: '2.5$', win: '525$', multi: '21x' },
    { pos: 5, name: 'Razor Shark', bet: '2.5$', win: '480$', multi: '19x' },
    { pos: 6, name: 'Fruit Party', bet: '2.5$', win: '350$', multi: '14x' },
    { pos: 7, name: 'The Dog House', bet: '2.5$', win: '290$', multi: '11x' },
    { pos: 8, name: 'Starlight Princess', bet: '2.5$', win: '210$', multi: '8x' },
  ],
};
const battleData = { round: 'Round 3', status: 'Round 3 - running', left: { name: 'Sweet Bonanza', score: 847 }, right: { name: 'Gates of Olympus', score: 623 } };
const tournamentData = [
  { pos: 1, name: 'SlotKing99', score: 2840 }, { pos: 2, name: 'BigWinMax', score: 1950 },
  { pos: 3, name: 'CasinoQueen', score: 1720 }, { pos: 4, name: 'LuckyRoller', score: 1340 },
  { pos: 5, name: 'GoldSpinner', score: 980 }, { pos: 6, name: 'NightOwl77', score: 870 },
  { pos: 7, name: 'AceHigh', score: 760 }, { pos: 8, name: 'StreamLord', score: 650 },
  { pos: 9, name: 'SpinMaster', score: 540 }, { pos: 10, name: 'DiamondDave', score: 430 },
];
// widgetTypes now comes from translations
const quickGuessData = [
  { name: 'SlotFan99', value: '1500' }, { name: 'BigWinMax', value: '2800' },
  { name: 'CasinoQueen', value: '750' }, { name: 'LuckyRoller', value: '3200' },
  { name: 'GoldSpinner', value: '1100' }, { name: 'NightOwl77', value: '2100' },
  { name: 'AceHigh', value: '1800' }, { name: 'StreamLord', value: '950' },
];
const slotRequestData = [
  { slot: 'Sweet Bonanza', user: 'SlotKing99' }, { slot: 'Book of Dead', user: 'BigWinMax' },
  { slot: 'Wanted Dead or a Wild', user: 'CasinoQueen' }, { slot: 'Reactoonz', user: 'LuckyRoller' },
  { slot: 'Dog House', user: 'GoldSpinner' }, { slot: 'Razor Shark', user: 'NightOwl77' },
  { slot: 'Fruit Party', user: 'AceHigh' }, { slot: 'Buffalo King', user: 'StreamLord' },
];
const pointsBattleData = { status: 'running', entry: '100 pts/entry', left: { name: 'Red Dragons', points: 12400, members: 47 }, right: { name: 'Blue Wolves', points: 9850, members: 38 } };
const nowPlayingData = { game: 'Sweet Bonanza', provider: 'Pragmatic Play', bestWin: '4,200$', bestX: '187x', potential: '5000x', rtp: '96.50%' };
const hotWordsData = [{ word: '!points', hits: 147 }, { word: 'lets go!', hits: 89 }, { word: '!guess', hits: 73 }, { word: '!slotrequest', hits: 61 }, { word: 'POGCHAMP', hits: 55 }];

// ── Styles ──────────────────────────────────────────────
const labelStyle = { fontFamily: "'Inter', sans-serif", fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-tertiary)' };
const valueStyle = { fontFamily: "'Playfair Display', serif", fontWeight: 600, color: 'var(--text-primary)' };
const accentValue = { ...valueStyle, color: 'var(--gold)' };
const listRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.8rem' };

// ── Animation helpers ───────────────────────────────────
function useCycleIndex(maxIndex, intervalMs) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (maxIndex <= 0) return;
    const id = setInterval(() => setIndex(prev => (prev + 1) % maxIndex), intervalMs);
    return () => clearInterval(id);
  }, [maxIndex, intervalMs]);
  return index;
}

const rowVariants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -18 },
};
const rowTransition = { duration: 0.35, ease: [0.4, 0, 0.2, 1] };

// ── Cards ───────────────────────────────────────────────

function BonusHuntCard() {
  const { t } = useLanguage();
  const windowSize = 4;
  const maxOffset = bonusHuntData.slots.length - windowSize + 1;
  const offset = useCycleIndex(maxOffset, 3000);
  const visible = bonusHuntData.slots.slice(offset, offset + windowSize);

  return (
    <GlassCard style={{ gridColumn: 'span 2' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h4 style={{ ...valueStyle, fontSize: '1.1rem' }}>{bonusHuntData.title}</h4>
        <span style={{ ...labelStyle, color: 'var(--gold)' }}>{bonusHuntData.opened}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
        {[[t.widgets.buyins, bonusHuntData.buyins], [t.widgets.totalWin, bonusHuntData.totalWin], [t.widgets.bestX, bonusHuntData.bestX], [t.widgets.biggestWin, bonusHuntData.biggestWin]].map(([label, val]) => (
          <div key={label} style={{ padding: '12px', borderRadius: '6px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
            <div style={labelStyle}>{label}</div>
            <div style={{ ...accentValue, fontSize: '0.9rem', marginTop: '4px' }}>{val}</div>
          </div>
        ))}
      </div>
      <div style={{ overflow: 'hidden', minHeight: '132px' }}>
        <AnimatePresence mode="popLayout">
          {visible.map(s => (
            <motion.div key={s.pos} variants={rowVariants} initial="initial" animate="animate" exit="exit" transition={rowTransition} layout style={listRow}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{s.pos}. {s.name} ({s.bet})</span>
              <span style={{ ...accentValue, fontSize: '0.8rem' }}>{s.win} ({s.multi})</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}

function BattleCard() {
  const [leftScore, setLeftScore] = useState(battleData.left.score);
  const [rightScore, setRightScore] = useState(battleData.right.score);

  useEffect(() => {
    const id = setInterval(() => {
      setLeftScore(prev => prev + Math.floor(Math.random() * 30 - 10));
      setRightScore(prev => prev + Math.floor(Math.random() * 30 - 10));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const pct = Math.round(leftScore / (leftScore + rightScore) * 100);

  return (
    <GlassCard>
      <div style={labelStyle}>{battleData.status}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '16px 0', gap: '12px' }}>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ ...valueStyle, fontSize: '0.82rem', marginBottom: '4px' }}>{battleData.left.name}</div>
          <motion.div key={leftScore} initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 0.4 }} style={{ ...accentValue, fontSize: '1.4rem' }}>
            {leftScore}
          </motion.div>
        </div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--rose)', fontFamily: "'Inter', sans-serif", letterSpacing: '0.1em' }}>VS</div>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ ...valueStyle, fontSize: '0.82rem', marginBottom: '4px' }}>{battleData.right.name}</div>
          <motion.div key={rightScore} initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 0.4 }} style={{ ...accentValue, fontSize: '1.4rem' }}>
            {rightScore}
          </motion.div>
        </div>
      </div>
      <div style={{ height: '2px', borderRadius: '1px', background: 'var(--bg-card)', overflow: 'hidden' }}>
        <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeInOut' }} style={{ height: '100%', background: 'var(--gradient-gold)', borderRadius: '1px' }} />
      </div>
    </GlassCard>
  );
}

function TournamentCard() {
  const { t } = useLanguage();
  const windowSize = 5;
  const maxOffset = tournamentData.length - windowSize + 1;
  const offset = useCycleIndex(maxOffset, 3500);
  const visible = tournamentData.slice(offset, offset + windowSize);

  return (
    <GlassCard>
      <div style={{ ...labelStyle, marginBottom: '14px' }}>{t.widgets.viewerTournament}</div>
      <div style={{ overflow: 'hidden', minHeight: '185px' }}>
        <AnimatePresence mode="popLayout">
          {visible.map(e => (
            <motion.div key={e.pos} variants={rowVariants} initial="initial" animate="animate" exit="exit" transition={rowTransition} layout style={listRow}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, background: e.pos <= 3 ? 'var(--accent-glow)' : 'var(--bg-card)', color: e.pos <= 3 ? 'var(--gold)' : 'var(--text-tertiary)', border: e.pos <= 3 ? '1px solid var(--border-gold)' : '1px solid var(--border-subtle)' }}>{e.pos}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{e.name}</span>
              </span>
              <span style={{ ...accentValue, fontSize: '0.85rem' }}>{e.score}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}

function QuickGuessCard() {
  const { t } = useLanguage();
  const windowSize = 5;
  const maxOffset = quickGuessData.length - windowSize + 1;
  const offset = useCycleIndex(maxOffset, 2800);
  const visible = quickGuessData.slice(offset, offset + windowSize);

  return (
    <GlassCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <span style={labelStyle}>{t.widgets.quickGuessing}</span>
        <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '3px 10px', borderRadius: '4px', background: 'var(--accent-glow)', color: 'var(--gold)', border: '1px solid var(--border-gold)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{t.widgets.open}</span>
      </div>
      <div style={{ overflow: 'hidden', minHeight: '185px' }}>
        <AnimatePresence mode="popLayout">
          {visible.map((e, i) => (
            <motion.div key={`${e.name}-${offset + i}`} variants={rowVariants} initial="initial" animate="animate" exit="exit" transition={rowTransition} layout style={listRow}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{e.name}</span>
              <span style={{ ...accentValue, fontSize: '0.8rem' }}>{e.value}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}

function SlotRequestCard() {
  const { t } = useLanguage();
  const windowSize = 5;
  const maxOffset = slotRequestData.length - windowSize + 1;
  const offset = useCycleIndex(maxOffset, 3200);
  const visible = slotRequestData.slice(offset, offset + windowSize);

  return (
    <GlassCard>
      <div style={{ ...labelStyle, marginBottom: '14px' }}>{t.widgets.slotRequests}</div>
      <div style={{ overflow: 'hidden', minHeight: '185px' }}>
        <AnimatePresence mode="popLayout">
          {visible.map((e, i) => (
            <motion.div key={`${e.slot}-${offset + i}`} variants={rowVariants} initial="initial" animate="animate" exit="exit" transition={rowTransition} layout style={listRow}>
              <span style={{ color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 500 }}>{e.slot}</span>
              <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>{e.user}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}

function PointsBattleCard() {
  const { t } = useLanguage();
  const [leftPts, setLeftPts] = useState(pointsBattleData.left.points);
  const [rightPts, setRightPts] = useState(pointsBattleData.right.points);

  useEffect(() => {
    const id = setInterval(() => {
      setLeftPts(prev => prev + Math.floor(Math.random() * 200 + 50));
      setRightPts(prev => prev + Math.floor(Math.random() * 200 + 50));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const total = leftPts + rightPts;
  const pct = Math.round(leftPts / total * 100);

  return (
    <GlassCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={labelStyle}>{t.widgets.pointsBattle}</span>
        <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '3px 10px', borderRadius: '4px', background: 'rgba(183, 110, 121, 0.1)', color: 'var(--rose)', border: '1px solid rgba(183, 110, 121, 0.2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{t.widgets.running}</span>
      </div>
      <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '12px' }}>{t.widgets.entry}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div>
          <div style={{ ...valueStyle, fontSize: '0.82rem', color: 'var(--gold)' }}>{pointsBattleData.left.name}</div>
          <motion.div key={leftPts} initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 0.4 }} style={{ fontSize: '1.1rem', ...accentValue }}>
            {leftPts.toLocaleString()}
          </motion.div>
          <div style={{ ...labelStyle, fontSize: '0.55rem' }}>{pointsBattleData.left.members} {t.widgets.members}</div>
        </div>
        <div style={{ fontWeight: 700, color: 'var(--rose)', fontSize: '0.7rem', alignSelf: 'center', letterSpacing: '0.1em' }}>VS</div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ ...valueStyle, fontSize: '0.82rem', color: 'var(--champagne)' }}>{pointsBattleData.right.name}</div>
          <motion.div key={rightPts} initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 0.4 }} style={{ fontSize: '1.1rem', ...accentValue }}>
            {rightPts.toLocaleString()}
          </motion.div>
          <div style={{ ...labelStyle, fontSize: '0.55rem' }}>{pointsBattleData.right.members} {t.widgets.members}</div>
        </div>
      </div>
      <div style={{ height: '2px', borderRadius: '1px', background: 'var(--bg-card)', overflow: 'hidden' }}>
        <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeInOut' }} style={{ height: '100%', background: 'var(--gradient-gold)', borderRadius: '1px' }} />
      </div>
    </GlassCard>
  );
}

function NowPlayingCard() {
  const { t } = useLanguage();
  const fields = [[t.widgets.currentGame, nowPlayingData.game], [t.widgets.provider, nowPlayingData.provider], [t.widgets.bestWin, nowPlayingData.bestWin], [t.widgets.bestX, nowPlayingData.bestX], [t.widgets.potential, nowPlayingData.potential], ['RTP', nowPlayingData.rtp]];
  const activeIndex = useCycleIndex(fields.length, 2500);

  return (
    <GlassCard>
      <div style={{ ...labelStyle, marginBottom: '14px' }}>{t.widgets.nowPlaying}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {fields.map(([label, val], i) => (
          <motion.div
            key={label}
            animate={{
              borderColor: i === activeIndex ? 'var(--border-gold)' : 'var(--border-subtle)',
              boxShadow: i === activeIndex ? '0 0 12px rgba(201, 168, 76, 0.15)' : '0 0 0px rgba(201, 168, 76, 0)',
            }}
            transition={{ duration: 0.5 }}
            style={{ padding: '10px', borderRadius: '6px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
          >
            <div style={{ ...labelStyle, fontSize: '0.55rem' }}>{label}</div>
            <div style={{ ...accentValue, fontSize: '0.82rem', marginTop: '3px' }}>{val}</div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}

function HotWordsCard() {
  const { t } = useLanguage();
  const [hits, setHits] = useState(hotWordsData.map(e => e.hits));
  const [activeWord, setActiveWord] = useState(-1);

  useEffect(() => {
    const id = setInterval(() => {
      const idx = Math.floor(Math.random() * hotWordsData.length);
      setHits(prev => {
        const next = [...prev];
        next[idx] += Math.floor(Math.random() * 5 + 1);
        return next;
      });
      setActiveWord(idx);
    }, 1500);
    return () => clearInterval(id);
  }, []);

  return (
    <GlassCard>
      <div style={{ ...labelStyle, marginBottom: '14px' }}>{t.widgets.hotWords}</div>
      {hotWordsData.map((e, i) => (
        <motion.div
          key={i}
          animate={{ backgroundColor: i === activeWord ? 'rgba(201, 168, 76, 0.08)' : 'rgba(201, 168, 76, 0)' }}
          transition={{ duration: 0.4 }}
          style={{ ...listRow, gap: '8px', borderRadius: '4px', padding: '7px 4px' }}
        >
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gold)', fontFamily: "'JetBrains Mono', monospace" }}>{e.word}</span>
          <motion.span key={hits[i]} initial={{ scale: 1.2 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }} style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
            {hits[i]} {t.widgets.hits}
          </motion.span>
        </motion.div>
      ))}
    </GlassCard>
  );
}

// ── Main Section ────────────────────────────────────────

function WidgetTag({ label, index }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={{
        borderColor: hovered ? 'var(--border-gold)' : 'var(--border-subtle)',
        backgroundColor: hovered ? 'var(--bg-card-hover)' : 'var(--bg-card)',
        color: hovered ? 'var(--gold)' : 'var(--text-secondary)',
      }}
      transition={{ duration: 0.25 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.72rem',
        fontWeight: 500,
        padding: '8px 18px',
        borderRadius: '6px',
        border: '1px solid var(--border-subtle)',
        color: 'var(--text-secondary)',
        background: 'var(--bg-card)',
        fontFamily: "'Inter', sans-serif",
        letterSpacing: '0.03em',
        cursor: 'default',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{
        width: '5px',
        height: '5px',
        borderRadius: '50%',
        background: hovered ? 'var(--gold)' : 'var(--border-gold)',
        transition: 'background 0.25s',
        flexShrink: 0,
      }} />
      {label}
    </motion.span>
  );
}

export default function WidgetShowcase() {
  const { t } = useLanguage();
  const sectionRef = useRef(null);
  const cardsRef = useRef(null);

  useEffect(() => {
    const cards = cardsRef.current;
    if (!cards) return;
    const cardEls = cards.querySelectorAll(':scope > div');
    gsap.fromTo(cardEls, { y: 50, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.9, stagger: 0.07, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', toggleActions: 'play none none reverse' },
    });
  }, []);

  return (
    <section id="widgets" ref={sectionRef} className="section" style={{ padding: 'clamp(100px, 14vw, 180px) 0', position: 'relative' }}>
      {/* Header — centered */}
      <div className="container" style={{ textAlign: 'center', marginBottom: 'clamp(36px, 5vw, 56px)' }}>
        <RevealText as="div" style={{ marginBottom: '16px' }}>
          <span className="text-label" style={{ color: 'var(--gold)', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '30px', height: '1px', background: 'var(--gradient-gold)' }} />
            {t.widgets.label}
            <span style={{ width: '30px', height: '1px', background: 'var(--gradient-gold)' }} />
          </span>
        </RevealText>
        <RevealText as="h2" delay={0.1} className="text-display font-display">
          {t.widgets.title}
        </RevealText>
        <RevealText as="p" delay={0.2} className="text-body" style={{ color: 'var(--text-secondary)', maxWidth: '550px', margin: '20px auto 0' }}>
          {t.widgets.subtitle}
        </RevealText>
        <div style={{ width: '60px', height: '1px', background: 'var(--gradient-gold)', margin: '28px auto 0', opacity: 0.6 }} />
      </div>

      {/* Widget type tags — centered with hover effects */}
      <div className="container" style={{ marginBottom: 'clamp(40px, 5vw, 64px)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
          {t.widgets.types.map((wt, i) => (
            <WidgetTag key={wt} label={wt} index={i} />
          ))}
        </div>
      </div>

      {/* Widget cards grid */}
      <div className="container-wide">
        <div ref={cardsRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 'clamp(12px, 2vw, 20px)' }}>
          <BonusHuntCard /><BattleCard /><TournamentCard /><QuickGuessCard />
          <SlotRequestCard /><PointsBattleCard /><NowPlayingCard /><HotWordsCard />
        </div>
      </div>
    </section>
  );
}
