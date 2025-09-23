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

### "Failed to load module script" Error

This error occurs when the server returns an HTML page instead of JavaScript files. To fix this:

1. Ensure `frontend/vercel.json` has proper routing configuration:
   ```json
   {
     "routes": [
       {
         "src": "/assets/(.*)",
         "headers": {
           "cache-control": "public,max-age=31536000,immutable"
         },
         "dest": "/assets/$1"
       },
       {
         "src": "/(.*)",
         "dest": "/index.html"
       }
     ]
   }
   ```

2. Make sure `vite.config.ts` has `base: '/'` configured

3. Redeploy the frontend after making these changes

### Other Common Issues

1. **CORS Errors**: Ensure backend has proper CORS configuration for your frontend domain
2. **API Connection Issues**: Verify VITE_API_URL in frontend/.env points to correct backend URL
3. **Environment Variables**: Check that all required environment variables are set in Vercel dashboard
4. **Build Failures**: Check Vercel logs for detailed error messages

## Post-Deployment

1. Visit your frontend URL
2. Log in with default credentials (admin/admin123)
3. Change the default password immediately
4. Configure business settings
5. Add products and customers