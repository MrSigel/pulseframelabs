-- ═══════════════════════════════════════════════════════════════════════
-- Pulseframelabs — CryptAPI Payment System
-- Run this in Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════════════

-- Payment requests (tracks crypto payments)
create table if not exists payment_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  coin text not null,
  amount_fiat numeric(10,2) not null,
  amount_crypto text,
  address_in text,
  address_out text not null,
  callback_url text not null,
  txid text,
  confirmations integer default 0,
  status text not null default 'pending',
  credits_to_add integer not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table payment_requests enable row level security;
create policy "Owner full access" on payment_requests
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Atomic credit function (called by webhook)
create or replace function public.credit_wallet(
  p_user_id uuid,
  p_amount int,
  p_description text,
  p_reference_id uuid default null
)
returns void as $$
declare
  v_current_balance int;
  v_new_balance int;
begin
  -- Get or create user_credits row
  select balance into v_current_balance
  from public.user_credits
  where user_id = p_user_id;

  if v_current_balance is null then
    insert into public.user_credits (user_id, balance) values (p_user_id, p_amount);
    v_new_balance := p_amount;
  else
    v_new_balance := v_current_balance + p_amount;
    update public.user_credits set balance = v_new_balance, updated_at = now()
    where user_id = p_user_id;
  end if;

  -- Log transaction
  insert into public.credit_transactions (user_id, amount, type, description)
  values (p_user_id, p_amount, 'purchase', p_description);
end;
$$ language plpgsql security definer;

-- Enable realtime
alter publication supabase_realtime add table payment_requests;
