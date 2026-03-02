-- Add global currency setting to user_profiles
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'USD';
