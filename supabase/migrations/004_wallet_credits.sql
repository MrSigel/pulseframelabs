-- ============================================================
-- Pulseframelabs — Wallet & Credit System
-- Migration 004: Wallet, Transactions, Packages, Subscriptions, Payments
-- ============================================================

-- ============================================================
-- 1. PACKAGES (system-wide, NOT per-user)
-- ============================================================
create table public.packages (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  name text not null,
  description text default '',
  price_credits int not null,
  duration_days int not null,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Seed the 4 packages (1 credit = 1 EUR)
insert into public.packages (slug, name, description, price_credits, duration_days, sort_order) values
  ('1day',    '1 Day Pass',  'Full access for 1 day',    5,   1,   1),
  ('monthly', 'Monthly',     'Full access for 30 days',  99,  30,  2),
  ('3months', '3 Months',    'Full access for 90 days',  249, 90,  3),
  ('6months', '6 Months',    'Full access for 180 days', 449, 180, 4);

alter table public.packages enable row level security;

create policy "Anyone can view active packages"
  on public.packages for select
  using (is_active = true);

-- ============================================================
-- 2. WALLETS (one per user, singleton)
-- ============================================================
create table public.wallets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  balance int not null default 0 check (balance >= 0),
  total_deposited int not null default 0,
  total_spent int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

alter table public.wallets enable row level security;

create policy "Users can view own wallet"
  on public.wallets for select using (auth.uid() = user_id);

create policy "Users can insert own wallet"
  on public.wallets for insert with check (auth.uid() = user_id);

create policy "Users can update own wallet"
  on public.wallets for update using (auth.uid() = user_id);

-- ============================================================
-- 3. WALLET_TRANSACTIONS (credit history / ledger)
-- ============================================================
create table public.wallet_transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  wallet_id uuid not null references public.wallets(id) on delete cascade,
  type text not null check (type in ('topup', 'purchase', 'refund', 'admin_credit', 'admin_debit')),
  amount int not null,
  balance_after int not null,
  description text default '',
  reference_id uuid,
  created_at timestamptz default now()
);

alter table public.wallet_transactions enable row level security;

create policy "Users can view own wallet_transactions"
  on public.wallet_transactions for select using (auth.uid() = user_id);

create policy "Users can insert own wallet_transactions"
  on public.wallet_transactions for insert with check (auth.uid() = user_id);

-- ============================================================
-- 4. USER_SUBSCRIPTIONS
-- ============================================================
create table public.user_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  package_id uuid not null references public.packages(id),
  status text not null default 'active' check (status in ('active', 'expired', 'cancelled')),
  starts_at timestamptz not null default now(),
  expires_at timestamptz not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.user_subscriptions enable row level security;

create policy "Users can view own subscriptions"
  on public.user_subscriptions for select using (auth.uid() = user_id);

create policy "Users can insert own subscriptions"
  on public.user_subscriptions for insert with check (auth.uid() = user_id);

create policy "Users can update own subscriptions"
  on public.user_subscriptions for update using (auth.uid() = user_id);

-- ============================================================
-- 5. PAYMENT_REQUESTS (CryptAPI pending crypto payments)
-- ============================================================
create table public.payment_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  coin text not null,
  amount_fiat numeric(10,2) not null,
  amount_crypto text,
  address_in text,
  address_out text not null,
  callback_url text not null,
  txid text,
  confirmations int default 0,
  status text not null default 'pending' check (status in ('pending', 'confirming', 'completed', 'expired', 'failed')),
  credits_to_add int not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.payment_requests enable row level security;

create policy "Users can view own payment_requests"
  on public.payment_requests for select using (auth.uid() = user_id);

create policy "Users can insert own payment_requests"
  on public.payment_requests for insert with check (auth.uid() = user_id);

create policy "Users can update own payment_requests"
  on public.payment_requests for update using (auth.uid() = user_id);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_wallets_user on public.wallets(user_id);
create index idx_wallet_transactions_user on public.wallet_transactions(user_id);
create index idx_wallet_transactions_wallet on public.wallet_transactions(wallet_id);
create index idx_user_subscriptions_user on public.user_subscriptions(user_id);
create index idx_user_subscriptions_status on public.user_subscriptions(user_id, status);
create index idx_user_subscriptions_expires on public.user_subscriptions(expires_at);
create index idx_payment_requests_user on public.payment_requests(user_id);
create index idx_payment_requests_status on public.payment_requests(status);
create index idx_payment_requests_address on public.payment_requests(address_in);

-- ============================================================
-- AUTO-UPDATE updated_at timestamps
-- ============================================================
do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'packages', 'wallets', 'user_subscriptions', 'payment_requests'
    ])
  loop
    execute format(
      'create trigger update_%1$s_updated_at before update on public.%1$I for each row execute function public.update_updated_at()',
      t
    );
  end loop;
end;
$$;

-- ============================================================
-- UPDATE handle_new_user() to also create a wallet on signup
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

  -- NEW: create wallet with 0 balance
  insert into public.wallets (user_id, balance) values (new.id, 0);

  return new;
end;
$$ language plpgsql security definer;

-- ============================================================
-- SERVER-SIDE FUNCTION: atomic credit wallet
-- ============================================================
create or replace function public.credit_wallet(
  p_user_id uuid,
  p_amount int,
  p_description text,
  p_reference_id uuid default null
)
returns void as $$
declare
  v_wallet_id uuid;
  v_new_balance int;
begin
  update public.wallets
  set balance = balance + p_amount,
      total_deposited = total_deposited + p_amount
  where user_id = p_user_id
  returning id, balance into v_wallet_id, v_new_balance;

  if v_wallet_id is null then
    raise exception 'Wallet not found for user %', p_user_id;
  end if;

  insert into public.wallet_transactions (user_id, wallet_id, type, amount, balance_after, description, reference_id)
  values (p_user_id, v_wallet_id, 'topup', p_amount, v_new_balance, p_description, p_reference_id);
end;
$$ language plpgsql security definer;

-- ============================================================
-- SERVER-SIDE FUNCTION: atomic debit wallet
-- ============================================================
create or replace function public.debit_wallet(
  p_user_id uuid,
  p_amount int,
  p_description text,
  p_reference_id uuid default null
)
returns void as $$
declare
  v_wallet_id uuid;
  v_current_balance int;
  v_new_balance int;
begin
  select id, balance into v_wallet_id, v_current_balance
  from public.wallets
  where user_id = p_user_id
  for update;

  if v_wallet_id is null then
    raise exception 'Wallet not found for user %', p_user_id;
  end if;

  if v_current_balance < p_amount then
    raise exception 'Insufficient balance. Have %, need %', v_current_balance, p_amount;
  end if;

  v_new_balance := v_current_balance - p_amount;

  update public.wallets
  set balance = v_new_balance,
      total_spent = total_spent + p_amount
  where id = v_wallet_id;

  insert into public.wallet_transactions (user_id, wallet_id, type, amount, balance_after, description, reference_id)
  values (p_user_id, v_wallet_id, 'purchase', -p_amount, v_new_balance, p_description, p_reference_id);
end;
$$ language plpgsql security definer;

-- ============================================================
-- BACKFILL: create wallets for existing users who don't have one
-- ============================================================
insert into public.wallets (user_id, balance)
select id, 0 from auth.users
where id not in (select user_id from public.wallets);
