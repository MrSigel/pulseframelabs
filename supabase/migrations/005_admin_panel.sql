-- ============================================================
-- 005 – Admin Panel: user locking, IP whitelist, audit logs, admin RPC
-- ============================================================

-- 1. ALTER user_profiles — add lock & IP whitelist columns
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS is_locked boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS locked_at timestamptz,
  ADD COLUMN IF NOT EXISTS locked_reason text,
  ADD COLUMN IF NOT EXISTS ip_whitelist text[];

-- 2. Admin audit log table (accessed only via service_role, no user RLS)
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL REFERENCES auth.users(id),
  action text NOT NULL,
  target_user_id uuid REFERENCES auth.users(id),
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- No user-level RLS policies — only service_role can read/write
-- (admin API routes use createAdminClient which bypasses RLS)

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created
  ON public.admin_audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_target
  ON public.admin_audit_logs (target_user_id);

-- 3. Admin credit wallet RPC
-- Credits a target user's wallet and logs an audit entry
CREATE OR REPLACE FUNCTION public.admin_credit_wallet(
  p_admin_id uuid,
  p_target_user_id uuid,
  p_amount integer,
  p_description text DEFAULT 'Admin credit'
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet_id uuid;
  v_new_balance integer;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  -- Lock and update wallet
  SELECT id INTO v_wallet_id
    FROM wallets
    WHERE user_id = p_target_user_id
    FOR UPDATE;

  IF v_wallet_id IS NULL THEN
    RAISE EXCEPTION 'Wallet not found for user %', p_target_user_id;
  END IF;

  UPDATE wallets
    SET balance = balance + p_amount,
        total_deposited = total_deposited + p_amount,
        updated_at = now()
    WHERE id = v_wallet_id
    RETURNING balance INTO v_new_balance;

  -- Insert ledger entry
  INSERT INTO wallet_transactions (user_id, wallet_id, type, amount, balance_after, description, reference_id)
    VALUES (p_target_user_id, v_wallet_id, 'admin_credit', p_amount, v_new_balance, p_description, NULL);

  -- Audit log
  INSERT INTO admin_audit_logs (admin_user_id, action, target_user_id, details)
    VALUES (p_admin_id, 'credit_wallet', p_target_user_id,
      jsonb_build_object('amount', p_amount, 'description', p_description, 'new_balance', v_new_balance));
END;
$$;

-- 4. Admin debit wallet RPC
CREATE OR REPLACE FUNCTION public.admin_debit_wallet(
  p_admin_id uuid,
  p_target_user_id uuid,
  p_amount integer,
  p_description text DEFAULT 'Admin debit'
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet_id uuid;
  v_current_balance integer;
  v_new_balance integer;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  SELECT id, balance INTO v_wallet_id, v_current_balance
    FROM wallets
    WHERE user_id = p_target_user_id
    FOR UPDATE;

  IF v_wallet_id IS NULL THEN
    RAISE EXCEPTION 'Wallet not found for user %', p_target_user_id;
  END IF;

  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance: has %, needs %', v_current_balance, p_amount;
  END IF;

  UPDATE wallets
    SET balance = balance - p_amount,
        total_spent = total_spent + p_amount,
        updated_at = now()
    WHERE id = v_wallet_id
    RETURNING balance INTO v_new_balance;

  INSERT INTO wallet_transactions (user_id, wallet_id, type, amount, balance_after, description, reference_id)
    VALUES (p_target_user_id, v_wallet_id, 'admin_debit', -p_amount, v_new_balance, p_description, NULL);

  INSERT INTO admin_audit_logs (admin_user_id, action, target_user_id, details)
    VALUES (p_admin_id, 'debit_wallet', p_target_user_id,
      jsonb_build_object('amount', p_amount, 'description', p_description, 'new_balance', v_new_balance));
END;
$$;
