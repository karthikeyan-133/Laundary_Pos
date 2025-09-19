const supabase = require('./supabaseClient');

async function autoMigrateDatabase() {
  console.log('Starting automatic database migration...');
  
  try {
    // First, let's check the current structure
    console.log('Checking current database structure...');
    
    // Get a sample product to see current structure
    const { data: sampleProduct, error: productError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (productError) {
      console.error('Error fetching sample product:', productError);
      return;
    }
    
    console.log('Sample product structure:', sampleProduct ? sampleProduct[0] : 'No products found');
    
    // Check if the new columns already exist
    const hasIronRate = sampleProduct && sampleProduct[0] && sampleProduct[0].hasOwnProperty('ironRate');
    const hasWashAndIronRate = sampleProduct && sampleProduct[0] && sampleProduct[0].hasOwnProperty('washAndIronRate');
    const hasDryCleanRate = sampleProduct && sampleProduct[0] && sampleProduct[0].hasOwnProperty('dryCleanRate');
    
    console.log('Current column status:');
    console.log('- ironRate:', hasIronRate ? 'EXISTS' : 'MISSING');
    console.log('- washAndIronRate:', hasWashAndIronRate ? 'EXISTS' : 'MISSING');
    console.log('- dryCleanRate:', hasDryCleanRate ? 'EXISTS' : 'MISSING');
    
    // Check if old price column exists
    const hasPriceColumn = sampleProduct && sampleProduct[0] && sampleProduct[0].hasOwnProperty('price');
    console.log('- price (old):', hasPriceColumn ? 'EXISTS' : 'MISSING');
    
    // If columns don't exist or we have old price column, we need to inform the user to run the SQL migration manually
    if (!hasIronRate || !hasWashAndIronRate || !hasDryCleanRate || hasPriceColumn) {
      console.log('\n⚠️  Database needs migration.');
      console.log('Please run the following SQL commands in your Supabase SQL editor:');
      console.log(`
-- Complete Database Migration Script
-- This script handles both fresh installations and upgrades from older versions
-- It removes the old price column and sets up the new service-specific rate columns

-- Check if the old price column exists and migrate data if needed
DO $$
BEGIN
  -- Check if the old price column exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'price'
  ) THEN
    -- Add new service rate columns if they don't exist
    ALTER TABLE products ADD COLUMN IF NOT EXISTS ironRate NUMERIC(10,2) DEFAULT 0;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS washAndIronRate NUMERIC(10,2) DEFAULT 0;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS dryCleanRate NUMERIC(10,2) DEFAULT 0;
    
    -- Migrate existing price data to new service rate columns
    -- Using common ratios for a laundry business
    UPDATE products 
    SET 
      ironRate = COALESCE(price * 0.5, 0),
      washAndIronRate = COALESCE(price * 0.8, 0),
      dryCleanRate = COALESCE(price * 1.2, 0)
    WHERE ironRate = 0 AND washAndIronRate = 0 AND dryCleanRate = 0;
    
    -- Make the new columns NOT NULL
    ALTER TABLE products ALTER COLUMN ironRate SET NOT NULL;
    ALTER TABLE products ALTER COLUMN washAndIronRate SET NOT NULL;
    ALTER TABLE products ALTER COLUMN dryCleanRate SET NOT NULL;
    
    -- Now drop the old price column since we've migrated the data
    ALTER TABLE products DROP COLUMN price;
  ELSE
    -- If no old price column exists, ensure new columns exist with defaults
    ALTER TABLE products ADD COLUMN IF NOT EXISTS ironRate NUMERIC(10,2) DEFAULT 0;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS washAndIronRate NUMERIC(10,2) DEFAULT 0;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS dryCleanRate NUMERIC(10,2) DEFAULT 0;
    
    -- Make the new columns NOT NULL if they aren't already
    ALTER TABLE products ALTER COLUMN ironRate SET NOT NULL;
    ALTER TABLE products ALTER COLUMN washAndIronRate SET NOT NULL;
    ALTER TABLE products ALTER COLUMN dryCleanRate SET NOT NULL;
  END IF;
END $$;

-- Ensure order_items table has service column
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS service TEXT DEFAULT 'iron';

-- Add constraint to limit values to iron, washAndIron, dryClean
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'service_check'
  ) THEN
    ALTER TABLE order_items ADD CONSTRAINT service_check CHECK (service IN ('iron', 'washAndIron', 'dryClean'));
  END IF;
END $$;

-- Update order_items to set the service column for existing records
UPDATE order_items SET service = 'iron' WHERE service IS NULL;

-- Make the service column NOT NULL
ALTER TABLE order_items ALTER COLUMN service SET NOT NULL;

-- Update sample products with proper service rates if they have default values
UPDATE products 
SET 
  ironRate = 5.00,
  washAndIronRate = 15.00,
  dryCleanRate = 25.00
WHERE id = '1' AND (ironRate = 0 OR washAndIronRate = 0 OR dryCleanRate = 0);

UPDATE products 
SET 
  ironRate = 7.00,
  washAndIronRate = 20.00,
  dryCleanRate = 35.00
WHERE id = '2' AND (ironRate = 0 OR washAndIronRate = 0 OR dryCleanRate = 0);

UPDATE products 
SET 
  ironRate = 10.00,
  washAndIronRate = 25.00,
  dryCleanRate = 50.00
WHERE id = '3' AND (ironRate = 0 OR washAndIronRate = 0 OR dryCleanRate = 0);

UPDATE products 
SET 
  ironRate = 8.00,
  washAndIronRate = 22.00,
  dryCleanRate = 40.00
WHERE id = '4' AND (ironRate = 0 OR washAndIronRate = 0 OR dryCleanRate = 0);

UPDATE products 
SET 
  ironRate = 15.00,
  washAndIronRate = 35.00,
  dryCleanRate = 75.00
WHERE id = '5' AND (ironRate = 0 OR washAndIronRate = 0 OR dryCleanRate = 0);

UPDATE products 
SET 
  ironRate = 12.00,
  washAndIronRate = 30.00,
  dryCleanRate = 45.00
WHERE id = '6' AND (ironRate = 0 OR washAndIronRate = 0 OR dryCleanRate = 0);

UPDATE products 
SET 
  ironRate = 3.00,
  washAndIronRate = 8.00,
  dryCleanRate = 15.00
WHERE id = '7' AND (ironRate = 0 OR washAndIronRate = 0 OR dryCleanRate = 0);

UPDATE products 
SET 
  ironRate = 20.00,
  washAndIronRate = 50.00,
  dryCleanRate = 80.00
WHERE id = '8' AND (ironRate = 0 OR washAndIronRate = 0 OR dryCleanRate = 0);

UPDATE products 
SET 
  ironRate = 25.00,
  washAndIronRate = 60.00,
  dryCleanRate = 100.00
WHERE id = '9' AND (ironRate = 0 OR washAndIronRate = 0 OR dryCleanRate = 0);

UPDATE products 
SET 
  ironRate = 10.00,
  washAndIronRate = 30.00,
  dryCleanRate = 60.00
WHERE id = '10' AND (ironRate = 0 OR washAndIronRate = 0 OR dryCleanRate = 0);
      `);
      console.log('\nAfter running these commands, please restart your application.');
      return;
    }
    
    // If columns exist and we don't have old price column, let's check if they have proper values
    console.log('\n✅ Database structure looks correct.');
    console.log('Migration completed successfully.');
    
  } catch (err) {
    console.error('Error during migration:', err);
  }
}

// Run the migration
autoMigrateDatabase();