# Supabase Setup Instructions for Tally POS

## Issue Summary
The settings table in your Supabase database is missing the admin credentials columns:
- `admin_username`
- `admin_email`
- `admin_password_hash`

This is causing the signup endpoint to fail with the error: "column settings.admin_username does not exist"

## Solution Steps

### 1. Add Missing Columns to Settings Table

You need to run the following SQL commands in your Supabase SQL editor:

```sql
-- Add missing admin credentials columns to settings table
ALTER TABLE settings ADD COLUMN IF NOT EXISTS admin_username TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS admin_email TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS admin_password_hash TEXT;
```

To do this:
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Paste the above SQL commands
4. Run the commands

### 2. Verify the Columns Were Added

After running the commands, you can verify the columns were added by running:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'settings' 
AND column_name IN ('admin_username', 'admin_email', 'admin_password_hash');
```

### 3. Test the Signup Endpoint

After adding the columns, restart your server and try the signup endpoint again:

```bash
# In your project directory
npm run dev
```

Then make a POST request to `/auth/signup` with the required data.

## Alternative Solution: Recreate the Settings Table

If the above doesn't work, you can drop and recreate the settings table with the complete schema:

```sql
-- Drop the existing settings table
DROP TABLE IF EXISTS settings;

-- Recreate with complete schema
CREATE TABLE settings (
  id INTEGER PRIMARY KEY,
  tax_rate NUMERIC DEFAULT 5.00,
  currency TEXT DEFAULT 'AED',
  business_name TEXT DEFAULT 'TallyPrime Café',
  business_address TEXT,
  business_phone TEXT DEFAULT '+971 4 123 4567',
  barcode_scanner_enabled BOOLEAN DEFAULT TRUE,
  /* Admin credentials */
  admin_username TEXT,
  admin_email TEXT,
  admin_password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default row
INSERT INTO settings (id) VALUES (1);
```

## Troubleshooting

If you continue to have issues:

1. Check that your SUPABASE_URL and SUPABASE_KEY in the `.env` file are correct
2. Ensure you've deployed the database schema to Supabase
3. Verify that the Supabase project is properly configured
4. Check the Supabase logs for any additional error information

## Testing the Connection

You can test your Supabase connection by running:

```bash
node test-supabase.js
```

This will verify that:
1. The connection to Supabase is working
2. The settings table exists
3. All required columns are present