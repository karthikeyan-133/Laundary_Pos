# Deployment Guide for Tally POS Application

This guide will help you deploy your Tally POS application to Vercel. The application consists of a frontend (React/Vite) and a backend (Node.js/Express) that connects to a Supabase database.

## Prerequisites

1. A Vercel account (free at [vercel.com](https://vercel.com))
2. A Supabase account (free at [supabase.com](https://supabase.com))
3. Node.js installed on your local machine
4. Git installed on your local machine

## Step 1: Prepare Your Supabase Database

1. Ensure your Supabase project is set up with all required tables:
   - products
   - customers
   - orders
   - order_items
   - settings

2. Make sure your `.env` file in the `backend` directory contains the correct Supabase credentials:
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_KEY=your_supabase_anon_key
   PORT=3001
   ```

## Step 2: Create a Git Repository

1. Initialize a git repository in your project directory:
   ```bash
   cd c:\Users\TECHZON-17\Desktop\Tally_Pos
   git init
   ```

2. Create a `.gitignore` file to exclude node_modules and other unnecessary files:
   ```bash
   # Create .gitignore file
   echo "node_modules/" > .gitignore
   echo ".env" >> .gitignore
   echo "dist/" >> .gitignore
   echo "*.log" >> .gitignore
   ```

3. Add all files and make an initial commit:
   ```bash
   git add .
   git commit -m "Initial commit"
   ```

4. Create a repository on GitHub/GitLab/Bitbucket and push your code:
   ```bash
   git remote add origin your_repository_url
   git branch -M main
   git push -u origin main
   ```

## Step 3: Deploy to Vercel Using Web Interface

1. Go to [vercel.com](https://vercel.com) and sign in or create an account
2. Click "New Project"
3. Import your Git repository
4. Configure the project:
   - Framework Preset: Other
   - Root Directory: Leave empty
   - Build and Output Settings:
     - Build Command: `cd modern-pos-spark && npm install && npm run build`
     - Output Directory: `modern-pos-spark/dist`
     - Install Command: `npm install`

5. Add environment variables in the "Environment Variables" section:
   - SUPABASE_URL: your_supabase_project_url
   - SUPABASE_KEY: your_supabase_anon_key

6. Click "Deploy"

## Step 4: Configure API Routes

Since we're deploying both frontend and backend together, we need to ensure the API routes work correctly:

1. In your frontend code, make sure API calls are made to `/api/` endpoints
2. The `vercel.json` file in your project root will route `/api/*` requests to your backend

## Step 5: Alternative Deployment Method Using Vercel CLI

1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```

2. Navigate to your project directory:
   ```bash
   cd c:\Users\TECHZON-17\Desktop\Tally_Pos
   ```

3. Deploy using the CLI:
   ```bash
   vercel
   ```

4. Follow the prompts:
   - Set up and deploy? Yes
   - Which scope? Select your account
   - Link to existing project? No (create a new project)
   - What's your project's name? tally-pos
   - In which directory is your code located? ./
   - Want to override the settings? No

5. Add environment variables when prompted:
   - SUPABASE_URL: your_supabase_project_url
   - SUPABASE_KEY: your_supabase_anon_key

## Step 6: Redeploy After Changes

After making changes to your code:

1. Commit and push your changes to Git:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```

2. Vercel will automatically deploy the new changes, or you can manually redeploy:
   ```bash
   vercel --prod
   ```

## Troubleshooting

### Environment Variables Not Loading
- Make sure all environment variables are added in the Vercel project settings
- Environment variables in Vercel are prefixed with `NEXT_PUBLIC_` for client-side access

### Database Connection Issues
- Verify your Supabase credentials are correct
- Ensure your Supabase database allows connections from Vercel's IP addresses
- Check that all required tables exist in your Supabase database

### API Routes Not Working
- Make sure your API calls in the frontend are using the correct endpoints
- Check the Vercel logs for any errors in your backend functions

### Build Failures
- Check that all dependencies are correctly listed in package.json
- Ensure the build command in Vercel settings is correct

## Useful Vercel Commands

```bash
# Deploy to a preview URL
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs your-project-url.vercel.app

# View environment variables
vercel env pull
```

## Post-Deployment Checklist

1. [ ] Verify the frontend loads correctly
2. [ ] Test product listing and management
3. [ ] Test customer creation and management
4. [ ] Test order creation and processing
5. [ ] Verify settings can be updated
6. [ ] Check that all database operations work correctly
7. [ ] Test all payment methods
8. [ ] Verify barcode scanning functionality

Your Tally POS application should now be successfully deployed to Vercel!