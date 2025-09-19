const { supabase } = require('./supabaseDb');

async function migrateDatabase() {
  console.log('Starting database migration...');
  
  try {
    // First, add the new columns
    console.log('Adding new columns...');
    
    // Note: In Supabase, you would typically do this through the dashboard or SQL editor
    // For this script, we'll just log the SQL commands you need to run
    
    console.log('Run these SQL commands in your Supabase SQL editor:');
    console.log(`
-- Add new service rate columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS ironRate NUMERIC(10,2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS washAndIronRate NUMERIC(10,2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS dryCleanRate NUMERIC(10,2) DEFAULT 0;

-- Update existing data to populate the new columns (example mapping)
UPDATE products 
SET 
  ironRate = COALESCE(price * 0.5, 0),
  washAndIronRate = COALESCE(price * 0.8, 0),
  dryCleanRate = COALESCE(price * 1.2, 0)
WHERE ironRate = 0 AND washAndIronRate = 0 AND dryCleanRate = 0;

-- Make the new columns NOT NULL (after populating data)
ALTER TABLE products ALTER COLUMN ironRate SET NOT NULL;
ALTER TABLE products ALTER COLUMN washAndIronRate SET NOT NULL;
ALTER TABLE products ALTER COLUMN dryCleanRate SET NOT NULL;
    `);
    
    // For order_items, add the service column
    console.log(`
-- Add service column to order_items
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS service TEXT DEFAULT 'iron';
UPDATE order_items SET service = 'iron' WHERE service IS NULL;
ALTER TABLE order_items ALTER COLUMN service SET NOT NULL;
    `);
    
    console.log('Migration commands logged. Please run these in your Supabase SQL editor.');
    console.log('After running the commands, restart your application.');
    
  } catch (err) {
    console.error('Error during migration:', err);
  }
}

// Run the migration
migrateDatabase();