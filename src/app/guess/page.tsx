"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface TippspielSession {
  id: string;
  status: string;
}

function TippspielContent() {
  const params = useSearchParams();
  const uid = params.get("uid") || "";

  const [session, setSession] = useState<TippspielSession | null>(null);
  const [username, setUsername] = useState("");
  const [guess, setGuess] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    if (!uid) return;
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("tippspiel_sessions")
        .select("id, status")
        .eq("user_id", uid)
        .eq("status", "open")
        .maybeSingle();
      setSession(data);
    } catch { /* ignore */ }
    setLoading(false);
  }, [uid]);

  useEffect(() => { fetchSession(); }, [fetchSession]);

  // Realtime updates
  useEffect(() => {
    if (!uid) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`tippspiel-session-${uid}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "tippspiel_sessions", filter: `user_id=eq.${uid}` }, () => {
        fetchSession();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [uid, fetchSession]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session || !username.trim() || !guess.trim()) return;

    const guessNum = parseFloat(guess);
    if (isNaN(guessNum)) {
      setError("Please enter a valid number");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: upsertError } = await supabase
        .from("tippspiel_entries")
        .upsert(
          { user_id: uid, session_id: session.id, username: username.trim(), guess: guessNum },
          { onConflict: "session_id,username" }
        );
      if (upsertError) throw upsertError;
      setSubmitted(true);
    } catch (err) {
      setError("Failed to submit guess. Try again.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
        <div className="text-slate-500 text-sm">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Tippspiel</h1>
          <p className="text-slate-500">No active Tippspiel right now. Check back later!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-[#111827]/90 border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-black text-white mb-1">Tippspiel</h1>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Enter your guess</p>
          </div>

          {submitted ? (
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <p className="text-white font-bold">Guess submitted!</p>
                <p className="text-slate-500 text-sm mt-1">Your guess: <span className="text-white font-mono">{guess}</span></p>
              </div>
              <button
                onClick={() => { setSubmitted(false); setGuess(""); }}
                className="text-xs text-blue-400 hover:underline"
              >
                Change your guess
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Your Name</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Twitch username"
                  required
                  className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Your Guess</label>
                <input
                  type="number"
                  step="any"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  placeholder="Enter a number..."
                  required
                  className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25"
                />
              </div>
              {error && (
                <p className="text-red-400 text-xs">{error}</p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Guess"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-[10px] text-slate-700 mt-4">
          Powered by Pulseframelabs
        </p>
      </div>
    </div>
  );
}

export default function TippspielPublicPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0e17]" />}>
      <TippspielContent />
    </Suspense>
  );
}
