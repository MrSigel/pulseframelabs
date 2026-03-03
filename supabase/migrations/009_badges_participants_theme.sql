-- ============================================================
-- 009 — Badge Store, Tournament Participants, Theme Realtime
-- ============================================================

-- 1. Add item_type to store_items to distinguish badges from regular items
ALTER TABLE public.store_items
  ADD COLUMN IF NOT EXISTS item_type text NOT NULL DEFAULT 'item'
  CHECK (item_type IN ('item', 'badge'));

-- 2. Create tournament_participants table (was missing from all migrations)
CREATE TABLE IF NOT EXISTS public.tournament_participants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  viewer_username text NOT NULL,
  game_name text DEFAULT '',
  badge_image_url text,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(tournament_id, viewer_username)
);

-- RLS
ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tournament_participants"
  ON public.tournament_participants FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tournament_participants"
  ON public.tournament_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tournament_participants"
  ON public.tournament_participants FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tournament_participants"
  ON public.tournament_participants FOR DELETE
  USING (auth.uid() = user_id);

-- Anon read for overlays (overlays are unauthenticated pages)
CREATE POLICY "Anon can read tournament_participants"
  ON public.tournament_participants FOR SELECT
  USING (true);

-- Anon read for theme_settings (overlays need to fetch theme)
CREATE POLICY "Anon can read theme_settings"
  ON public.theme_settings FOR SELECT
  USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament
  ON public.tournament_participants(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_user
  ON public.tournament_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_store_items_item_type
  ON public.store_items(user_id, item_type);

-- 3. Add to Supabase Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.theme_settings;
