/*
  # Fix Trades RLS Policies for User Data Isolation

  1. Problem
    - Current policies allow anyone (public) to view, insert, update, and delete ALL trades
    - The SELECT policy has `OR user_id IS NULL` which creates a security hole
    - This causes trades to appear across different user accounts
    - Multiple conflicting policies exist (public access + user-specific)

  2. Changes
    - Delete any trades without a user_id (orphaned data)
    - Make user_id NOT NULL to prevent future issues
    - Remove all insecure "Anyone can..." policies
    - Update "Users can view own trades" to remove the `OR user_id IS NULL` clause
    - Ensure all policies strictly check `auth.uid() = user_id`

  3. Security
    - Users can ONLY view their own trades
    - Users can ONLY insert trades with their own user_id
    - Users can ONLY update/delete their own trades
    - No public access or exceptions that could leak data

  4. Important Notes
    - This migration will make user_id required for all trades
    - Any trades without a user_id will be deleted
    - This is a critical security fix for data isolation
*/

-- First, delete any trades that don't have a user_id (orphaned trades)
DELETE FROM trades WHERE user_id IS NULL;

-- Make user_id NOT NULL to prevent future issues
ALTER TABLE trades ALTER COLUMN user_id SET NOT NULL;

-- Drop all existing policies on trades
DROP POLICY IF EXISTS "Anyone can view trades" ON trades;
DROP POLICY IF EXISTS "Anyone can insert trades" ON trades;
DROP POLICY IF EXISTS "Anyone can update trades" ON trades;
DROP POLICY IF EXISTS "Anyone can delete trades" ON trades;
DROP POLICY IF EXISTS "Users can view own trades" ON trades;
DROP POLICY IF EXISTS "Users can insert own trades" ON trades;
DROP POLICY IF EXISTS "Users can update own trades" ON trades;
DROP POLICY IF EXISTS "Users can delete own trades" ON trades;

-- Create strict user-specific policies
CREATE POLICY "Users can view own trades"
  ON trades
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

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
