/*
  # Fix Security Issues - Comprehensive Security Hardening

  1. RLS Performance Optimization
    - Wrap auth.uid() with (select auth.uid()) in all policies to prevent re-evaluation per row
    - Affects: trades, folders, user_profiles, daily_scans tables
  
  2. Remove Duplicate Permissive Policies
    - coin_flips: Remove "Anyone can..." policies (keep user-specific)
    - user_settings: Remove "Anyone can..." policies (keep user-specific)
    - user_profiles: Consolidate duplicate UPDATE policies
  
  3. Fix Function Search Paths
    - Add explicit search_path to all SECURITY DEFINER functions
    - Prevents search_path injection attacks
    - Affects: handle_new_user, is_user_pro, can_user_scan, increment_scan_count, activate_free_trial
  
  4. Clean Up Unused Indexes
    - Remove indexes that are not being used
    - Improves write performance and reduces storage
  
  5. Important Notes
    - These changes improve security and performance
    - No data will be lost
    - All functionality remains the same
    
  6. Manual Action Required
    - Enable "Leaked Password Protection" in Supabase Dashboard:
      Authentication > Providers > Email > Password Protection
*/

-- ============================================================================
-- 1. FIX RLS PERFORMANCE - Wrap auth.uid() with (select auth.uid())
-- ============================================================================

-- TRADES TABLE POLICIES
DROP POLICY IF EXISTS "Users can view own trades" ON trades;
DROP POLICY IF EXISTS "Users can insert own trades" ON trades;
DROP POLICY IF EXISTS "Users can update own trades" ON trades;
DROP POLICY IF EXISTS "Users can delete own trades" ON trades;

CREATE POLICY "Users can view own trades"
  ON trades
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own trades"
  ON trades
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own trades"
  ON trades
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own trades"
  ON trades
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- FOLDERS TABLE POLICIES
DROP POLICY IF EXISTS "Users can view own folders" ON folders;
DROP POLICY IF EXISTS "Users can insert own folders" ON folders;
DROP POLICY IF EXISTS "Users can update own folders" ON folders;
DROP POLICY IF EXISTS "Users can delete own folders" ON folders;

CREATE POLICY "Users can view own folders"
  ON folders
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own folders"
  ON folders
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own folders"
  ON folders
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own folders"
  ON folders
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- USER_PROFILES TABLE POLICIES
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can activate own trial" ON user_profiles;

CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- DAILY_SCANS TABLE POLICIES
DROP POLICY IF EXISTS "Users can view own scans" ON daily_scans;
DROP POLICY IF EXISTS "Users can insert own scans" ON daily_scans;
DROP POLICY IF EXISTS "Users can update own scans" ON daily_scans;

CREATE POLICY "Users can view own scans"
  ON daily_scans
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own scans"
  ON daily_scans
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own scans"
  ON daily_scans
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================================
-- 2. REMOVE DUPLICATE PERMISSIVE POLICIES
-- ============================================================================

-- COIN_FLIPS: Remove "Anyone can..." policies (user-specific policies exist)
DROP POLICY IF EXISTS "Anyone can read coin flips" ON coin_flips;
DROP POLICY IF EXISTS "Anyone can insert coin flips" ON coin_flips;

-- USER_SETTINGS: Remove "Anyone can..." policies (user-specific policies exist)
DROP POLICY IF EXISTS "Anyone can read settings" ON user_settings;
DROP POLICY IF EXISTS "Anyone can insert settings" ON user_settings;
DROP POLICY IF EXISTS "Anyone can update settings" ON user_settings;

-- ============================================================================
-- 3. FIX FUNCTION SEARCH PATHS
-- ============================================================================

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, subscription_tier)
  VALUES (NEW.id, NEW.email, 'free');
  RETURN NEW;
END;
$$;

-- Fix is_user_pro function
CREATE OR REPLACE FUNCTION public.is_user_pro(user_uuid uuid)
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  tier text;
  expires timestamptz;
  trial_end timestamptz;
BEGIN
  SELECT subscription_tier, subscription_expires, trial_end_date
  INTO tier, expires, trial_end
  FROM user_profiles
  WHERE id = user_uuid;
  
  -- Check if user has an active trial
  IF trial_end IS NOT NULL AND trial_end > now() THEN
    RETURN true;
  END IF;
  
  -- Check if user has active PRO subscription
  IF tier = 'pro' THEN
    IF expires IS NULL OR expires > now() THEN
      RETURN true;
    END IF;
  END IF;
  
  RETURN false;
END;
$$;

-- Fix can_user_scan function
CREATE OR REPLACE FUNCTION public.can_user_scan(user_uuid uuid)
RETURNS json 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, auth
AS $$
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
$$;

-- Fix increment_scan_count function
CREATE OR REPLACE FUNCTION public.increment_scan_count(user_uuid uuid)
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO daily_scans (user_id, scan_date, scan_count)
  VALUES (user_uuid, CURRENT_DATE, 1)
  ON CONFLICT (user_id, scan_date)
  DO UPDATE SET scan_count = daily_scans.scan_count + 1;
  
  RETURN true;
END;
$$;

-- Fix activate_free_trial function
CREATE OR REPLACE FUNCTION public.activate_free_trial(user_uuid uuid)
RETURNS json 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  existing_trial timestamptz;
  new_trial_end timestamptz;
BEGIN
  -- Check if user already had a trial
  SELECT trial_end_date INTO existing_trial
  FROM user_profiles
  WHERE id = user_uuid;
  
  -- If trial was already activated, return error
  IF existing_trial IS NOT NULL THEN
    RETURN json_build_object(
      'success', false, 
      'message', 'Free trial already used',
      'trial_end_date', NULL
    );
  END IF;
  
  -- Set trial end date to 7 days from now
  new_trial_end := now() + interval '7 days';
  
  -- Update user profile
  UPDATE user_profiles
  SET trial_end_date = new_trial_end,
      updated_at = now()
  WHERE id = user_uuid;
  
  RETURN json_build_object(
    'success', true,
    'message', '7-day free trial activated',
    'trial_end_date', new_trial_end
  );
END;
$$;

-- ============================================================================
-- 4. CLEAN UP UNUSED INDEXES
-- ============================================================================

-- Drop unused indexes (keeping essential foreign key indexes)
DROP INDEX IF EXISTS idx_coin_flips_created_at;
DROP INDEX IF EXISTS user_profiles_email_idx;
DROP INDEX IF EXISTS user_profiles_subscription_tier_idx;
DROP INDEX IF EXISTS idx_user_settings_created_at;

-- Note: Keeping the following indexes as they may be used for foreign key lookups:
-- - trades_user_id_idx
-- - trades_folder_id_idx  
-- - folders_user_id_idx
-- - user_settings_user_id_idx
-- - coin_flips_user_id_idx
-- - daily_scans_user_date_idx