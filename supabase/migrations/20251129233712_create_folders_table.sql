/*
  # Create folders table for organizing trades

  1. New Tables
    - `folders`
      - `id` (uuid, primary key) - Unique identifier for each folder
      - `name` (text, not null) - Name of the folder
      - `color` (text) - Optional color code for folder visual identification
      - `created_at` (timestamptz) - Timestamp when folder was created
      - `updated_at` (timestamptz) - Timestamp when folder was last updated
  
  2. Changes to Existing Tables
    - `trades`
      - Add `folder_id` (uuid, nullable, foreign key) - References folders table
      - Trades without a folder_id are considered "uncategorized"
  
  3. Security
    - Enable RLS on `folders` table
    - Add policies for public access (SELECT, INSERT, UPDATE, DELETE)
    - Add policy for trades to update folder_id

  4. Notes
    - Folders are optional - trades can exist without being in a folder
    - Deleting a folder will set folder_id to NULL for associated trades (not cascade delete)
    - Color field allows for visual organization in the UI
*/

-- Create folders table
CREATE TABLE IF NOT EXISTS folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text DEFAULT '#9c41a1',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add folder_id column to trades table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trades' AND column_name = 'folder_id'
  ) THEN
    ALTER TABLE trades ADD COLUMN folder_id uuid REFERENCES folders(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Enable Row Level Security on folders
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view folders" ON folders;
DROP POLICY IF EXISTS "Anyone can insert folders" ON folders;
DROP POLICY IF EXISTS "Anyone can update folders" ON folders;
DROP POLICY IF EXISTS "Anyone can delete folders" ON folders;
DROP POLICY IF EXISTS "Anyone can update trades" ON trades;

-- Folder policies
CREATE POLICY "Anyone can view folders"
  ON folders
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert folders"
  ON folders
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update folders"
  ON folders
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete folders"
  ON folders
  FOR DELETE
  USING (true);

-- Trade update policy for moving trades between folders
CREATE POLICY "Anyone can update trades"
  ON trades
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create index on folder_id for faster queries
CREATE INDEX IF NOT EXISTS trades_folder_id_idx ON trades(folder_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_folders_updated_at ON folders;
CREATE TRIGGER update_folders_updated_at
  BEFORE UPDATE ON folders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();