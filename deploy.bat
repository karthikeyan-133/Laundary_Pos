@echo off
REM Deployment script for Tally POS System

echo Starting deployment process...

REM Build the frontend
echo Building frontend...
cd frontend
npm run build

REM Check if build was successful
if %errorlevel% == 0 (
    echo Frontend build successful
) else (
    echo Frontend build failed
    exit /b 1
)

cd ..

REM Deploy to Vercel
echo Deploying to Vercel...
vercel --prod

echo Deployment completed!