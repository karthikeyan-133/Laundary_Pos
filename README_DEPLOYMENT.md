# Tally POS Vercel Deployment with Supabase

This directory contains all the necessary files and configuration for deploying the Tally POS application to Vercel with Supabase as the database backend.

## Files Overview

1. **[VERCEL_DEPLOYMENT_GUIDE.md](file:///c%3A/Users/TECHZON-17/Desktop/Tally_Pos/VERCEL_DEPLOYMENT_GUIDE.md)** - Complete step-by-step guide for deployment
2. **[DEPLOYMENT_CHECKLIST.md](file:///c%3A/Users/TECHZON-17/Desktop/Tally_Pos/DEPLOYMENT_CHECKLIST.md)** - Checklist to ensure all steps are completed
3. **[vercel.json](file:///c%3A/Users/TECHZON-17/Desktop/Tally_Pos/vercel.json)** - Vercel configuration for both frontend and backend
4. **[backend/.env.example](file:///c%3A/Users/TECHZON-17/Desktop/Tally_Pos/backend/.env.example)** - Example environment variables for local development
5. **[backend/server.js](file:///c%3A/Users/TECHZON-17/Desktop/Tally_Pos/backend/server.js)** - Updated Express server for Vercel compatibility
6. **[backend/supabaseClient.js](file:///c%3A/Users/TECHZON-17/Desktop/Tally_Pos/backend/supabaseClient.js)** - Updated Supabase client configuration
7. **[test-supabase-connection.js](file:///c%3A/Users/TECHZON-17/Desktop/Tally_Pos/test-supabase-connection.js)** - Script to test Supabase connection

## Deployment Steps

1. **Set up Supabase:**
   - Create a Supabase project
   - Note your Project URL and Anon Key
   - Create database tables using SQL queries from the deployment guide

2. **Prepare your code:**
   - Ensure all files are committed to your Git repository
   - The project structure should include both frontend and backend directories

3. **Configure Vercel:**
   - Connect your Git repository to Vercel
   - Set environment variables in your Vercel project settings:
     - `SUPABASE_URL`: Your Supabase project URL
     - `SUPABASE_KEY`: Your Supabase anon key
     - `PORT`: 3001

4. **Deploy:**
   - Trigger a deployment through Vercel dashboard or Git push
   - Monitor the build logs for any issues

## Testing Your Deployment

1. **Test the frontend:**
   - Visit your Vercel deployment URL
   - Ensure the application loads correctly

2. **Test the backend:**
   - Visit `/api/products` to check if the API is working
   - Visit `/health` to check the health status

3. **Test database operations:**
   - Try creating a product or customer through the UI
   - Verify data appears in your Supabase tables

## Troubleshooting

If you encounter issues:

1. **Check Vercel logs** for build or runtime errors
2. **Verify environment variables** are correctly set in Vercel dashboard
3. **Test Supabase connection** using the test script:
   ```bash
   node test-supabase-connection.js
   ```
4. **Check CORS configuration** in [backend/server.js](file:///c%3A/Users/TECHZON-17/Desktop/Tally_Pos/backend/server.js) if you encounter CORS errors

## Support

For additional help with deployment:
- Refer to [VERCEL_DEPLOYMENT_GUIDE.md](file:///c%3A/Users/TECHZON-17/Desktop/Tally_Pos/VERCEL_DEPLOYMENT_GUIDE.md) for detailed instructions
- Check the [DEPLOYMENT_CHECKLIST.md](file:///c%3A/Users/TECHZON-17/Desktop/Tally_Pos/DEPLOYMENT_CHECKLIST.md) to ensure all steps are completed
- Review Vercel and Supabase documentation for platform-specific issues