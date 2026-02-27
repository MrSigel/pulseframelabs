-- ============================================================
-- Pulseframelabs — Full Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. USER PROFILES (extends auth.users)
-- ============================================================
create table public.user_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  twitch_username text,
  kick_username text,
  timezone text default 'UTC',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

-- ============================================================
-- 2. DASHBOARD STATS (aggregated per user)
-- ============================================================
create table public.dashboard_stats (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  total_wagered numeric default 0,
  total_deposits numeric default 0,
  total_withdrawals numeric default 0,
  net_profit numeric default 0,
  active_viewers int default 0,
  games_played int default 0,
  best_multiplier numeric default 0,
  total_users int default 0,
  updated_at timestamptz default now(),
  unique(user_id)
);

-- ============================================================
-- 3. CASINOS
-- ============================================================
create table public.casinos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text default '',
  image_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 4. BONUSHUNTS
-- ============================================================
create table public.bonushunts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text default '',
  start_balance numeric default 0,
  currency text default 'USD',
  status text default 'active' check (status in ('active', 'paused', 'finished')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.bonushunt_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  bonushunt_id uuid not null references public.bonushunts(id) on delete cascade,
  game_name text not null,
  provider text default '',
  buy_in numeric default 0,
  win_amount numeric default 0,
  multiplier numeric default 0,
  position int default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- 5. WAGER SESSIONS
-- ============================================================
create table public.wager_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  casino_name text default '',
  header_text text default 'PULSEFRAMELABS.COM',
  bonus_type text default 'sticky',
  currency text default 'USD',
  deposit_amount numeric default 0,
  bonus_amount numeric default 0,
  wager_amount numeric default 0,
  wagered_amount numeric default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 6. BALANCE PROFILES (Deposit & Withdrawals)
-- ============================================================
create table public.balance_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  currency text default 'USD',
  deposits numeric default 0,
  deposits_add numeric default 0,
  withdrawals numeric default 0,
  withdrawals_add numeric default 0,
  leftover numeric default 0,
  leftover_add numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

-- ============================================================
-- 7. DUEL SESSIONS
-- ============================================================
create table public.duel_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  max_players int default 8,
  raffle_pool boolean default false,
  status text default 'active' check (status in ('active', 'finished')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.duel_players (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null references public.duel_sessions(id) on delete cascade,
  name text default '',
  game text default '',
  buy_in text default '',
  result text default '',
  rank text default '',
  position int default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- 8. SLOT BATTLES
-- ============================================================
create table public.slot_battles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  start_balance numeric default 0,
  currency text default 'USD',
  number_of_buys int default 0,
  status text default 'active' check (status in ('active', 'paused', 'finished')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.slot_battle_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  battle_id uuid not null references public.slot_battles(id) on delete cascade,
  game_name text not null,
  buy_in numeric default 0,
  win_amount numeric default 0,
  multiplier numeric default 0,
  position int default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- 9. TOURNAMENTS
-- ============================================================
create table public.tournaments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text default '',
  participant_count int default 8,
  bracket_data jsonb default '[]'::jsonb,
  status text default 'pending' check (status in ('pending', 'ongoing', 'finished')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 10. SPINNER
-- ============================================================
create table public.spinner_prizes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prize text not null,
  color text not null default '#3b82f6',
  position int default 0,
  created_at timestamptz default now()
);

create table public.spinner_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  winner text not null,
  spun_at timestamptz default now()
);

-- ============================================================
-- 11. LOYALTY PRESETS & GIVEAWAY HISTORY
-- ============================================================
create table public.loyalty_presets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  keyword text not null,
  points int default 0,
  duration_seconds int default 60,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.giveaway_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  keyword text not null,
  points_amount int default 0,
  duration_seconds int default 0,
  participant_count int default 0,
  started_at timestamptz default now(),
  ended_at timestamptz
);

-- ============================================================
-- 12. POINTS BATTLE
-- ============================================================
create table public.points_battle_presets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  options jsonb default '[]'::jsonb,
  min_points int default 0,
  max_points int default 0,
  duration_seconds int default 60,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.points_battle_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  options jsonb default '[]'::jsonb,
  min_points int default 0,
  max_points int default 0,
  duration_seconds int default 60,
  status text default 'active' check (status in ('active', 'finished', 'cancelled')),
  started_at timestamptz default now(),
  ended_at timestamptz
);

-- ============================================================
-- 13. QUICK GUESSES
-- ============================================================
create table public.quick_guess_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  twitch_username text default '',
  success_msg text default '{username} guessed {guess}!',
  already_in_use_msg text default '{username}, you already have a guess!',
  guess_changed_msg text default '{username} changed guess to {guess}',
  wrong_numbers_msg text default '{username}, please enter a valid number!',
  not_active_msg text default 'Guessing is currently not active!',
  winner_msg text default '{username} won with {guess}! ({difference} off)',
  commands jsonb default '["!guess"]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

create table public.quick_guess_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  is_open boolean default true,
  winner_username text,
  winner_guess text,
  created_at timestamptz default now(),
  closed_at timestamptz
);

