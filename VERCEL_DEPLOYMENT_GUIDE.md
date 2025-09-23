# Vercel Deployment Guide for Tally POS System

This guide will help you deploy the Tally POS system on Vercel with separate frontend and backend deployments.

## Prerequisites

1. Vercel account
2. GitHub/GitLab/Bitbucket account with the repository
3. MySQL database credentials (host, user, password, database name)

## Step-by-Step Deployment

### 1. Deploy the Backend

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your repository or select the backend directory
4. Configure the project:
   - Framework Preset: Other
   - Root Directory: backend-new
   - Build Command: (leave empty, Vercel will use the vercel.json config)
   - Output Directory: (leave empty)

5. Set up environment variables in the Vercel dashboard:
   - DB_HOST: your-database-host
   - DB_USER: your-database-user
   - DB_PASSWORD: your-database-password (use Vercel's secrets feature for sensitive data)
   - DB_NAME: your-database-name
   - DB_PORT: 3306
   - DB_SSL: false (or true if your database requires SSL)
   - JWT_SECRET: your-jwt-secret (generate a strong secret)
   - PORT: 3000 (Vercel will set this automatically, but you can specify it)

6. Deploy the project
7. Note the deployed URL for the backend (e.g., https://your-backend-project.vercel.app)

### 2. Update Frontend Configuration

1. Open `frontend/src/services/api.ts`
2. Update the `getApiBaseUrl` function to use your actual backend URL:
   ```typescript
   if (window.location.hostname.includes('vercel.app')) {
     // For Vercel deployments, use the specific backend URL
     return 'https://your-backend-url.vercel.app';
   }
   ```
3. Commit and push this change to your repository

### 3. Deploy the Frontend

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your repository or select the frontend directory
4. Configure the project:
   - Framework Preset: Vite
   - Root Directory: frontend
   - Build Command: npm run build
   - Output Directory: dist

5. Deploy the project

### 4. Set up Environment Variables for Frontend (if needed)

If you want to use a custom API URL, you can set:
- VITE_API_URL: https://your-backend-url.vercel.app

## Environment Variables Required

### Backend Environment Variables

| Variable | Description | Example Value |
|----------|-------------|---------------|
| DB_HOST | Database host | your-database-host.com |
| DB_USER | Database user | your-database-user |
| DB_PASSWORD | Database password | your-database-password |
| DB_NAME | Database name | your-database-name |
| DB_PORT | Database port | 3306 |
| DB_SSL | Use SSL connection | false |
| JWT_SECRET | Secret for JWT tokens | your-strong-jwt-secret |
| PORT | Server port | 3000 |

### Frontend Environment Variables (Optional)

| Variable | Description | Example Value |
|----------|-------------|---------------|
| VITE_API_URL | API base URL | https://your-backend-url.vercel.app |

## Testing the Deployment

1. Visit your frontend URL
2. Try logging in with the default credentials (admin/admin123)
3. Navigate to different sections to ensure data is loading correctly
4. Test creating new products, customers, and orders

## Troubleshooting

### Common Issues and Solutions

1. **CORS Errors**
   - Ensure the backend is properly configured to allow requests from your frontend domain
   - Check that the frontend is using the correct API URL

2. **Database Connection Issues**
   - Verify database credentials in Vercel environment variables
   - Ensure your database allows connections from Vercel's IP addresses
   - Check if your hosting provider requires a specific database host

3. **API Requests Failing**
   - Verify the backend is running
   - Check if the API path is correctly configured
   - Ensure environment variables are properly set

### Checking Logs

1. In the Vercel dashboard, go to your project
2. Click on the "Logs" tab
3. Check for any error messages
4. You can also use `vercel logs` command if you have Vercel CLI installed

## Security Recommendations

1. Change the default admin password immediately after first login
2. Use Vercel's secrets feature for sensitive environment variables
3. Implement proper authentication and authorization
4. Use HTTPS for your deployment
5. Regularly update your dependencies
6. Monitor your application logs for suspicious activity

## Next Steps

Once your application is deployed:
1. Log in with admin/admin123 and change the default password
2. Configure your business settings in the Settings section
3. Add your products and customers
4. Start processing orders