/*
  # Create User Settings Table

  1. New Tables
    - `user_settings`
      - `id` (uuid, primary key) - Unique identifier for the settings record
      - `trade_percent` (integer, default 90) - Default trade percentage
      - `cash_percent` (integer, default 80) - Default cash percentage
      - `created_at` (timestamptz) - When the settings were created
      - `updated_at` (timestamptz) - When the settings were last updated

  2. Security
    - Enable RLS on `user_settings` table
    - Add policy for users to read their own settings
    - Add policy for users to insert their own settings
    - Add policy for users to update their own settings

  3. Notes
    - For now, we'll use a single row per device (no auth yet)
    - When auth is added, we can link this to user accounts
*/

CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_percent integer DEFAULT 90 CHECK (trade_percent >= 0 AND trade_percent <= 100),
  cash_percent integer DEFAULT 80 CHECK (cash_percent >= 0 AND cash_percent <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read settings (for now, without auth)
CREATE POLICY "Anyone can read settings"
  ON user_settings
  FOR SELECT
  USING (true);

-- Allow anyone to insert settings (for now, without auth)
CREATE POLICY "Anyone can insert settings"
  ON user_settings
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to update settings (for now, without auth)
CREATE POLICY "Anyone can update settings"
  ON user_settings
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_settings_created_at ON user_settings(created_at DESC);