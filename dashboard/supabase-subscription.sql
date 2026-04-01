-- ═══════════════════════════════════════════════════════════════════════
-- Pulseframelabs — Subscription & Credits System
-- Run this in Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════════════

-- Credit balance per user
create table if not exists user_credits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null unique,
  balance integer default 0 not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table user_credits enable row level security;
create policy "Owner full access" on user_credits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Credit transaction log
create table if not exists credit_transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  amount integer not null,
  type text not null,
  description text,
  created_at timestamptz default now()
);
alter table credit_transactions enable row level security;
create policy "Owner full access" on credit_transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Active subscriptions
create table if not exists subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  plan_key text not null,
  credits_spent integer not null,
  started_at timestamptz default now(),
  expires_at timestamptz not null,
  created_at timestamptz default now()
);
alter table subscriptions enable row level security;
create policy "Owner full access" on subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- Public read so StreamerPage can check if owner has active plan
create policy "Public read" on subscriptions
  for select using (true);

-- Realtime
alter publication supabase_realtime add table user_credits, credit_transactions, subscriptions;
