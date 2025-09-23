# Vercel Deployment Steps for Tally POS System

## Prerequisites
1. Vercel account
2. GitHub/GitLab/Bitbucket account with the repository
3. MySQL database credentials

## Step 1: Deploy Backend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your repository
4. Set the root directory to `backend-new`
5. Leave build command empty (Vercel will use vercel.json)
6. Add environment variables in Vercel dashboard:
   ```
   DB_HOST=techzontech.com
   DB_USER=techzontech_Pos_user
   DB_PASSWORD=Welc0me$27
   DB_NAME=techzontech_Lanundry_Pos
   DB_PORT=3306
   DB_SSL=false
   JWT_SECRET=fNmAJCCtWGGz7uLrFeYhOKtEuwybrSZKQFq4QB1Zi0k=
   ```
7. Deploy and note the backend URL

## Step 2: Update Frontend Configuration

1. Edit `frontend/.env` file:
   ```
   VITE_API_URL=https://your-deployed-backend-url.vercel.app
   ```
2. Commit and push changes

## Step 3: Deploy Frontend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your repository
4. Set the root directory to `frontend`
5. Set build command to `npm run build`
6. Set output directory to `dist`
7. Deploy

## Troubleshooting

If you see errors:
1. Check that VITE_API_URL in frontend/.env points to your deployed backend
2. Ensure backend environment variables are correctly set in Vercel dashboard
3. Check Vercel logs for detailed error messages