# Deployment Instructions for Tally POS System

## Vercel Environment Variables Setup

To fix the 500 Internal Server Errors, you need to set the following environment variables in your Vercel dashboard:

### Backend Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add the following variables:

```
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=Pos_system
DB_PORT=3306
DB_SSL=false
```

### Frontend Environment Variables

For the frontend, you may also want to set:

```
VITE_API_URL=https://pos-laundry-backend.vercel.app
```

## Database Setup

Make sure your MySQL database is properly configured and accessible from Vercel. You may need to:

1. Whitelist Vercel's IP addresses in your database firewall
2. Ensure your database accepts connections from external hosts
3. Verify that the database credentials are correct

## Deployment Process

1. After setting the environment variables, redeploy your application:
   ```bash
   # In your project root directory
   vercel --prod
   ```

2. Or trigger a new deployment from the Vercel dashboard

## Troubleshooting

### If you're still getting 500 errors:

1. Check the Vercel function logs:
   - Go to your Vercel dashboard
   - Click on the deployment
   - Check the function logs for detailed error messages

2. Verify database connectivity:
   - Use the `/api/health` endpoint to check if the API can connect to the database
   - Visit: `https://your-backend-url.vercel.app/api/health`

3. Check that all required environment variables are set:
   - Make sure DB_HOST, DB_USER, and DB_NAME are set in the Vercel dashboard

### Common Issues:

1. **Environment variables not loaded**: In Vercel, environment variables must be set in the dashboard, not in a .env file
2. **Database connection timeout**: Make sure your database accepts external connections
3. **CORS errors**: The application should handle CORS properly with the updated configuration

## Testing the Fix

After deployment, you can test the endpoints:

1. Visit your frontend URL and check if the application loads
2. Open browser developer tools and check for any 500 errors in the Network tab
3. Try accessing the health check endpoint: `https://your-backend-url.vercel.app/health`

If everything is configured correctly, the 500 errors should be resolved.