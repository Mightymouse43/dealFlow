/*
  # Fix Folders RLS Policies for User Data Isolation

  1. Problem
    - Current policies allow users to see folders from other accounts
    - The SELECT policy has `OR user_id IS NULL` which creates a security hole
    - This causes folders to appear across different user accounts

  2. Changes
    - Update RLS policies to ONLY allow users to access their own folders
    - Remove the `OR user_id IS NULL` clause from SELECT policy
    - Ensure all policies strictly check `auth.uid() = user_id`
    - Make user_id NOT NULL to prevent future issues

  3. Security
    - Users can ONLY view their own folders
    - Users can ONLY insert folders with their own user_id
    - Users can ONLY update/delete their own folders
    - No exceptions or fallbacks that could leak data

  4. Important Notes
    - This migration will make user_id required for all folders
    - Any folders without a user_id will need to be handled (deleted or assigned)
    - This is a critical security fix for data isolation
*/

-- First, delete any folders that don't have a user_id (orphaned folders)
-- These are likely test data or data created before user_id was properly set
DELETE FROM folders WHERE user_id IS NULL;

-- Make user_id NOT NULL to prevent future issues
ALTER TABLE folders ALTER COLUMN user_id SET NOT NULL;

-- Drop all existing policies on folders
DROP POLICY IF EXISTS "Anyone can view folders" ON folders;
DROP POLICY IF EXISTS "Anyone can insert folders" ON folders;
DROP POLICY IF EXISTS "Anyone can update folders" ON folders;
DROP POLICY IF EXISTS "Anyone can delete folders" ON folders;
DROP POLICY IF EXISTS "Users can view own folders" ON folders;
DROP POLICY IF EXISTS "Users can insert own folders" ON folders;
DROP POLICY IF EXISTS "Users can update own folders" ON folders;
DROP POLICY IF EXISTS "Users can delete own folders" ON folders;

-- Create strict user-specific policies
CREATE POLICY "Users can view own folders"
  ON folders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

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
