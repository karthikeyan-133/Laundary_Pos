# CORS Fix Deployment Guide

## Issue Summary
The frontend at `https://pos-laundry-tau.vercel.app` was unable to access the backend API at `https://pos-laundry-backend.vercel.app` due to CORS policy violations.

## Changes Made

### 1. Backend CORS Configuration ([backend-new/server.js](file:///C:/Users/TECHZON-17/Desktop/Tally_Pos/backend-new/server.js))
- Added explicit CORS headers middleware for Vercel deployment
- Ensured CORS headers are set for all responses
- Added specific handling for preflight OPTIONS requests

### 2. Vercel Routing Configuration ([vercel.json](file:///C:/Users/TECHZON-17/Desktop/Tally_Pos/vercel.json))
- Added specific route for `/api/test-cors` endpoint
- Ensured all API routes are properly routed to the backend server

### 3. Frontend API Configuration ([frontend/src/services/api.ts](file:///C:/Users/TECHZON-17/Desktop/Tally_Pos/frontend/src/services/api.ts))
- Updated API base URL detection to properly handle Vercel deployments
- Ensured frontend uses the correct backend URL for API requests

## Deployment Steps

### 1. Deploy Backend Changes
1. Commit all changes to the backend repository
2. Push to the branch connected to Vercel deployment
3. Verify deployment succeeds in Vercel dashboard
4. Test backend CORS endpoints:
   - `https://pos-laundry-backend.vercel.app/api/test`
   - `https://pos-laundry-backend.vercel.app/api/test-cors`
   - `https://pos-laundry-backend.vercel.app/api/cors-check`

### 2. Deploy Frontend Changes
1. Commit all changes to the frontend repository
2. Push to the branch connected to Vercel deployment
3. Verify deployment succeeds in Vercel dashboard
4. Test frontend functionality:
   - Product listing should load without CORS errors
   - All API calls should work properly

## Testing the Fix

### Manual Testing
1. Visit `https://pos-laundry-tau.vercel.app`
2. Open browser developer tools
3. Check the console for any CORS errors
4. Verify that product data loads correctly
5. Test all CRUD operations for products, customers, and orders

### Automated Testing
1. Run the CORS test page: `https://pos-laundry-tau.vercel.app/cors-test.html`
2. Click the "Test CORS" button
3. Verify successful response without errors

## Troubleshooting

### If Issues Persist
1. Check Vercel deployment logs for both frontend and backend
2. Verify environment variables are correctly set in Vercel dashboard
3. Ensure the backend URL in frontend configuration matches the actual deployment URL
4. Check browser network tab for detailed error information

### Common Issues
1. **Mixed content errors**: Ensure all requests use HTTPS in production
2. **Preflight request failures**: Verify OPTIONS requests are handled correctly
3. **Origin not allowed**: Check that all expected origins are in the allowed list

## Verification Checklist
- [ ] Backend deploys successfully to Vercel
- [ ] Frontend deploys successfully to Vercel
- [ ] CORS test endpoints return 200 OK
- [ ] Product listing loads without errors
- [ ] All API endpoints accessible from frontend
- [ ] No CORS errors in browser console
- [ ] All CRUD operations work correctly