create table public.quick_guess_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null references public.quick_guess_sessions(id) on delete cascade,
  username text not null,
  guess text not null,
  guessed_at timestamptz default now(),
  changed_at timestamptz
);

create table public.quick_guess_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  participant_count int default 0,
  winner text not null,
  winning_guess text not null,
  played_at timestamptz default now()
);

-- ============================================================
-- 14. SLOT REQUESTS
-- ============================================================
create table public.slot_request_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  points_cost int default 0,
  allow_multiple boolean default false,
  animation_emojis jsonb default '["🎰","💰","🎲","🍀","⭐"]'::jsonb,
  holding_time_ms int default 5000,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

create table public.slot_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  viewer_username text not null,
  slot_name text not null,
  status text default 'pending' check (status in ('pending', 'raffled', 'completed')),
  requested_at timestamptz default now()
);

create table public.raffle_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  slot_name text not null,
  winner text not null,
  raffled_at timestamptz default now()
);

-- ============================================================
-- 15. HOTWORDS
-- ============================================================
create table public.hotword_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  twitch_username text default '',
  kick_username text default '',
  excluded_words jsonb default '[]'::jsonb,
  bot_status text default 'offline' check (bot_status in ('online', 'offline')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

create table public.hotword_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  word text not null,
  count int default 1,
  first_seen timestamptz default now(),
  last_seen timestamptz default now()
);

-- ============================================================
-- 16. MODERATORS
-- ============================================================
create table public.moderators (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  moderator_email text not null,
  moderator_user_id uuid references auth.users(id),
  status text default 'active' check (status in ('active', 'inactive')),
  permissions jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 17. NOW PLAYING (Games library)
-- ============================================================
create table public.games (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  provider text default '',
  image_url text,
  is_playing boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 18. PERSONAL BESTS
-- ============================================================
create table public.personal_bests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_name text not null,
  provider text default '',
  win_amount numeric default 0,
  multiplier numeric default 0,
  achieved_at timestamptz default now(),
  created_at timestamptz default now()
);

-- ============================================================
-- 19. CHAT MESSAGES (overlay)
-- ============================================================
create table public.chat_messages (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  username text not null,
  user_role text default 'viewer' check (user_role in ('viewer', 'moderator', 'subscriber')),
  message text not null,
  sent_at timestamptz default now()
);

-- ============================================================
-- 20. SLIDESHOW
-- ============================================================
create table public.slideshow_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  casino_name text not null,
  position int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 21. STORE
-- ============================================================
create table public.store_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  store_name text default 'My Store',
  store_description text default '',
  store_currency text default 'Points',
  store_image_url text,
  allow_redemptions boolean default true,
  show_prices boolean default true,
  primary_color text default '#3b82f6',
  background_color text default '#0a0a0a',
  show_overlay boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

create table public.store_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text default '',
  price_points int default 0,
  quantity_available int default -1,
  email_required boolean default false,
  visible boolean default true,
  redemption_limit int default -1,
  excluded_users jsonb default '[]'::jsonb,
  image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.store_redemptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid not null references public.store_items(id) on delete cascade,
  viewer_username text not null,
  viewer_email text,
  status text default 'pending' check (status in ('pending', 'completed', 'refunded')),
  redeemed_at timestamptz default now(),
  completed_at timestamptz
);

-- ============================================================
-- 22. STREAM VIEWERS & POINTS
-- ============================================================
create table public.stream_viewers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  username text not null,
  total_points int default 0,
  watch_time_minutes int default 0,
  last_seen timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.points_transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  viewer_id uuid references public.stream_viewers(id) on delete set null,
  amount int not null,
  reason text default '',
  type text default 'add' check (type in ('add', 'remove')),
  created_at timestamptz default now()
);

-- ============================================================
-- 23. STREAM POINTS CONFIG
-- ============================================================
create table public.stream_points_config (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  points_per_minute numeric default 1,
  points_per_follow int default 0,
  points_per_sub int default 0,
  points_per_donation int default 0,
  is_active boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

-- ============================================================
-- 24. PROMOTIONS
-- ============================================================
create table public.promotions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text default '',
  code text default '',
  discount_percent numeric default 0,
  max_uses int default -1,
  current_uses int default 0,
  start_date timestamptz,
  end_date timestamptz,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 25. THEME SETTINGS
-- ============================================================
create table public.theme_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  preset_name text default 'Neon',
  colors jsonb default '["#ef4444","#f97316","#eab308"]'::jsonb,
  is_custom boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);


-- ============================================================
-- ROW LEVEL SECURITY (RLS) — Every table
-- ============================================================

