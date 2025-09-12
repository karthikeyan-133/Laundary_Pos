# Backend Deployment Checklist

## Pre-deployment Requirements

- [ ] Supabase project created and configured
- [ ] All required database tables created in Supabase
- [ ] Default settings inserted into the settings table
- [ ] Environment variables prepared (SUPABASE_URL, SUPABASE_KEY)
- [ ] Git repository initialized and code committed

## Environment Variables

Ensure the following environment variables are set in your deployment platform:

- [ ] `SUPABASE_URL` - Your Supabase project URL
- [ ] `SUPABASE_KEY` - Your Supabase anon key
- [ ] `PORT` - Server port (optional, defaults to 3001)
- [ ] `NODE_ENV` - Set to "production" for production deployments

## Deployment Steps

### Option 1: Deploy with Root Project (Recommended)

1. Deploy the entire project from the root directory
2. The vercel.json in the root will handle both frontend and backend deployment
3. Environment variables will be shared between frontend and backend

### Option 2: Deploy Backend Separately

1. Navigate to the backend directory
2. Run `vercel` to deploy
3. Configure environment variables in the Vercel dashboard

## Post-deployment Verification

- [ ] Test API endpoints at `/api/products`, `/api/customers`, `/api/orders`, `/api/settings`
- [ ] Verify database connections are working
- [ ] Test CRUD operations for all entities
- [ ] Check CORS configuration allows requests from frontend
- [ ] Verify error handling and logging

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loaded**
   - Ensure all required environment variables are set in the deployment platform
   - Check that the .env file is not committed to the repository

2. **Database Connection Errors**
   - Verify Supabase credentials are correct
   - Check that the Supabase project is not paused
   - Ensure the database tables exist

3. **CORS Errors**
   - Check that the CORS configuration in server.js allows requests from your frontend domain
   - For Vercel deployments, ensure the origin includes ".vercel.app"

4. **API Route Issues**
   - Verify that API routes are correctly prefixed with "/api/"
   - Check the vercel.json configuration for route handling

### Testing Endpoints

1. GET `/api/` - Should return a welcome message
2. GET `/api/products` - Should return a list of products
3. GET `/api/customers` - Should return a list of customers
4. GET `/api/settings` - Should return application settings
5. POST `/api/test` - Should return a test response (only available in Vercel deployments)

## Rollback Plan

If issues are discovered after deployment:

1. Revert to the previous deployment using the Vercel dashboard
2. Fix the issues locally and test thoroughly
3. Redeploy the fixed version

## Monitoring

- [ ] Set up logging for error tracking
- [ ] Monitor API response times
- [ ] Set up alerts for critical errors
- [ ] Monitor database connection pool usage