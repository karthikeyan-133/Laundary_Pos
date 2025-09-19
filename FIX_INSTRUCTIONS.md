# Fix Instructions for Tally POS System

## Issue Summary
The Tally POS system is experiencing calculation issues because:
1. The database still has the old structure with `price`, `sku`, and `stock` columns
2. The application expects the new structure with service-specific rates (`ironRate`, `washAndIronRate`, `dryCleanRate`)
3. The `order_items` table is missing the `service` column

## Solution Steps

### Step 1: Update Database Structure

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the following SQL commands:

```sql
-- Add new service rate columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS ironRate NUMERIC(10,2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS washAndIronRate NUMERIC(10,2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS dryCleanRate NUMERIC(10,2) DEFAULT 0;

-- Add service column to order_items table
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS service TEXT DEFAULT 'iron';

-- Update existing products to populate the new columns
UPDATE products 
SET 
  ironRate = COALESCE(price * 0.5, 0),
  washAndIronRate = COALESCE(price * 0.8, 0),
  dryCleanRate = COALESCE(price * 1.2, 0)
WHERE ironRate = 0 AND washAndIronRate = 0 AND dryCleanRate = 0;

-- Update order_items to set the service column
UPDATE order_items SET service = 'iron' WHERE service IS NULL;

-- Make the new columns NOT NULL (after populating data)
ALTER TABLE products ALTER COLUMN ironRate SET NOT NULL;
ALTER TABLE products ALTER COLUMN washAndIronRate SET NOT NULL;
ALTER TABLE products ALTER COLUMN dryCleanRate SET NOT NULL;
ALTER TABLE order_items ALTER COLUMN service SET NOT NULL;
```

### Step 2: Update Sample Data

After running the above commands, update the sample products with proper service rates:

```sql
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
```

### Step 3: Restart the Application

After updating the database:
1. Restart the backend server
2. Refresh the frontend application
3. Clear browser cache if necessary

### Step 4: Verify the Fix

1. Add a product to the cart
2. Check that the correct service rate is applied
3. Verify that quantity changes update the subtotal correctly
4. Test discount functionality
5. Process a complete order and verify the totals

## Additional Notes

- The calculation logic in the frontend hooks has already been corrected
- The database schema files have been updated to reflect the new structure
- Make sure to backup your database before running these migration commands
- You can drop the old columns (price, sku, stock) later once you've verified everything is working correctly