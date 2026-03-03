"use client";

import { Suspense, useEffect, useState } from "react";
import { useOverlayUid } from "@/hooks/useOverlayUid";
import { useOverlayData } from "@/hooks/useOverlayData";
import { useGlobalCurrency, currencySymbol } from "@/hooks/useGlobalCurrency";
import type { Bonushunt, BonushuntEntry } from "@/lib/supabase/types";

/* ------------------------------------------------------------------ */
/* Data interfaces                                                       */
/* ------------------------------------------------------------------ */

interface WagerSession {
  casino_name: string;
  wager_amount: number;
  wagered_amount: number;
  deposit_amount: number;
  currency: string;
}

interface TournamentRow {
  name: string;
  status: string;
  participant_count: number;
}

interface GameRow {
  name: string;
  provider: string;
}

/* ------------------------------------------------------------------ */
/* Widget: Wager Bar (small)                                             */
/* ------------------------------------------------------------------ */

function WagerWidget({ session, sym }: { session: WagerSession; sym: string }) {
  const wager = session.wager_amount;
  const wagered = session.wagered_amount;
  const left = Math.max(0, wager - wagered);
  const pct = wager > 0 ? Math.min(100, (wagered / wager) * 100) : 0;
  const currency = session.currency ? currencySymbol(session.currency) : sym;

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        minWidth: "380px",
        padding: "10px 14px",
        background: "linear-gradient(135deg, rgba(12,16,24,0.75) 0%, rgba(17,24,39,0.75) 50%, rgba(12,16,24,0.75) 100%)",
        border: "1px solid rgba(239,68,68,0.15)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.25), 0 0 20px rgba(239,68,68,0.06)",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-xs tracking-wide" style={{ color: "#ef4444" }}>
          WAGER: {currency}{wager.toLocaleString()}
        </span>
        <div className="flex items-center gap-3 text-[11px]">
          <span style={{ color: "#94a3b8" }}>
            LEFT:{" "}
            <span className="text-white font-semibold">
              {currency}{left.toLocaleString()}
            </span>
          </span>
          <span
            className="font-semibold px-2 py-0.5 rounded text-[10px]"
            style={{
              background: pct > 50 ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
              color: pct > 50 ? "#10b981" : "#ef4444",
            }}
          >
            {pct.toFixed(1)}%
          </span>
        </div>
      </div>
      <div className="h-1 rounded-full mb-2 overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #ef4444, #f97316)",
            transition: "width 1s ease-in-out",
          }}
        />
      </div>
      <div className="flex items-center gap-2">
        <span
          className="font-bold text-[10px] tracking-wider px-2 py-0.5 rounded"
          style={{
            background: "rgba(239,68,68,0.12)",
            color: "#ef4444",
            border: "1px solid rgba(239,68,68,0.2)",
          }}
        >
          {session.casino_name.toUpperCase()}
        </span>
        <span className="text-slate-500 text-[10px]">
          {currency}{wagered.toLocaleString()} wagered
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Widget: Bonushunt (small)                                             */
/* ------------------------------------------------------------------ */

