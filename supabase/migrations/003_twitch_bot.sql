-- ============================================================
-- 003: Twitch Bot – new tables for bot connections & features
-- ============================================================

-- Twitch OAuth connections (one per user)
CREATE TABLE IF NOT EXISTS public.twitch_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  twitch_user_id text NOT NULL,
  twitch_username text NOT NULL,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  scopes text[] DEFAULT '{}',
  connected_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.twitch_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own twitch_connections"
  ON public.twitch_connections FOR ALL USING (auth.uid() = user_id);

-- Points battle bets (viewer wagers on prediction options)
CREATE TABLE IF NOT EXISTS public.points_battle_bets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id uuid REFERENCES public.points_battle_sessions(id) ON DELETE CASCADE NOT NULL,
  viewer_username text NOT NULL,
  option_index int NOT NULL,
  amount int NOT NULL,
  placed_at timestamptz DEFAULT now()
);
ALTER TABLE public.points_battle_bets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own points_battle_bets"
  ON public.points_battle_bets FOR ALL USING (auth.uid() = user_id);

-- Active giveaway sessions (tracks running giveaway)
CREATE TABLE IF NOT EXISTS public.giveaway_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  keyword text NOT NULL,
  points_amount int NOT NULL,
  duration_seconds int NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active','finished','cancelled')),
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz
);
ALTER TABLE public.giveaway_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own giveaway_sessions"
  ON public.giveaway_sessions FOR ALL USING (auth.uid() = user_id);

-- Giveaway participants (viewers who typed the keyword)
CREATE TABLE IF NOT EXISTS public.giveaway_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id uuid REFERENCES public.giveaway_sessions(id) ON DELETE CASCADE NOT NULL,
  username text NOT NULL,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(session_id, username)
);
ALTER TABLE public.giveaway_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own giveaway_participants"
  ON public.giveaway_participants FOR ALL USING (auth.uid() = user_id);

-- Enable Realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE
  public.twitch_connections,
  public.points_battle_bets,
  public.giveaway_sessions,
  public.giveaway_participants;
