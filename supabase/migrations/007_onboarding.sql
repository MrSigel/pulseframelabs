-- Add onboarding tracking to user_profiles
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;
