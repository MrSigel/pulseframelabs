-- ═══════════════════════════════════════════════════════════════════════
-- Pulseframelabs — Supabase Migration
-- Run this in Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════════════

-- ── User Settings (singleton key-value for themes, configs) ──────────
create table if not exists user_settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  key text not null,
  value jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, key)
);
alter table user_settings enable row level security;
create policy "Owner full access" on user_settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Public read" on user_settings for select using (true);

-- ── Wager Sessions ──────────────────────────────────────────────────
create table if not exists wager_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  data jsonb default '{}',
  created_at timestamptz default now()
);
alter table wager_sessions enable row level security;
create policy "Owner full access" on wager_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Public read" on wager_sessions for select using (true);

-- ── Bonushunts ──────────────────────────────────────────────────────
create table if not exists bonushunts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  data jsonb default '{}',
  created_at timestamptz default now()
);
alter table bonushunts enable row level security;
create policy "Owner full access" on bonushunts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Public read" on bonushunts for select using (true);

-- ── Bonushunt Entries ───────────────────────────────────────────────
create table if not exists bonushunt_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  data jsonb default '{}',
  created_at timestamptz default now()
);
alter table bonushunt_entries enable row level security;
create policy "Owner full access" on bonushunt_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Public read" on bonushunt_entries for select using (true);

-- ── Tournaments ─────────────────────────────────────────────────────
create table if not exists tournaments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  data jsonb default '{}',
  created_at timestamptz default now()
);
alter table tournaments enable row level security;
create policy "Owner full access" on tournaments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Public read" on tournaments for select using (true);

-- ── Bossfights ──────────────────────────────────────────────────────
create table if not exists bossfights (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  data jsonb default '{}',
  created_at timestamptz default now()
);
alter table bossfights enable row level security;
create policy "Owner full access" on bossfights for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Public read" on bossfights for select using (true);

-- ── Slot Requests ───────────────────────────────────────────────────
create table if not exists slot_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  data jsonb default '{}',
  created_at timestamptz default now()
);
alter table slot_requests enable row level security;
create policy "Owner full access" on slot_requests for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Public read" on slot_requests for select using (true);

-- ── Join Sessions ───────────────────────────────────────────────────
create table if not exists join_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  data jsonb default '{}',
  created_at timestamptz default now()
);
alter table join_sessions enable row level security;
create policy "Owner full access" on join_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Public read" on join_sessions for select using (true);

-- ── Join Participants ───────────────────────────────────────────────
create table if not exists join_participants (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  data jsonb default '{}',
  created_at timestamptz default now()
);
alter table join_participants enable row level security;
create policy "Owner full access" on join_participants for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Public read" on join_participants for select using (true);

-- ── Guess Sessions ──────────────────────────────────────────────────
create table if not exists guess_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  data jsonb default '{}',
  created_at timestamptz default now()
);
alter table guess_sessions enable row level security;
create policy "Owner full access" on guess_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Public read" on guess_sessions for select using (true);

-- ── Guess Entries ───────────────────────────────────────────────────
create table if not exists guess_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  data jsonb default '{}',
  created_at timestamptz default now()
);
alter table guess_entries enable row level security;
create policy "Owner full access" on guess_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Public read" on guess_entries for select using (true);

-- ── Prediction Rounds ───────────────────────────────────────────────
create table if not exists prediction_rounds (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  data jsonb default '{}',
  created_at timestamptz default now()
);
alter table prediction_rounds enable row level security;
create policy "Owner full access" on prediction_rounds for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Public read" on prediction_rounds for select using (true);

-- ── Prediction Votes ────────────────────────────────────────────────
create table if not exists prediction_votes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  data jsonb default '{}',
  created_at timestamptz default now()
);
alter table prediction_votes enable row level security;
create policy "Owner full access" on prediction_votes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Public read" on prediction_votes for select using (true);

-- ── Hotword Entries ─────────────────────────────────────────────────
create table if not exists hotword_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  data jsonb default '{}',
  created_at timestamptz default now()
);
alter table hotword_entries enable row level security;
create policy "Owner full access" on hotword_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Public read" on hotword_entries for select using (true);

-- ── Chat Sessions ───────────────────────────────────────────────────
create table if not exists chat_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  data jsonb default '{}',
  created_at timestamptz default now()
);
alter table chat_sessions enable row level security;
create policy "Owner full access" on chat_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Public read" on chat_sessions for select using (true);

-- ── Chat Messages ───────────────────────────────────────────────────
create table if not exists chat_messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  data jsonb default '{}',
  created_at timestamptz default now()
);
alter table chat_messages enable row level security;
create policy "Owner full access" on chat_messages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Public read" on chat_messages for select using (true);

-- ── Bot Commands ────────────────────────────────────────────────────
create table if not exists bot_commands (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  data jsonb default '{}',
  created_at timestamptz default now()
);
alter table bot_commands enable row level security;
create policy "Owner full access" on bot_commands for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Public read" on bot_commands for select using (true);

-- ── Points Battle Sessions ──────────────────────────────────────────
create table if not exists points_battle_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  data jsonb default '{}',
  created_at timestamptz default now()
);
alter table points_battle_sessions enable row level security;
create policy "Owner full access" on points_battle_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Public read" on points_battle_sessions for select using (true);

-- ── Points Battle Bets ──────────────────────────────────────────────
create table if not exists points_battle_bets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  data jsonb default '{}',
  created_at timestamptz default now()
);
alter table points_battle_bets enable row level security;
create policy "Owner full access" on points_battle_bets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Public read" on points_battle_bets for select using (true);

-- ── Stream Viewers ──────────────────────────────────────────────────
create table if not exists stream_viewers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  data jsonb default '{}',
  created_at timestamptz default now()
);
alter table stream_viewers enable row level security;
create policy "Owner full access" on stream_viewers for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Public read" on stream_viewers for select using (true);

-- ── Store Items ─────────────────────────────────────────────────────
create table if not exists store_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  data jsonb default '{}',
  created_at timestamptz default now()
);
alter table store_items enable row level security;
create policy "Owner full access" on store_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Public read" on store_items for select using (true);

-- ── Store Redemptions ───────────────────────────────────────────────
create table if not exists store_redemptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  data jsonb default '{}',
  created_at timestamptz default now()
);
alter table store_redemptions enable row level security;
create policy "Owner full access" on store_redemptions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Public read" on store_redemptions for select using (true);

-- ── Points Transactions ─────────────────────────────────────────────
create table if not exists points_transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  data jsonb default '{}',
  created_at timestamptz default now()
);
alter table points_transactions enable row level security;
create policy "Owner full access" on points_transactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Public read" on points_transactions for select using (true);

-- ── Enable Realtime on all tables ───────────────────────────────────
alter publication supabase_realtime add table
  user_settings, wager_sessions, bonushunts, bonushunt_entries,
  tournaments, bossfights, slot_requests, join_sessions, join_participants,
  guess_sessions, guess_entries, prediction_rounds, prediction_votes,
  hotword_entries, chat_sessions, chat_messages, bot_commands,
  points_battle_sessions, points_battle_bets, stream_viewers,
  store_items, store_redemptions, points_transactions;