-- Helper: enable RLS + create standard policies for each table
do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'user_profiles', 'dashboard_stats', 'casinos',
      'bonushunts', 'bonushunt_entries',
      'wager_sessions', 'balance_profiles',
      'duel_sessions', 'duel_players',
      'slot_battles', 'slot_battle_entries',
      'tournaments',
      'spinner_prizes', 'spinner_history',
      'loyalty_presets', 'giveaway_history',
      'points_battle_presets', 'points_battle_sessions',
      'quick_guess_settings', 'quick_guess_sessions', 'quick_guess_entries', 'quick_guess_history',
      'slot_request_settings', 'slot_requests', 'raffle_history',
      'hotword_settings', 'hotword_entries',
      'moderators', 'games', 'personal_bests', 'chat_messages',
      'slideshow_items',
      'store_settings', 'store_items', 'store_redemptions',
      'stream_viewers', 'points_transactions',
      'stream_points_config', 'promotions', 'theme_settings'
    ])
  loop
    execute format('alter table public.%I enable row level security', t);

    execute format(
      'create policy "Users can view own %1$s" on public.%1$I for select using (auth.uid() = user_id)', t
    );
    execute format(
      'create policy "Users can insert own %1$s" on public.%1$I for insert with check (auth.uid() = user_id)', t
    );
    execute format(
      'create policy "Users can update own %1$s" on public.%1$I for update using (auth.uid() = user_id)', t
    );
    execute format(
      'create policy "Users can delete own %1$s" on public.%1$I for delete using (auth.uid() = user_id)', t
    );
  end loop;
end;
$$;


-- ============================================================
-- INDEXES for performance
-- ============================================================
create index idx_bonushunts_user on public.bonushunts(user_id);
create index idx_bonushunt_entries_hunt on public.bonushunt_entries(bonushunt_id);
create index idx_wager_sessions_user on public.wager_sessions(user_id);
create index idx_duel_players_session on public.duel_players(session_id);
create index idx_slot_battle_entries_battle on public.slot_battle_entries(battle_id);
create index idx_spinner_prizes_user on public.spinner_prizes(user_id);
create index idx_quick_guess_entries_session on public.quick_guess_entries(session_id);
create index idx_slot_requests_user on public.slot_requests(user_id);
create index idx_store_items_user on public.store_items(user_id);
create index idx_store_redemptions_item on public.store_redemptions(item_id);
create index idx_stream_viewers_user on public.stream_viewers(user_id);
create index idx_chat_messages_user on public.chat_messages(user_id);
create index idx_personal_bests_user on public.personal_bests(user_id);
create index idx_games_user on public.games(user_id);


-- ============================================================
-- AUTO-CREATE user_profiles + dashboard_stats on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'first_name', split_part(new.email, '@', 1)));

  insert into public.dashboard_stats (user_id) values (new.id);
  insert into public.balance_profiles (user_id) values (new.id);
  insert into public.store_settings (user_id) values (new.id);
  insert into public.theme_settings (user_id) values (new.id);
  insert into public.stream_points_config (user_id) values (new.id);
  insert into public.quick_guess_settings (user_id) values (new.id);
  insert into public.slot_request_settings (user_id) values (new.id);
  insert into public.hotword_settings (user_id) values (new.id);

  return new;
end;
$$ language plpgsql security definer;

-- Trigger: runs after each new auth.users row
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================
-- STREAMER PAGE SETTINGS
-- ============================================================
create table public.streamer_page_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  slug text not null,
  display_name text not null default '',
  bio text default '',
  avatar_url text,
  banner_url text,
  twitch_url text,
  kick_url text,
  youtube_url text,
  twitter_url text,
  discord_url text,
  instagram_url text,
  tiktok_url text,
  website_url text,
  is_public boolean default true,
  accent_color text default '#c9a84c',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id),
  unique(slug)
);

alter table public.streamer_page_settings enable row level security;

create policy "Users can view own streamer page"
  on public.streamer_page_settings for select
  using (auth.uid() = user_id);

create policy "Users can insert own streamer page"
  on public.streamer_page_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own streamer page"
  on public.streamer_page_settings for update
  using (auth.uid() = user_id);

create policy "Public can view published streamer pages"
  on public.streamer_page_settings for select
  using (is_public = true);


-- ============================================================
-- AUTO-UPDATE updated_at timestamps
-- ============================================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply to all tables with updated_at
do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'user_profiles', 'dashboard_stats', 'casinos',
      'bonushunts', 'wager_sessions', 'balance_profiles',
      'duel_sessions', 'slot_battles', 'tournaments',
      'loyalty_presets', 'points_battle_presets',
      'quick_guess_settings', 'slot_request_settings',
      'hotword_settings', 'moderators', 'games',
      'slideshow_items', 'store_settings', 'store_items',
      'stream_viewers', 'stream_points_config', 'promotions', 'theme_settings',
      'streamer_page_settings'
    ])
  loop
    execute format(
      'create trigger update_%1$s_updated_at before update on public.%1$I for each row execute function public.update_updated_at()',
      t
    );
  end loop;
end;
$$;
