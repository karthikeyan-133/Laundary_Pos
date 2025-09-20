@echo off
cls
echo ==========================================
echo Tally POS CORS Fix Deployment Script
echo ==========================================
echo.

echo 1. Adding all changes to git...
git add .

echo.
echo 2. Committing changes with descriptive message...
git commit -m "Fix CORS issues: Add explicit CORS headers for all API endpoints and Vercel-specific configurations"

echo.
echo 3. Pushing changes to repository...
git push origin main

echo.
echo 4. Deployment to Vercel will start automatically.
echo    Please monitor the deployment at: https://vercel.com/
echo.

echo ==========================================
echo POST-DEPLOYMENT TESTING:
echo ==========================================
echo After deployment completes, test these URLs:
echo 1. https://pos-laundry-backend.vercel.app/vercel-cors-test
echo 2. https://pos-laundry-backend.vercel.app/api/test
echo 3. https://pos-laundry-backend.vercel.app/api/health
echo.
echo Then refresh your frontend at:
echo https://pos-laundry-tau.vercel.app
echo ==========================================

echo.
echo Deployment process completed!
echo The CORS issues should be resolved after Vercel finishes deploying.
pause