# Vercel Deployment Checklist for Tally POS with Supabase

## Prerequisites
- [ ] Vercel account
- [ ] Supabase account
- [ ] Git repository (GitHub, GitLab, or Bitbucket)

## Supabase Setup
- [ ] Create a new Supabase project
- [ ] Note the Project URL and Anon Key
- [ ] Create database tables using the SQL queries provided in VERCEL_DEPLOYMENT_GUIDE.md
- [ ] Insert default settings data

## Environment Variables
Set the following environment variables in your Vercel project settings:

| Variable Name | Value | Description |
|---------------|-------|-------------|
| SUPABASE_URL | `https://your-project.supabase.co` | Your Supabase project URL |
| SUPABASE_KEY | `your-anon-key` | Your Supabase anon key |
| PORT | `3001` | Port for the backend server |

## Code Preparation
- [ ] Ensure all files are committed to your Git repository
- [ ] Verify the following files are in your repository:
  - [ ] [backend/.env.example](file:///c%3A/Users/TECHZON-17/Desktop/Tally_Pos/backend/.env.example) (for reference only)
  - [ ] [backend/server.js](file:///c%3A/Users/TECHZON-17/Desktop/Tally_Pos/backend/server.js)
  - [ ] [backend/supabaseClient.js](file:///c%3A/Users/TECHZON-17/Desktop/Tally_Pos/backend/supabaseClient.js)
  - [ ] [vercel.json](file:///c%3A/Users/TECHZON-17/Desktop/Tally_Pos/vercel.json)
  - [ ] [modern-pos-spark/](file:///c%3A/Users/TECHZON-17/Desktop/Tally_Pos/modern-pos-spark) directory with frontend code

## Deployment Process
1. [ ] Connect your Git repository to Vercel
2. [ ] Configure the project with the following settings:
   - Build Command: `cd modern-pos-spark && npm run build`
   - Output Directory: `modern-pos-spark/dist`
   - Install Command: `npm install`
3. [ ] Add environment variables in Vercel dashboard
4. [ ] Deploy the project
5. [ ] Test the deployment:
   - [ ] Frontend loads correctly
   - [ ] API endpoints work (`/api/products`, `/api/customers`, etc.)
   - [ ] Database operations function properly

## Post-Deployment
- [ ] Test all functionality (products, customers, orders, settings)
- [ ] Verify data is being stored in Supabase
- [ ] Check Vercel logs for any errors
- [ ] Update CORS settings if needed for production domain

## Troubleshooting
- [ ] If environment variables are not loading, verify they are set in Vercel dashboard
- [ ] If database connection fails, verify Supabase URL and key are correct
- [ ] If API routes don't work, check the vercel.json configuration
- [ ] For frontend issues, check browser console for errors