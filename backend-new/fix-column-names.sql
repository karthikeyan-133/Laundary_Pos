-- Fix column names to match frontend expectations
-- Rename lowercase columns to proper camelCase format
-- This script safely handles cases where columns may or may not exist

-- Check if ironrate column exists and rename it to ironRate
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'ironrate'
  ) THEN
    ALTER TABLE products RENAME COLUMN ironrate TO "ironRate";
  END IF;
END $$;

-- Check if washandironrate column exists and rename it to washAndIronRate
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'washandironrate'
  ) THEN
    ALTER TABLE products RENAME COLUMN washandironrate TO "washAndIronRate";
  END IF;
END $$;

-- Check if drycleanrate column exists and rename it to dryCleanRate
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'drycleanrate'
  ) THEN
    ALTER TABLE products RENAME COLUMN drycleanrate TO "dryCleanRate";
  END IF;
END $$;

-- Ensure the new columns exist with proper data types
ALTER TABLE products ADD COLUMN IF NOT EXISTS "ironRate" NUMERIC(10,2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "washAndIronRate" NUMERIC(10,2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "dryCleanRate" NUMERIC(10,2) DEFAULT 0;

-- Make sure the columns are NOT NULL
ALTER TABLE products ALTER COLUMN "ironRate" SET NOT NULL;
ALTER TABLE products ALTER COLUMN "washAndIronRate" SET NOT NULL;
ALTER TABLE products ALTER COLUMN "dryCleanRate" SET NOT NULL;

-- Verify the changes
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('ironRate', 'washAndIronRate', 'dryCleanRate');