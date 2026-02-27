-- ============================================================
-- Pulseframelabs — Overlay Realtime Migration
-- Run this in Supabase SQL Editor AFTER 001_full_schema.sql
-- Enables: anon SELECT for overlay-relevant tables + Realtime publication
-- ============================================================

-- ============================================================
-- 1. ANON SELECT POLICIES
-- Overlays are unauthenticated (accessed via OBS browser source).
-- They query by user_id from the URL ?uid= parameter.
-- We add SELECT policies with USING (true) so anon can read any row.
-- The overlay code filters by user_id in the query itself.
-- ============================================================

-- Balance (Deposit & Withdrawals)
create policy "Anon can read balance_profiles"
  on public.balance_profiles for select
  using (true);

-- Wager Sessions
create policy "Anon can read wager_sessions"
  on public.wager_sessions for select
  using (true);

-- Bonushunts
create policy "Anon can read bonushunts"
  on public.bonushunts for select
  using (true);

create policy "Anon can read bonushunt_entries"
  on public.bonushunt_entries for select
  using (true);

-- Now Playing (Games)
create policy "Anon can read games"
  on public.games for select
  using (true);

-- Chat Messages
create policy "Anon can read chat_messages"
  on public.chat_messages for select
  using (true);

-- Duel
create policy "Anon can read duel_sessions"
  on public.duel_sessions for select
  using (true);

create policy "Anon can read duel_players"
  on public.duel_players for select
  using (true);

-- Slot Battles
create policy "Anon can read slot_battles"
  on public.slot_battles for select
  using (true);

create policy "Anon can read slot_battle_entries"
  on public.slot_battle_entries for select
  using (true);

-- Tournaments
create policy "Anon can read tournaments"
  on public.tournaments for select
  using (true);

-- Spinner
create policy "Anon can read spinner_prizes"
  on public.spinner_prizes for select
  using (true);

-- Hotwords
create policy "Anon can read hotword_settings"
  on public.hotword_settings for select
  using (true);

create policy "Anon can read hotword_entries"
  on public.hotword_entries for select
  using (true);

-- Slot Requests
create policy "Anon can read slot_request_settings"
  on public.slot_request_settings for select
  using (true);

create policy "Anon can read slot_requests"
  on public.slot_requests for select
  using (true);

-- ============================================================
-- 2. ENABLE REALTIME PUBLICATION
-- Add overlay-relevant tables to the supabase_realtime publication
-- so that Realtime postgres_changes events are fired on mutations.
-- ============================================================

alter publication supabase_realtime add table public.balance_profiles;
alter publication supabase_realtime add table public.wager_sessions;
alter publication supabase_realtime add table public.bonushunts;
alter publication supabase_realtime add table public.bonushunt_entries;
alter publication supabase_realtime add table public.games;
alter publication supabase_realtime add table public.chat_messages;
alter publication supabase_realtime add table public.duel_sessions;
alter publication supabase_realtime add table public.duel_players;
alter publication supabase_realtime add table public.slot_battles;
alter publication supabase_realtime add table public.slot_battle_entries;
alter publication supabase_realtime add table public.tournaments;
alter publication supabase_realtime add table public.spinner_prizes;
alter publication supabase_realtime add table public.hotword_settings;
alter publication supabase_realtime add table public.hotword_entries;
alter publication supabase_realtime add table public.slot_request_settings;
alter publication supabase_realtime add table public.slot_requests;
