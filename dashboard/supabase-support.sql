-- ═══════════════════════════════════════════════════════════════════════
-- Pulseframelabs — Support Tickets
-- Run this in Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists support_tickets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text default 'open',
  created_at timestamptz default now()
);
alter table support_tickets enable row level security;
create policy "Owner insert" on support_tickets
  for insert with check (auth.uid() = user_id);
create policy "Owner read" on support_tickets
  for select using (auth.uid() = user_id);
