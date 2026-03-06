-- ============================================================
-- 010 — Join, Chat Tippspiel, Website Tippspiel, Bossfight
-- ============================================================

-- ============================================================
-- 1. JOIN SESSIONS & PARTICIPANTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.join_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'finished')),
  winner text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.join_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own join_sessions"
  ON public.join_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own join_sessions"
  ON public.join_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own join_sessions"
  ON public.join_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own join_sessions"
  ON public.join_sessions FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Anon can read join_sessions"
  ON public.join_sessions FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.join_participants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES public.join_sessions(id) ON DELETE CASCADE,
  username text NOT NULL,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(session_id, username)
);

ALTER TABLE public.join_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own join_participants"
  ON public.join_participants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own join_participants"
  ON public.join_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own join_participants"
  ON public.join_participants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own join_participants"
  ON public.join_participants FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Anon can read join_participants"
  ON public.join_participants FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_join_participants_session ON public.join_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_join_sessions_user ON public.join_sessions(user_id);

-- ============================================================
-- 2. GUESS SESSIONS & ENTRIES (Chat Tippspiel)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.guess_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'finished')),
  target_number numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.guess_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own guess_sessions"
  ON public.guess_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own guess_sessions"
  ON public.guess_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own guess_sessions"
  ON public.guess_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own guess_sessions"
  ON public.guess_sessions FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Anon can read guess_sessions"
  ON public.guess_sessions FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.guess_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES public.guess_sessions(id) ON DELETE CASCADE,
  username text NOT NULL,
  guess numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(session_id, username)
);

ALTER TABLE public.guess_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own guess_entries"
  ON public.guess_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own guess_entries"
  ON public.guess_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own guess_entries"
  ON public.guess_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own guess_entries"
  ON public.guess_entries FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Anon can read guess_entries"
  ON public.guess_entries FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_guess_entries_session ON public.guess_entries(session_id);
CREATE INDEX IF NOT EXISTS idx_guess_sessions_user ON public.guess_sessions(user_id);

-- ============================================================
-- 3. TIPPSPIEL SESSIONS & ENTRIES (Website Tippspiel)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tippspiel_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'finished')),
  target_number numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.tippspiel_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tippspiel_sessions"
  ON public.tippspiel_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tippspiel_sessions"
  ON public.tippspiel_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tippspiel_sessions"
  ON public.tippspiel_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tippspiel_sessions"
  ON public.tippspiel_sessions FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Anon can read tippspiel_sessions"
  ON public.tippspiel_sessions FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.tippspiel_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES public.tippspiel_sessions(id) ON DELETE CASCADE,
  username text NOT NULL,
  guess numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(session_id, username)
);

ALTER TABLE public.tippspiel_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tippspiel_entries"
  ON public.tippspiel_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tippspiel_entries"
  ON public.tippspiel_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tippspiel_entries"
  ON public.tippspiel_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tippspiel_entries"
  ON public.tippspiel_entries FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Anon can read tippspiel_entries"
  ON public.tippspiel_entries FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_tippspiel_entries_session ON public.tippspiel_entries(session_id);
CREATE INDEX IF NOT EXISTS idx_tippspiel_sessions_user ON public.tippspiel_sessions(user_id);

-- ============================================================
-- 4. BOSSFIGHT SESSIONS, PLAYERS & BETS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bossfight_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'join_open' CHECK (status IN ('join_open', 'draw', 'betting', 'live', 'finished')),
  boss_name text,
  boss_game text,
  boss_lives int NOT NULL DEFAULT 9,
  boss_max_lives int NOT NULL DEFAULT 9,
  current_player_index int NOT NULL DEFAULT 0,
  winner_side text CHECK (winner_side IN ('boss', 'players', NULL)),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.bossfight_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bossfight_sessions"
  ON public.bossfight_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bossfight_sessions"
  ON public.bossfight_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bossfight_sessions"
  ON public.bossfight_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own bossfight_sessions"
  ON public.bossfight_sessions FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Anon can read bossfight_sessions"
  ON public.bossfight_sessions FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.bossfight_players (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES public.bossfight_sessions(id) ON DELETE CASCADE,
  username text NOT NULL,
  game text NOT NULL DEFAULT '',
  is_boss boolean NOT NULL DEFAULT false,
  is_eliminated boolean NOT NULL DEFAULT false,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(session_id, username)
);

ALTER TABLE public.bossfight_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bossfight_players"
  ON public.bossfight_players FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bossfight_players"
  ON public.bossfight_players FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bossfight_players"
  ON public.bossfight_players FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own bossfight_players"
  ON public.bossfight_players FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Anon can read bossfight_players"
  ON public.bossfight_players FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.bossfight_bets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES public.bossfight_sessions(id) ON DELETE CASCADE,
  username text NOT NULL,
  team text NOT NULL CHECK (team IN ('boss', 'players')),
  amount numeric NOT NULL DEFAULT 0,
  placed_at timestamptz DEFAULT now(),
  UNIQUE(session_id, username)
);

ALTER TABLE public.bossfight_bets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bossfight_bets"
  ON public.bossfight_bets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bossfight_bets"
  ON public.bossfight_bets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bossfight_bets"
  ON public.bossfight_bets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own bossfight_bets"
  ON public.bossfight_bets FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Anon can read bossfight_bets"
  ON public.bossfight_bets FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_bossfight_sessions_user ON public.bossfight_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_bossfight_players_session ON public.bossfight_players(session_id);
CREATE INDEX IF NOT EXISTS idx_bossfight_bets_session ON public.bossfight_bets(session_id);

-- ============================================================
-- 5. Add all new tables to Supabase Realtime
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.join_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.join_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.guess_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.guess_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tippspiel_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tippspiel_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bossfight_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bossfight_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bossfight_bets;
