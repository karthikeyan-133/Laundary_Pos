# Complete Database Migration Instructions

## Overview
This document provides instructions for running the complete database migration for the Tally POS system. The migration updates the database schema to support service-specific pricing (iron, wash and iron, dry clean).

## Prerequisites
1. Ensure your Supabase project is set up and accessible
2. Have your Supabase URL and service role key ready
3. Access to the Supabase SQL editor

## Migration Steps

### Step 1: Run the Migration Script
The migration script ([supabase-complete-migration.sql](file:///c%3A/Users/TECHZON-17/Desktop/Supabase/complete-migration.sql)) needs to be executed in the Supabase SQL editor:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor in the left sidebar
3. Copy the entire content of [supabase-complete-migration.sql](file:///c%3A/Users/TECHZON-17/Desktop/Supabase/complete-migration.sql)
4. Paste it into the SQL editor
5. Click "Run" to execute the migration

### Step 2: Verify the Migration
After running the migration, verify that the changes were applied correctly:

1. Check that the new columns (ironRate, washAndIronRate, dryCleanRate) exist in the products table
2. Verify that the service column exists in the order_items table with the proper constraint
3. Confirm that sample data has been updated with appropriate rates

### Step 3: Restart the Application
After the migration is complete:
1. Restart your backend server
2. Test the application to ensure everything works correctly

## Alternative Method: Using the Node.js Script
You can also run the migration using the provided Node.js script:

```bash
npm run complete-migration
```

Note: This script will output the SQL statements that need to be run manually in the Supabase SQL editor, as DDL operations often require direct execution in the dashboard.

## Troubleshooting
If you encounter any issues:

1. **Permission Errors**: Ensure you're using a service role key with sufficient privileges
2. **Column Already Exists**: The script uses "IF NOT EXISTS" clauses to prevent errors
3. **Constraint Violations**: Check that existing data conforms to the new constraints

## Rollback Plan
If you need to rollback the changes:
1. Remove the newly added columns from the products table
2. Remove the service column from the order_items table
3. Restore the price column if it was dropped (this would require a separate backup)

For any issues, please contact the development team.