function BonushuntWidget({
  hunt,
  entries,
  sym,
}: {
  hunt: Bonushunt;
  entries: BonushuntEntry[];
  sym: string;
}) {
  const currency = hunt.currency ? currencySymbol(hunt.currency) : sym;
  const totalBuyIn = entries.reduce((s, e) => s + e.buy_in, 0);
  const played = entries.filter((e) => e.win_amount > 0).length;
  const totalWin = entries.reduce((s, e) => s + e.win_amount, 0);
  const current = entries.find((e) => e.win_amount === 0);

  return (
    <div
      className="rounded-lg overflow-hidden flex items-center"
      style={{
        minWidth: "340px",
        background: "linear-gradient(135deg, rgba(12,16,24,0.75) 0%, rgba(17,24,39,0.75) 50%, rgba(12,16,24,0.75) 100%)",
        border: "1px solid rgba(239,68,68,0.15)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.25), 0 0 20px rgba(239,68,68,0.06)",
      }}
    >
      <div
        className="h-[60px] w-[60px] shrink-0 flex items-center justify-center"
        style={{ background: "rgba(239,68,68,0.08)", borderRight: "1px solid rgba(255,255,255,0.04)" }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      </div>
      <div className="px-3 py-2 flex-1">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span
            className="font-bold text-xs"
            style={{
              background: "linear-gradient(90deg, #ef4444, #f97316)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {hunt.name}
          </span>
          <span className="text-[10px] text-slate-500">
            {played}/{entries.length} done
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span style={{ color: "#64748b" }}>
            Buy-In: <span className="text-white font-semibold">{currency}{totalBuyIn.toLocaleString()}</span>
          </span>
          {totalWin > 0 && (
            <span style={{ color: "#64748b" }}>
              Win: <span className="text-emerald-400 font-semibold">{currency}{totalWin.toLocaleString()}</span>
            </span>
          )}
          {current && (
            <span className="text-amber-400 font-semibold">▶ {current.game_name}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Widget: Tournament (normal)                                           */
/* ------------------------------------------------------------------ */

function TournamentWidget({ tournament }: { tournament: TournamentRow }) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        minWidth: "280px",
        background: "linear-gradient(135deg, rgba(12,16,24,0.75) 0%, rgba(17,24,39,0.75) 50%, rgba(12,16,24,0.75) 100%)",
        border: "1px solid rgba(245,158,11,0.2)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.25), 0 0 20px rgba(245,158,11,0.06)",
      }}
    >
      <div className="px-5 py-3 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
          </svg>
          <span
            className="font-black text-sm tracking-wide"
            style={{
              background: "linear-gradient(90deg, #f59e0b, #ef4444, #f59e0b)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {tournament.name}
          </span>
        </div>
        <div className="flex items-center justify-center gap-3 text-[10px]">
          <span
            className="font-bold px-2 py-0.5 rounded"
            style={{
              background: "rgba(16,185,129,0.12)",
              color: "#10b981",
              border: "1px solid rgba(16,185,129,0.2)",
            }}
          >
            {tournament.status.toUpperCase()}
          </span>
          <span className="text-slate-500">
            {tournament.participant_count ?? 0} Teilnehmer
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Widget: Now Playing (fallback)                                        */
/* ------------------------------------------------------------------ */

function NowPlayingWidget({ game }: { game: GameRow }) {
  return (
    <div
      className="rounded-lg overflow-hidden flex items-center"
      style={{
        minWidth: "260px",
        background: "linear-gradient(135deg, rgba(12,16,24,0.75) 0%, rgba(17,24,39,0.75) 50%, rgba(12,16,24,0.75) 100%)",
        border: "1px solid rgba(59,130,246,0.15)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
      }}
    >
      <div
        className="h-[52px] w-[52px] shrink-0 flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #1a73e833, #1a73e811)",
          borderRight: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <span className="text-[8px] font-bold text-white/50 text-center px-1">{game.name}</span>
      </div>
      <div className="px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px]" style={{ color: "#ef4444" }}>▶</span>
          <span className="text-white font-bold text-xs">{game.name}</span>
        </div>
        <p className="text-[10px] font-semibold mt-0.5" style={{ color: "#64748b" }}>
          {game.provider.toUpperCase()}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Fallback: nothing active                                              */
/* ------------------------------------------------------------------ */

function IdleWidget() {
  return (
    <div
      className="rounded-lg flex items-center gap-3"
      style={{
        minWidth: "220px",
        padding: "10px 16px",
        background: "linear-gradient(135deg, rgba(12,16,24,0.75) 0%, rgba(17,24,39,0.75) 50%, rgba(12,16,24,0.75) 100%)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="h-2 w-2 rounded-full bg-slate-600 animate-pulse" />
      <span className="text-[11px] text-slate-500 font-semibold">Kein aktives Feature</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main content                                                          */
/* ------------------------------------------------------------------ */

function AutoWidgetContent() {
  const uid = useOverlayUid();
  const { symbol: globalCurrency } = useGlobalCurrency(uid);

  const { data: wager, loading: wagerLoading } = useOverlayData<WagerSession>({
    table: "wager_sessions",
    userId: uid,
    filter: { is_active: true },
    single: true,
  });

  const { data: hunt, loading: huntLoading } = useOverlayData<Bonushunt>({
    table: "bonushunts",
    userId: uid,
    filter: { status: "active" },
    single: true,
  });

  const { data: allEntries } = useOverlayData<BonushuntEntry[]>({
    table: "bonushunt_entries",
    userId: uid,
    orderBy: "position",
    ascending: true,
  });

  const { data: tournament, loading: tournamentLoading } = useOverlayData<TournamentRow>({
    table: "tournaments",
    userId: uid,
    filter: { status: "ongoing" },
    single: true,
  });

  const { data: game, loading: gameLoading } = useOverlayData<GameRow>({
    table: "games",
    userId: uid,
    filter: { is_playing: true },
    single: true,
  });

  const allLoading = wagerLoading && huntLoading && tournamentLoading && gameLoading;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!allLoading) {
      // Small delay so fade-in is always visible
      const t = setTimeout(() => setVisible(true), 50);
      return () => clearTimeout(t);
    }
  }, [allLoading]);

  if (allLoading) return null;

  const entries = hunt && allEntries
    ? allEntries.filter((e) => e.bonushunt_id === hunt.id)
    : [];

  let widget: React.ReactNode;

  if (wager) {
    widget = <WagerWidget session={wager} sym={globalCurrency} />;
  } else if (hunt) {
    widget = <BonushuntWidget hunt={hunt} entries={entries} sym={globalCurrency} />;
  } else if (tournament) {
    widget = <TournamentWidget tournament={tournament} />;
  } else if (game) {
    widget = <NowPlayingWidget game={game} />;
  } else {
    widget = <IdleWidget />;
  }

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.4s ease-in-out",
      }}
    >
      {widget}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                  */
/* ------------------------------------------------------------------ */

export default function AutoWidgetPage() {
  return (
    <div className="p-4" style={{ background: "transparent" }}>
      <Suspense fallback={null}>
        <AutoWidgetContent />
      </Suspense>
    </div>
  );
}
