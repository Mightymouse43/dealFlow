-- Create trades table
CREATE TABLE IF NOT EXISTS trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text,
  items jsonb NOT NULL,
  item_total numeric NOT NULL,
  trade_total numeric NOT NULL,
  cash_total numeric NOT NULL,
  trade_percent numeric NOT NULL,
  cash_percent numeric NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('cash', 'trade')),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view trades" ON trades;
DROP POLICY IF EXISTS "Anyone can insert trades" ON trades;
DROP POLICY IF EXISTS "Anyone can delete trades" ON trades;

-- Allow anyone to view trades
CREATE POLICY "Anyone can view trades"
  ON trades
  FOR SELECT
  USING (true);

-- Allow anyone to insert trades
CREATE POLICY "Anyone can insert trades"
  ON trades
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to delete trades
CREATE POLICY "Anyone can delete trades"
  ON trades
  FOR DELETE
  USING (true);
