-- ============================================================
-- CASINO DEALS (streamer landing page deals)
-- ============================================================

create table public.casino_deals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  casino_name text not null,
  casino_logo_url text,
  bonus_text text not null default '',
  bonus_percentage int,
  max_bonus_amount text,
  wagering text,
  bonus_code text,
  affiliate_url text not null default '',
  rating numeric(2,1) default 0,
  is_new boolean default false,
  enabled boolean default true,
  sort_order int default 0,
  details jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.casino_deals enable row level security;

create policy "Users can view own deals"
  on public.casino_deals for select
  using (auth.uid() = user_id);

create policy "Users can insert own deals"
  on public.casino_deals for insert
  with check (auth.uid() = user_id);

create policy "Users can update own deals"
  on public.casino_deals for update
  using (auth.uid() = user_id);

create policy "Users can delete own deals"
  on public.casino_deals for delete
  using (auth.uid() = user_id);

-- Public read access for published deals (via streamer page)
create policy "Public can view enabled deals"
  on public.casino_deals for select
  using (enabled = true);

-- Realtime
alter publication supabase_realtime add table casino_deals;
