-- ============================================================
-- 004: Bot Custom Commands – user-defined command aliases & responses
-- ============================================================

CREATE TABLE IF NOT EXISTS public.bot_custom_commands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  command text NOT NULL,
  action_type text NOT NULL CHECK (action_type IN ('alias','response')),
  alias_target text,
  response_text text,
  enabled boolean DEFAULT true,
  cooldown_seconds int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, command)
);

ALTER TABLE public.bot_custom_commands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own bot_custom_commands"
  ON public.bot_custom_commands FOR ALL USING (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.bot_custom_commands;
