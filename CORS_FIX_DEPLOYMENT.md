# CORS Fix Deployment Guide

This document outlines the steps to deploy the CORS fixes for the Tally POS system.

## Summary of Changes

We've implemented several fixes to resolve the CORS issues:

1. **Updated CORS Configuration** in `server.js`:
   - Added explicit handling for OPTIONS preflight requests
   - Added specific CORS headers to all API responses
   - Ensured credentials support for cross-origin requests

2. **Enhanced API Endpoints**:
   - Added CORS headers to all API endpoints (settings, products, customers, orders, returns)
   - Ensured consistent header setting across all responses

3. **Returns API Update**:
   - Added CORS headers to all returns API endpoints

## Deployment Steps

### 1. Backend Deployment (Vercel)

1. Commit the changes to your repository:
   ```bash
   git add .
   git commit -m "Fix CORS issues for cross-origin requests"
   git push origin main
   ```

2. Deploy to Vercel:
   - The changes will automatically deploy through Vercel's CI/CD pipeline
   - Monitor the deployment logs for any issues

3. Verify deployment:
   - Visit your backend URL: `https://pos-laundry-backend.vercel.app`
   - Test the `/api/test` endpoint to confirm CORS is working

### 2. Frontend Deployment (Vercel)

1. No changes are needed in the frontend code
2. If you want to force a redeploy, you can make a minor change or redeploy from Vercel dashboard

### 3. Testing the Fix

1. **Automated Testing**:
   - Run the CORS test script: `npm run test-cors` in the backend directory
   - This will start a local server with the same CORS configuration

2. **Manual Testing**:
   - Open the `cors-test-frontend.html` file in a browser
   - Test each API endpoint to ensure CORS headers are properly set
   - Check browser developer tools for any CORS errors

3. **Production Testing**:
   - Visit your frontend URL: `https://pos-laundry-tau.vercel.app`
   - Open browser developer tools and check the Network tab
   - Verify that API requests to the backend are successful
   - Confirm that no CORS errors appear in the console

## Troubleshooting

### If Issues Persist

1. **Check Vercel Logs**:
   - Visit the Vercel dashboard
   - Check deployment logs for any errors
   - Review runtime logs for the backend application

2. **Verify Environment Variables**:
   - Ensure all required environment variables are set in Vercel
   - Check that database connection details are correct

3. **Test Locally**:
   - Run the backend locally: `npm run dev`
   - Test API endpoints with tools like Postman or curl
   - Verify CORS headers are present in responses

### Common Issues and Solutions

1. **"No 'Access-Control-Allow-Origin' header"**:
   - Double-check that all API endpoints have CORS headers
   - Ensure the OPTIONS preflight handler is correctly configured

2. **"Credentials not supported"**:
   - Verify that `Access-Control-Allow-Credentials` is set to `true`
   - Ensure the frontend is sending credentials if required

3. **Origin Not Allowed**:
   - Check that `https://pos-laundry-tau.vercel.app` is in the allowed origins list
   - Add any other required origins to the CORS configuration

## Rollback Plan

If issues occur after deployment:

1. Revert to the previous version:
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

2. Redeploy the previous working version through Vercel

3. Monitor the application to confirm the rollback was successful

## Additional Notes

- The CORS fixes should resolve all cross-origin request issues between the frontend and backend
- These changes maintain security by only allowing specific origins
- All existing functionality should remain unchanged