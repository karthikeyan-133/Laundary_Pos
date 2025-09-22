# Deployment Checklist

Follow this checklist to ensure your Tally POS application is properly deployed to Vercel without CORS issues.

## Pre-deployment Checks

### Frontend Configuration
- [ ] `.env.production` file exists in `frontend/` directory
- [ ] `VITE_API_URL` in `.env.production` is empty (not set to a specific URL)
- [ ] `api.ts` file uses `window.location.origin` for Vercel deployments
- [ ] Frontend builds successfully with `npm run build`

### Backend Configuration
- [ ] `server.js` has proper CORS middleware that allows vercel.app origins
- [ ] Backend builds without errors
- [ ] Database credentials are correct in `backend-new/.env`

### Vercel Configuration
- [ ] `vercel.json` file exists in root directory
- [ ] `vercel.json` has correct build configurations for both frontend and backend
- [ ] `vercel.json` includes proper routing for API endpoints
- [ ] `vercel.json` includes CORS headers for API routes

## Deployment Steps

### 1. Commit Changes
- [ ] Add all changes: `git add .`
- [ ] Commit changes: `git commit -m "Fix CORS configuration for Vercel deployment"`
- [ ] Push to repository: `git push origin main`

### 2. Vercel Deployment
- [ ] Go to Vercel dashboard
- [ ] Trigger deployment manually or wait for automatic deployment
- [ ] Monitor deployment logs for any errors

### 3. Post-deployment Verification
- [ ] Visit deployed application URL
- [ ] Check browser console for any CORS errors
- [ ] Test API endpoints:
  - [ ] `/api/health`
  - [ ] `/api/test-server`
  - [ ] `/api/products` (requires authentication)
- [ ] Test authentication flow
- [ ] Test CRUD operations

## Common Issues and Solutions

### CORS Errors
If you still see CORS errors after deployment:

1. Verify that `VITE_API_URL` is empty in `.env.production`
2. Check that the frontend and backend are deployed in the same Vercel project
3. Ensure the backend CORS middleware allows the frontend origin
4. Redeploy the application to ensure changes are applied

### Database Connection Issues
If the application can't connect to the database:

1. Verify database credentials in `backend-new/.env`
2. Ensure Remote MySQL is enabled in cPanel
3. Check that your IP is whitelisted in cPanel's Remote MySQL settings
4. Test database connection locally with `npm run test-db`

### API Endpoint Issues
If API endpoints return 404 errors:

1. Check `vercel.json` routing configuration
2. Verify that API routes are correctly mapped to the backend server
3. Ensure the backend server is properly exported for Vercel

## Environment Variables

### Required Frontend Variables
```env
# For Vercel deployments, leave empty to use same origin
VITE_API_URL=
```

### Required Backend Variables
```env
# Database Configuration for cPanel
DB_HOST=your-host.com
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=your-database-name
DB_PORT=3306
DB_SSL=false

# JWT Secret
JWT_SECRET=your-jwt-secret
```

## Testing Commands

### Local Testing
```bash
# Test CORS configuration locally
cd backend-new
npm run test-cors

# Test database connection
cd backend-new
npm run test-db
```

### Build Commands
```bash
# Build frontend
cd frontend
npm run build

# Build backend (Vercel does this automatically)
cd backend-new
npm start
```

## Verification URLs

After deployment, test these URLs:

1. **Main Application**: `https://your-app.vercel.app`
2. **Health Check**: `https://your-app.vercel.app/api/health`
3. **CORS Check**: `https://your-app.vercel.app/api/cors-check`
4. **Server Test**: `https://your-app.vercel.app/api/test-server`

If all items in this checklist are completed and verified, your application should be deployed successfully without CORS issues.