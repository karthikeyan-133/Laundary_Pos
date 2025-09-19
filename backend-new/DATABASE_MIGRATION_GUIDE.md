# Database Migration Guide

## Overview

This guide explains how to properly migrate your Tally POS database from the old structure (with generic [price](file://c:\Users\TECHZON-17\Desktop\Tally_Pos\frontend\src\components\ReturnByBills.tsx#L17-L17) field) to the new structure (with service-specific rate fields: [ironRate](file://c:\Users\TECHZON-17\Desktop\Tally_Pos\frontend\src\components\CalculationDebug.tsx#L25-L25), [washAndIronRate](file://c:\Users\TECHZON-17\Desktop\Tally_Pos\frontend\src\components\CalculationDebug.tsx#L26-L26), [dryCleanRate](file://c:\Users\TECHZON-17\Desktop\Tally_Pos\frontend\src\components\CalculationDebug.tsx#L27-L27)).

## Identifying Database Issues

Before migrating, you should check if your database has the correct structure:

1. Run the database structure test:
   ```bash
   npm run test-db-structure
   ```

2. Look for these indicators:
   - ❌ Products table still has `price` column instead of service-specific rates
   - ❌ Order items table missing `service` column
   - ❌ Products missing [ironRate](file://c:\Users\TECHZON-17\Desktop\Tally_Pos\frontend\src\components\CalculationDebug.tsx#L25-L25), [washAndIronRate](file://c:\Users\TECHZON-17\Desktop\Tally_Pos\frontend\src\components\CalculationDebug.tsx#L26-L26), [dryCleanRate](file://c:\Users\TECHZON-17\Desktop\Tally_Pos\frontend\src\components\CalculationDebug.tsx#L27-L27) columns
   - ❌ Order items missing service information

## Migration Steps

### Step 1: Backup Your Database
Before making any changes, ensure you have a backup of your current database.

### Step 2: Run Automatic Migration Check
Run the automatic migration checker:
```bash
npm run auto-migrate
```

This will tell you if your database needs migration and provide the SQL commands needed.

### Step 3: Manual SQL Migration
If the automatic check indicates migration is needed:

1. Open your Supabase dashboard
2. Go to the SQL editor
3. Copy and paste the provided SQL commands
4. Run the commands

### Step 4: Verify Migration
After running the migration:

1. Run the structure test again:
   ```bash
   npm run test-db-structure
   ```

2. You should see:
   - ✅ Products table has correct structure (new format with service-specific rates)
   - ✅ Order items table has correct structure (has service field)
   - ✅ Old price column has been successfully removed

## Migration Script Details

The migration script handles both scenarios:

1. **Fresh Installation**: Creates all necessary columns with proper defaults
2. **Upgrade from Old Version**: Migrates existing data from the old [price](file://c:\Users\TECHZON-17\Desktop\Tally_Pos\frontend\src\components\ReturnByBills.tsx#L17-L17) field to new service-specific rates and removes the old column

### Data Migration Logic

When upgrading from the old structure:
- Old [price](file://c:\Users\TECHZON-17\Desktop\Tally_Pos\frontend\src\components\ReturnByBills.tsx#L17-L17) values are converted to service-specific rates using these ratios:
  - [ironRate](file://c:\Users\TECHZON-17\Desktop\Tally_Pos\frontend\src\components\CalculationDebug.tsx#L25-L25) = [price](file://c:\Users\TECHZON-17\Desktop\Tally_Pos\frontend\src\components\ReturnByBills.tsx#L17-L17) * 0.5
  - [washAndIronRate](file://c:\Users\TECHZON-17\Desktop\Tally_Pos\frontend\src\components\CalculationDebug.tsx#L26-L26) = [price](file://c:\Users\TECHZON-17\Desktop\Tally_Pos\frontend\src\components\ReturnByBills.tsx#L17-L17) * 0.8
  - [dryCleanRate](file://c:\Users\TECHZON-17\Desktop\Tally_Pos\frontend\src\components\CalculationDebug.tsx#L27-L27) = [price](file://c:\Users\TECHZON-17\Desktop\Tally_Pos\frontend\src\components\ReturnByBills.tsx#L17-L17) * 1.2

These ratios can be adjusted based on your business pricing model.

The old [price](file://c:\Users\TECHZON-17\Desktop\Tally_Pos\frontend\src\components\ReturnByBills.tsx#L17-L17) column is then removed to clean up the database structure.

## Troubleshooting

### Issue: Database Structure Test Still Shows Old Structure
1. Ensure you've run the SQL migration commands in Supabase
2. Refresh your database connection
3. Restart your backend server

### Issue: Products Show Zero Rates After Migration
1. Check if the migration script ran successfully
2. Verify the conversion ratios in the migration script
3. Manually update product rates if needed through the product management interface

### Issue: Service Column Missing in Order Items
1. Run the migration script again
2. Ensure the `service` column constraint is properly added
3. Check that all existing order items have a default service value

## Post-Migration Verification

After migration, verify that:

1. All products display the three service-specific rates
2. New orders correctly save the selected service
3. Reports show accurate pricing based on selected services
4. Receipts display the correct service rates
5. Return processing works with service-specific pricing
6. The old [price](file://c:\Users\TECHZON-17\Desktop\Tally_Pos\frontend\src\components\ReturnByBills.tsx#L17-L17) column has been removed

## Important Notes

1. **Data Safety**: The migration preserves data by converting the old [price](file://c:\Users\TECHZON-17\Desktop\Tally_Pos\frontend\src\components\ReturnByBills.tsx#L17-L17) values to the new service-specific rates before removing the column
2. **Service Defaults**: All existing order items are assigned 'iron' as the default service
3. **Sample Data**: Sample products are updated with appropriate service rates for a laundry business
4. **Clean Structure**: The old [price](file://c:\Users\TECHZON-17\Desktop\Tally_Pos\frontend\src\components\ReturnByBills.tsx#L17-L17) column is completely removed to maintain a clean database structure

By following this guide, you should be able to successfully migrate your database to the new service-specific pricing model and resolve the sales data visibility issues in the reports section.