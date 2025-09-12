# Security Notice

## Important: Rotate Your Supabase Key

The Supabase key in the [.env](file:///C:/Users/TECHZON-17/Desktop/Tally_Pos/backend/.env) file has been exposed and should be rotated immediately.

### Steps to Fix:

1. **Generate a New Supabase Key**:
   - Go to your Supabase dashboard
   - Navigate to Project Settings > API
   - Under "Project API keys", generate a new `anon` key
   - Revoke the old key if possible

2. **Update Vercel Environment Variables**:
   - In your Vercel project settings, go to "Environment Variables"
   - Add/update the following variables:
     - `SUPABASE_URL`: Your Supabase project URL
     - `SUPABASE_KEY`: Your new Supabase anon key
   - Redeploy your application

3. **Remove [.env](file:///C:/Users/TECHZON-17/Desktop/Tally_Pos/backend/.env) from Git Tracking**:
   ```bash
   git rm --cached backend/.env
   git commit -m "Remove sensitive .env file from repository"
   git push origin main
   ```

4. **For Local Development**:
   - Create a new `backend/.env` file locally with your new credentials
   - This file is already in [.gitignore](file:///C:/Users/TECHZON-17/Desktop/Tally_Pos/modern-pos-spark/.gitignore) so it won't be committed

### Why This Matters:

Exposing API keys can lead to:
- Unauthorized access to your database
- Potential data breaches
- Unexpected charges from cloud providers
- Compromised application security

### Best Practices:

- Always use environment variables for sensitive credentials
- Never commit sensitive files to version control
- Regularly rotate API keys
- Use Vercel's environment variable management for deployment