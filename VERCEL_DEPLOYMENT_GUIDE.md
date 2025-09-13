# Vercel Deployment Guide for Tally POS

This guide will help you properly deploy the Tally POS application to Vercel with all required environment variables.

## Prerequisites

1. A Vercel account
2. A Supabase account with a project created
3. Your Supabase project URL and anon key

## Setting Up Environment Variables in Vercel

### Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Click on the "Settings" icon in the sidebar
3. Click on "API" in the settings menu
4. Copy the following values:
   - Project URL (SUPABASE_URL)
   - anon key (SUPABASE_KEY)

### Step 2: Add Environment Variables to Vercel

1. Go to your Vercel dashboard
2. Select your project (billing-pos-yjh9)
3. Go to the "Settings" tab
4. Click on "Environment Variables" in the left sidebar
5. Add the following environment variables:

| Variable Name | Value | Description |
|---------------|-------|-------------|
| SUPABASE_URL | Your Supabase project URL | The URL of your Supabase project |
| SUPABASE_KEY | Your Supabase anon key | The public API key for your Supabase project |

To add each variable:
1. Click "Add"
2. Enter the Variable Name
3. Enter the Value (paste your Supabase credentials)
4. Leave "Environment" as "All" or select specific environments
5. Click "Add"

### Step 3: Redeploy Your Application

After adding the environment variables:

1. Go to the "Deployments" tab in your Vercel project
2. Find the latest deployment
3. Click the three dots menu next to it
4. Select "Redeploy"
5. Check "Use existing Build Cache"
6. Click "Redeploy"

This will redeploy your application with the new environment variables.

## Verifying the Deployment

After redeployment:

1. Visit your application URL: https://billing-pos-yjh9.vercel.app
2. Try to create a new order
3. Check the browser console for any errors
4. If you still see issues, check the Vercel function logs

## Checking Vercel Function Logs

1. Go to your Vercel dashboard
2. Select your project
3. Go to the "Functions" tab
4. Look for any functions with errors
5. Click on a function to see its logs

## Troubleshooting

### Issue: "Failed to create order" error

This usually indicates a database connection issue:

1. Double-check that SUPABASE_URL and SUPABASE_KEY are correctly set
2. Ensure your Supabase project is not paused or deleted
3. Verify that your Supabase credentials are correct

### Issue: Database tables don't exist

If you're getting errors about missing tables:

1. Go to your Supabase dashboard
2. Click on "Table Editor" in the sidebar
3. Run the SQL commands from `backend-new/init-supabase-db.js` to create the required tables

### Issue: Foreign key constraint errors

This usually happens when trying to create an order with a customer_id or product_id that doesn't exist:

1. Make sure you have at least one customer and one product in your database
2. Verify that the IDs you're using in your requests exist in the database

## Need Help?

If you continue to experience issues:

1. Check the browser console for detailed error messages
2. Check the Vercel function logs
3. Verify all environment variables are correctly set
4. Ensure your Supabase project is active and accessible
