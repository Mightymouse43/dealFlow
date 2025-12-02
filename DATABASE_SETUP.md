# Database Setup Instructions

This app requires a Supabase database table to store trade history. Follow these steps to set up the database:

## Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard at: https://supabase.com/dashboard
2. Navigate to the SQL Editor (left sidebar)
3. Click "New Query"
4. Copy and paste the contents of `supabase/migrations/20250101000000_create_trades_table.sql`
5. Click "Run" to execute the migration

## Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase db push
```

## Verifying the Setup

After running the migration, you can verify the table was created by:

1. Going to the "Table Editor" in your Supabase dashboard
2. Looking for a table named "trades"
3. The table should have the following columns:
   - id (uuid)
   - customer_name (text)
   - items (jsonb)
   - item_total (numeric)
   - trade_total (numeric)
   - cash_total (numeric)
   - trade_percent (numeric)
   - cash_percent (numeric)
   - transaction_type (text)
   - created_at (timestamptz)

## Troubleshooting

If you encounter any issues:

1. Make sure your Supabase project is active
2. Verify your `.env` file has the correct credentials:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
3. Check that Row Level Security (RLS) is enabled on the trades table
4. Ensure the policies are created (the migration script creates public access policies)
