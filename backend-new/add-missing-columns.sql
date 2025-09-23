-- Add missing admin credentials columns to settings table
ALTER TABLE settings ADD COLUMN IF NOT EXISTS admin_username TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS admin_email TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS admin_password_hash TEXT;

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'settings' 
AND column_name IN ('admin_username', 'admin_email', 'admin_password_hash');