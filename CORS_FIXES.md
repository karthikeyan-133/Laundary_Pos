# CORS Fixes for Vercel Deployment

## Issues Identified

1. **Multiple conflicting CORS handlers**: There were several separate CORS handler files in the `backend-new/api/` directory that were conflicting with the main server CORS configuration
2. **Improper Vercel routing**: Some API routes were being handled by separate files instead of the main server.js
3. **Missing Access-Control-Allow-Origin header**: The error message indicated that the header was not being set properly
4. **Serverless function CORS handling**: Vercel serverless functions need explicit CORS header configuration

## Fixes Applied

### 1. Removed Conflicting CORS Handlers

Deleted the following files that were causing conflicts:
- `backend-new/api/cors.js`
- `backend-new/api/cors-fix.js`
- `backend-new/api/health.js`
- `backend-new/api/test-cors.js`

These files were setting their own CORS headers which conflicted with the main server's CORS configuration.

### 2. Created Vercel-Specific Serverless Functions with Proper CORS Handling

Created individual serverless functions for each API endpoint with explicit CORS header configuration:
- `backend-new/api/test.js` - Test endpoint
- `backend-new/api/products.js` - Products API
- `backend-new/api/customers.js` - Customers API
- `backend-new/api/orders.js` - Orders API
- `backend-new/api/settings.js` - Settings API
- `backend-new/api/returns.js` - Returns API

Each function explicitly sets the required CORS headers:
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
```

### 3. Updated Vercel Configuration (`vercel.json`)

- Added explicit routes for each API endpoint to be handled by the corresponding serverless function
- Ensured all API requests are handled by functions that properly set CORS headers
- Maintained fallback routing to the main server.js for any unmatched routes

### 4. Backend CORS Configuration (`backend-new/server.js`)

- Updated allowed origins to include the correct frontend domains:
  - `https://pos-laundry-ajish.vercel.app` (previous domain)
  - `https://pos-laundry-eight.vercel.app` (current domain)
  - `https://pos-laundry-tau.vercel.app` (production domain)
- Kept the main CORS middleware configuration using the `cors` package
- Added a simple middleware to ensure CORS headers are always set
- Ensured all API endpoints properly respond with CORS headers

## Testing the Fix

1. Deploy both frontend and backend to Vercel
2. Visit your frontend URL: `https://pos-laundry-eight.vercel.app`
3. The API requests should now work without CORS errors

## Additional Notes

- The CORS test page at `/cors-test.html` can be used to verify the fix
- Make sure both frontend and backend are deployed to the correct Vercel projects
- Check that the environment variables are properly set in Vercel

## Common Issues and Solutions

1. **If you still see CORS errors**:
   - Verify that `https://pos-laundry-eight.vercel.app` is in the allowed origins list in `server.js`
   - Check the browser console for specific error messages
   - Ensure both frontend and backend are deployed and accessible

2. **If API requests still fail**:
   - Check that the backend is running and accessible at `https://pos-laundry-backend.vercel.app`
   - Verify database connections are working
   - Check Vercel logs for any deployment errors