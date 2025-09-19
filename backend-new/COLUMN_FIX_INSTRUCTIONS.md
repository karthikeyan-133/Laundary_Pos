# Column Name Fix Instructions

This document explains how to fix the column name issues that were causing errors when adding new products.

## Problem
When adding new products, you were getting errors because:
1. The database had columns with lowercase names (`ironrate`, `washandironrate`, `drycleanrate`)
2. The frontend and backend code expected camelCase names (`ironRate`, `washAndIronRate`, `dryCleanRate`)

## Solution
The updated [fix-column-names.sql](file:///c:/Users/TECHZON-17/Desktop/Tally_Pos/backend-new/fix-column-names.sql) script now safely handles these cases:

1. Checks if the old lowercase columns exist before trying to rename them
2. Creates the new camelCase columns if they don't exist
3. Ensures the columns have the correct data types and constraints

## How to Apply the Fix

1. Run the updated [fix-column-names.sql](file:///c:/Users/TECHZON-17/Desktop/Tally_Pos/backend-new/fix-column-names.sql) script in your Supabase SQL editor:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of [fix-column-names.sql](file:///c:/Users/TECHZON-17/Desktop/Tally_Pos/backend-new/fix-column-names.sql)
   - Run the script

2. Restart your backend server:
   ```
   cd backend-new
   npm run dev
   ```

3. Test adding a new product through the frontend UI

## Additional Improvements

The following files have been updated to handle column name issues more robustly:

1. `server.js` - Backend API endpoints now handle both naming conventions
2. `ProductManagement.tsx` - Frontend product management now has better error handling
3. `api.ts` - API service has improved error handling
4. `usePOSStore.ts` - Store hook has robust data type conversion

These changes ensure that even if there are temporary database inconsistencies, the application will continue to work correctly.

## Verification

After applying the fix:
1. You should be able to add new products without errors
2. Existing products should continue to display correctly
3. All service rates (Iron, Wash & Iron, Dry Clean) should show the correct values