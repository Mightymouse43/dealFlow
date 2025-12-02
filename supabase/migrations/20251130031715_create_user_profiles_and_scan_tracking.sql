/*
  # Create user profiles and scan tracking system

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key) - References auth.users(id)
      - `email` (text, not null) - User's email address
      - `subscription_tier` (text, not null) - Either 'free' or 'pro'
      - `subscription_expires` (timestamptz, nullable) - Expiration date for PRO subscriptions
      - `created_at` (timestamptz) - Account creation timestamp
      - `updated_at` (timestamptz) - Last profile update timestamp
    
    - `daily_scans`
      - `id` (uuid, primary key) - Unique identifier
      - `user_id` (uuid, not null) - References user_profiles(id)
      - `scan_date` (date, not null) - Date of the scan
      - `scan_count` (integer, not null) - Number of scans performed that day
      - `created_at` (timestamptz) - Timestamp
      - Unique constraint on (user_id, scan_date)
  
  2. Changes to Existing Tables
    - `trades`: Add `user_id` column to link trades to users
    - `folders`: Add `user_id` column to link folders to users
    - `user_settings`: Add `user_id` column to link settings to users
    - `coin_flips`: Add `user_id` column to link coin flips to users
  
  3. Security
    - Enable RLS on all tables
    - Users can only access their own data
    - Create policies for authenticated users
    - PRO users bypass scan limits
  
  4. Functions
    - Function to automatically create user profile on signup
    - Function to check and increment daily scan count
    - Function to check if user is PRO
  
  5. Notes
    - Free users: 3 scans per day limit
    - PRO users: Unlimited scans, save history, custom item percentages
    - Existing data (no user_id) remains accessible to all for backward compatibility
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  subscription_tier text NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
  subscription_expires timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create daily_scans table
CREATE TABLE IF NOT EXISTS daily_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  scan_date date NOT NULL DEFAULT CURRENT_DATE,
  scan_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, scan_date)
);

-- Add user_id columns to existing tables if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trades' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE trades ADD COLUMN user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'folders' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE folders ADD COLUMN user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'coin_flips' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE coin_flips ADD COLUMN user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS on user_profiles and daily_scans
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_scans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own scans" ON daily_scans;
DROP POLICY IF EXISTS "Users can update own scans" ON daily_scans;
DROP POLICY IF EXISTS "Users can insert own scans" ON daily_scans;

-- User profiles policies
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Daily scans policies
CREATE POLICY "Users can view own scans"
  ON daily_scans
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scans"
  ON daily_scans
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scans"
  ON daily_scans
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Update existing table policies to include user-specific access
DROP POLICY IF EXISTS "Users can view own trades" ON trades;
DROP POLICY IF EXISTS "Users can insert own trades" ON trades;
DROP POLICY IF EXISTS "Users can update own trades" ON trades;
DROP POLICY IF EXISTS "Users can delete own trades" ON trades;

CREATE POLICY "Users can view own trades"
  ON trades
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own trades"
  ON trades
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades"
  ON trades
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trades"
  ON trades
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Update folders policies
DROP POLICY IF EXISTS "Users can view own folders" ON folders;
DROP POLICY IF EXISTS "Users can insert own folders" ON folders;
DROP POLICY IF EXISTS "Users can update own folders" ON folders;
DROP POLICY IF EXISTS "Users can delete own folders" ON folders;

CREATE POLICY "Users can view own folders"
  ON folders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own folders"
  ON folders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own folders"
  ON folders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own folders"
  ON folders
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Update user_settings policies
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;

CREATE POLICY "Users can view own settings"
  ON user_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own settings"
  ON user_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Update coin_flips policies
DROP POLICY IF EXISTS "Users can view own coin flips" ON coin_flips;
DROP POLICY IF EXISTS "Users can insert own coin flips" ON coin_flips;

CREATE POLICY "Users can view own coin flips"
  ON coin_flips
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own coin flips"
  ON coin_flips
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS user_profiles_email_idx ON user_profiles(email);
CREATE INDEX IF NOT EXISTS user_profiles_subscription_tier_idx ON user_profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS daily_scans_user_date_idx ON daily_scans(user_id, scan_date);
CREATE INDEX IF NOT EXISTS trades_user_id_idx ON trades(user_id);
CREATE INDEX IF NOT EXISTS folders_user_id_idx ON folders(user_id);
CREATE INDEX IF NOT EXISTS user_settings_user_id_idx ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS coin_flips_user_id_idx ON coin_flips(user_id);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, subscription_tier)
  VALUES (NEW.id, NEW.email, 'free');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to check if user is PRO
CREATE OR REPLACE FUNCTION public.is_user_pro(user_uuid uuid)
RETURNS boolean AS $$
DECLARE
  tier text;
  expires timestamptz;
BEGIN
  SELECT subscription_tier, subscription_expires
  INTO tier, expires
  FROM user_profiles
  WHERE id = user_uuid;
  
  IF tier = 'pro' THEN
    IF expires IS NULL OR expires > now() THEN
      RETURN true;
    END IF;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and increment scan count
CREATE OR REPLACE FUNCTION public.can_user_scan(user_uuid uuid)
RETURNS json AS $$
DECLARE
  is_pro boolean;
  current_count integer;
  result json;
BEGIN
  -- Check if user is PRO
  is_pro := public.is_user_pro(user_uuid);
  
  IF is_pro THEN
    RETURN json_build_object('can_scan', true, 'remaining', -1, 'is_pro', true);
  END IF;
  
  -- Get current scan count for today
  SELECT scan_count INTO current_count
  FROM daily_scans
  WHERE user_id = user_uuid AND scan_date = CURRENT_DATE;
  
  -- If no record exists, count is 0
  IF current_count IS NULL THEN
    current_count := 0;
  END IF;
  
  -- Check if under limit (3 scans per day for free users)
  IF current_count >= 3 THEN
    RETURN json_build_object('can_scan', false, 'remaining', 0, 'is_pro', false);
  END IF;
  
  RETURN json_build_object('can_scan', true, 'remaining', 3 - current_count, 'is_pro', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment scan count
CREATE OR REPLACE FUNCTION public.increment_scan_count(user_uuid uuid)
RETURNS boolean AS $$
BEGIN
  INSERT INTO daily_scans (user_id, scan_date, scan_count)
  VALUES (user_uuid, CURRENT_DATE, 1)
  ON CONFLICT (user_id, scan_date)
  DO UPDATE SET scan_count = daily_scans.scan_count + 1;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update updated_at timestamp trigger for user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();