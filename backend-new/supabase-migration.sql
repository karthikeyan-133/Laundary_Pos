-- Supabase Migration Script
-- This script updates the database schema to match the new laundry POS system structure

-- Add new service rate columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS ironRate NUMERIC(10,2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS washAndIronRate NUMERIC(10,2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS dryCleanRate NUMERIC(10,2) DEFAULT 0;

-- Add service column to order_items table with proper constraints
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS service TEXT;

-- Add constraint to limit values to iron, washAndIron, dryClean
ALTER TABLE order_items ADD CONSTRAINT service_check CHECK (service IN ('iron', 'washAndIron', 'dryClean'));

-- Update existing products to populate the new columns
-- This is a simple mapping - you may want to adjust these values based on your business needs
UPDATE products 
SET 
  ironRate = COALESCE(ironRate, 0),
  washAndIronRate = COALESCE(washAndIronRate, 0),
  dryCleanRate = COALESCE(dryCleanRate, 0);

-- Update order_items to set the service column
UPDATE order_items SET service = 'iron' WHERE service IS NULL;

-- Make the new columns NOT NULL (after populating data)
ALTER TABLE products ALTER COLUMN ironRate SET NOT NULL;
ALTER TABLE products ALTER COLUMN washAndIronRate SET NOT NULL;
ALTER TABLE products ALTER COLUMN dryCleanRate SET NOT NULL;
ALTER TABLE order_items ALTER COLUMN service SET NOT NULL;

-- Note: We're not dropping the old columns (price, sku, stock) yet to avoid data loss
-- You can drop them later once you've verified everything is working correctly
-- ALTER TABLE products DROP COLUMN price;
-- ALTER TABLE products DROP COLUMN sku;
-- ALTER TABLE products DROP COLUMN stock;

-- Update the sample products with proper service rates
UPDATE products 
SET 
  ironRate = 5.00,
  washAndIronRate = 15.00,
  dryCleanRate = 25.00
WHERE id = '1';

UPDATE products 
SET 
  ironRate = 7.00,
  washAndIronRate = 20.00,
  dryCleanRate = 35.00
WHERE id = '2';

UPDATE products 
SET 
  ironRate = 10.00,
  washAndIronRate = 25.00,
  dryCleanRate = 50.00
WHERE id = '3';

UPDATE products 
SET 
  ironRate = 8.00,
  washAndIronRate = 22.00,
  dryCleanRate = 40.00
WHERE id = '4';

UPDATE products 
SET 
  ironRate = 15.00,
  washAndIronRate = 35.00,
  dryCleanRate = 75.00
WHERE id = '5';

UPDATE products 
SET 
  ironRate = 12.00,
  washAndIronRate = 30.00,
  dryCleanRate = 45.00
WHERE id = '6';

UPDATE products 
SET 
  ironRate = 3.00,
  washAndIronRate = 8.00,
  dryCleanRate = 15.00
WHERE id = '7';

UPDATE products 
SET 
  ironRate = 20.00,
  washAndIronRate = 50.00,
  dryCleanRate = 80.00
WHERE id = '8';

UPDATE products 
SET 
  ironRate = 25.00,
  washAndIronRate = 60.00,
  dryCleanRate = 100.00
WHERE id = '9';

UPDATE products 
SET 
  ironRate = 10.00,
  washAndIronRate = 30.00,
  dryCleanRate = 60.00
WHERE id = '10';