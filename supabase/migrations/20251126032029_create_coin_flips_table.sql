/*
  # Create Coin Flips Table

  1. New Tables
    - `coin_flips`
      - `id` (uuid, primary key) - Unique identifier for the coin flip
      - `base_price` (numeric) - The original base price
      - `win_price` (numeric) - Price if buyer wins
      - `lose_price` (numeric) - Price if vendor wins
      - `winner` (text) - Who won: 'buyer' or 'vendor'
      - `final_price` (numeric) - The final price after the flip
      - `created_at` (timestamptz) - When the flip was made

  2. Security
    - Enable RLS on `coin_flips` table
    - Add policy for anyone to read coin flips (for now, without auth)
    - Add policy for anyone to insert coin flips (for now, without auth)

  3. Notes
    - Stores history of all coin flips
    - Can be displayed in history or analytics later
    - When auth is added, we can link this to user accounts
*/

CREATE TABLE IF NOT EXISTS coin_flips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  base_price numeric NOT NULL,
  win_price numeric NOT NULL,
  lose_price numeric NOT NULL,
  winner text NOT NULL CHECK (winner IN ('buyer', 'vendor')),
  final_price numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE coin_flips ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read coin flips (for now, without auth)
CREATE POLICY "Anyone can read coin flips"
  ON coin_flips
  FOR SELECT
  USING (true);

-- Allow anyone to insert coin flips (for now, without auth)
CREATE POLICY "Anyone can insert coin flips"
  ON coin_flips
  FOR INSERT
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_coin_flips_created_at ON coin_flips(created_at DESC);