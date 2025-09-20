@echo off
echo Deploying CORS fixes to Vercel...

echo.
echo 1. Adding all changes to git...
git add .

echo.
echo 2. Committing changes...
git commit -m "Fix CORS issues for cross-origin requests between frontend and backend"

echo.
echo 3. Pushing to repository...
git push origin main

echo.
echo 4. Deployment to Vercel will start automatically
echo    Monitor the deployment at: https://vercel.com/

echo.
echo Deployment process completed!
echo Please check Vercel dashboard for deployment status.
pause