-- ═══════════════════════════════════════════════════════════════════════
-- Pulseframelabs — Public Pages Lookup (slug → user_id)
-- Run this in Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists public_pages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  slug text not null unique,
  unique(user_id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public_pages enable row level security;

-- Owner can manage their own pages
create policy "Owner full access" on public_pages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Anyone can look up a slug (needed for /s/:name)
create policy "Public read" on public_pages
  for select using (true);

-- Enable realtime
alter publication supabase_realtime add table public_pages;
