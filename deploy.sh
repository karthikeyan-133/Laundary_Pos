#!/bin/bash

# Deployment script for Tally POS System

echo "Starting deployment process..."

# Build the frontend
echo "Building frontend..."
cd frontend
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "Frontend build successful"
else
    echo "Frontend build failed"
    exit 1
fi

cd ..

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod

echo "Deployment completed!"