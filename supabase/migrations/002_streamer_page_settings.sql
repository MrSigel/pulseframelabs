-- ============================================================
-- Streamer Page Settings
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
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

-- RLS
alter table public.streamer_page_settings enable row level security;

-- Users can read/write their own rows
create policy "Users can view own streamer page"
  on public.streamer_page_settings for select
  using (auth.uid() = user_id);

create policy "Users can insert own streamer page"
  on public.streamer_page_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own streamer page"
  on public.streamer_page_settings for update
  using (auth.uid() = user_id);

-- Public can view pages marked as public (for /s/[slug] route)
create policy "Public can view published streamer pages"
  on public.streamer_page_settings for select
  using (is_public = true);

-- Auto-update updated_at
create trigger update_streamer_page_settings_updated_at
  before update on public.streamer_page_settings
  for each row execute function public.update_updated_at();
