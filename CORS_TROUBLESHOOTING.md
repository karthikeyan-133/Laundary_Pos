# CORS Troubleshooting Guide

This guide will help you resolve the persistent CORS errors in your Vercel deployment.

## Current Issue Analysis

The error messages show:
```
Access to fetch at 'https://laundary-pos-zb3p.vercel.app/api/returns' from origin 'https://laundary-pos.vercel.app' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

This indicates that:
1. Your frontend is running at `https://laundary-pos.vercel.app`
2. Your frontend is trying to access the API at `https://laundary-pos-zb3p.vercel.app`
3. The API server is not including the required CORS headers in its response

## Root Cause

The issue is that your frontend is configured to use a different domain for API calls instead of using the same origin. This is happening because:

1. The `VITE_API_URL` environment variable might be set to the wrong value in your Vercel deployment
2. The frontend build might be using cached values
3. The Vercel deployment might not have picked up the latest changes

## Solutions

### Solution 1: Verify Vercel Environment Variables

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Find your project
3. Go to Settings → Environment Variables
4. Check if `VITE_API_URL` is set
5. If it's set to `https://laundary-pos-zb3p.vercel.app`, remove it or set it to empty
6. If it's not set, that's correct - it should remain unset to use the same origin

### Solution 2: Force Redeployment

1. Go to your Vercel dashboard
2. Find your project
3. Go to the Deployments tab
4. Click on the latest deployment
5. Click "Redeploy" → "Redeploy with existing Build Cache"
6. Wait for deployment to complete

### Solution 3: Clear Build Cache and Redeploy

1. Install Vercel CLI if you haven't already:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Link your project:
   ```bash
   vercel link
   ```

4. Redeploy without cache:
   ```bash
   vercel --prod --force
   ```

### Solution 4: Manual Verification

Add this verification code to your frontend to check what API URL is being used:

1. Add this to any component or page:
   ```javascript
   useEffect(() => {
     console.log('API Base URL:', import.meta.env.VITE_API_URL);
     console.log('Window location:', window.location.origin);
   }, []);
   ```

2. Check the browser console after deployment to see what values are being used

### Solution 5: Backend Verification

Add this logging to your backend server to verify it's handling CORS correctly:

1. In `backend-new/server.js`, add this logging:
   ```javascript
   app.use((req, res, next) => {
     const origin = req.get('Origin');
     console.log('=== CORS DEBUG ===');
     console.log('Request origin:', origin);
     console.log('Request method:', req.method);
     console.log('Request path:', req.path);
     // ... rest of CORS middleware
   });
   ```

## Testing Your Fix

After implementing the solutions:

1. Visit your deployed application
2. Open browser Developer Tools (F12)
3. Go to the Network tab
4. Refresh the page
5. Look for API requests (they should go to the same domain, not a different one)
6. Check the response headers for `Access-Control-Allow-Origin`

## Expected Behavior After Fix

1. API requests should go to `https://laundary-pos.vercel.app/api/...` (same domain)
2. No CORS errors in the console
3. All data should load correctly

## If Issues Persist

1. Check Vercel deployment logs for any errors
2. Verify that your frontend and backend are in the same Vercel project
3. Ensure your `vercel.json` file is correctly configured
4. Check that environment variables are correctly set in Vercel dashboard

## Contact for Further Assistance

If you continue to experience issues after trying these solutions, please provide:
1. Your Vercel project URL
2. Screenshots of the browser console errors
3. Screenshots of the Network tab showing the failed requests
4. Your Vercel environment variable settings (without sensitive data)

This will help in providing more specific guidance for your situation.