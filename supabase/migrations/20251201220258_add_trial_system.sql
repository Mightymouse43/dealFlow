/*
  # Add Free Trial System

  1. Changes to Existing Tables
    - `user_profiles`: Add `trial_end_date` column to track when free trial expires
  
  2. Functions
    - Update `is_user_pro` function to check trial status
    - Create `activate_free_trial` function to start a 7-day trial
  
  3. Notes
    - Trial grants full PRO access for 7 days
    - After trial expires, user reverts to free tier
    - Users can only activate trial once
*/

-- Add trial_end_date column to user_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'trial_end_date'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN trial_end_date timestamptz;
  END IF;
END $$;

-- Update is_user_pro function to include trial logic
CREATE OR REPLACE FUNCTION public.is_user_pro(user_uuid uuid)
RETURNS boolean AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to activate free trial
CREATE OR REPLACE FUNCTION public.activate_free_trial(user_uuid uuid)
RETURNS json AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add policy for users to activate their own trial
CREATE POLICY "Users can activate own trial"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);