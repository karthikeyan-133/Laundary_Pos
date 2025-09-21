# Diagnostic Endpoints for Vercel Deployment Troubleshooting

This document explains how to use the diagnostic endpoints we've created to troubleshoot your Vercel deployment issues.

## Available Diagnostic Endpoints

### 1. Health Check Endpoint
**URL**: `https://pos-laundry-backend.vercel.app/api/health`
**Purpose**: Basic endpoint to verify Vercel routing is working
**Expected Response**: 
```json
{
  "status": "OK",
  "message": "Health check endpoint is working",
  "timestamp": "2023-XX-XXTXX:XX:XX.XXXZ"
}
```

### 2. Environment Variables Test
**URL**: `https://pos-laundry-backend.vercel.app/api/test-env`
**Purpose**: Shows which environment variables are set
**Expected Response**: 
```json
{
  "message": "Environment variables check",
  "envInfo": {
    "DB_HOST": "SET/NOT SET",
    "DB_USER": "SET/NOT SET",
    "DB_NAME": "SET/NOT SET",
    "DB_PORT": "value or NOT SET",
    "VERCEL": "YES/NO",
    "NODE_ENV": "value or NOT SET"
  },
  "missingEnvVars": [],
  "status": "OK/MISSING VARIABLES"
}
```

### 3. Routing Debug Endpoint
**URL**: `https://pos-laundry-backend.vercel.app/api/routing-debug`
**Purpose**: Shows detailed information about how Vercel is routing requests
**Expected Response**: 
```json
{
  "message": "Routing Debug Information",
  "request": {
    "url": "/api/routing-debug",
    "method": "GET",
    "headers": { /* request headers */ },
    "query": {}
  },
  "environment": {
    "VERCEL": "YES/NO",
    "VERCEL_URL": "value or NOT SET",
    "NOW_REGION": "value or NOT SET"
  },
  "timestamp": "2023-XX-XXTXX:XX:XX.XXXZ",
  "status": "ROUTING_DEBUG_SUCCESS"
}
```

### 4. Server Test Endpoint
**URL**: `https://pos-laundry-backend.vercel.app/api/test-server`
**Purpose**: Tests if the Express server is working correctly
**Expected Response**: 
```json
{
  "message": "Server test successful",
  "timestamp": "2023-XX-XXTXX:XX:XX.XXXZ",
  "server": "Express server is running correctly"
}
```

### 5. Full Environment Test
**URL**: `https://pos-laundry-backend.vercel.app/api/full-env-test`
**Purpose**: Comprehensive test of environment variables and database connectivity
**Expected Response**: 
```json
{
  "message": "Full Environment Test",
  "environment": {
    "VERCEL": "YES/NO",
    "VERCEL_ENV": "value or NOT SET",
    "VERCEL_URL": "value or NOT SET",
    "NODE_ENV": "value or NOT SET"
  },
  "database": {
    "DB_HOST": "SET/NOT SET",
    "DB_USER": "SET/NOT SET",
    "DB_NAME": "SET/NOT SET",
    "DB_PORT": "value",
    "connection": "SUCCESS/FAILED",
    "testQuery": "SUCCESS/FAILED"
  },
  "missingEnvVars": [],
  "status": "ENVIRONMENT_OK/MISSING_ENVIRONMENT_VARIABLES"
}
```

### 6. Detailed Database Connection Test
**URL**: `https://pos-laundry-backend.vercel.app/api/db-connection-test`
**Purpose**: Detailed test of database connection with multiple configuration attempts
**Expected Response**: 
```json
{
  "message": "Database Connection Test Results",
  "environment": {
    "DB_HOST": "value",
    "DB_USER": "value",
    "DB_NAME": "value",
    "DB_PORT": "value"
  },
  "results": [
    {
      "name": "Standard Connection",
      "status": "SUCCESS/FAILED",
      "queryTest": "PASSED/FAILED"
    },
    {
      "name": "Connection with SSL Disabled",
      "status": "SUCCESS/FAILED",
      "queryTest": "PASSED/FAILED"
    }
  ],
  "overallStatus": "PARTIAL_SUCCESS/ALL_FAILED"
}
```

## Troubleshooting Workflow

1. **Start with the Health Check**: Verify basic Vercel routing is working
2. **Check Environment Variables**: Ensure all required variables are set
3. **Debug Routing**: If you're getting 404 errors, use the routing debug endpoint
4. **Test Server**: Verify the Express server is working
5. **Full Environment Test**: Comprehensive test of environment and database
6. **Detailed Database Test**: If database connection is failing, use this for detailed diagnostics

## Interpreting Results

### If Health Check Fails
- The issue is with basic Vercel routing
- Check your vercel.json configuration
- Verify the file paths in your routes

### If Environment Variables are Missing
- Set the required environment variables in your Vercel dashboard:
  - DB_HOST
  - DB_USER
  - DB_PASSWORD
  - DB_NAME
  - DB_PORT (optional, defaults to 3306)

### If Routing Debug Shows Issues
- Check the request URL and method in the response
- Verify your vercel.json routes configuration
- Ensure file paths are correct

### If Server Test Fails
- The Express server may not be starting correctly
- Check Vercel function logs for errors
- Verify all dependencies are properly installed

### If Database Tests Fail
- Verify your database credentials
- Ensure your database is accessible from Vercel
- Check that your database user has proper permissions
- Verify SSL settings if applicable

## Next Steps

After running these diagnostic tests:
1. Document the results
2. Check Vercel function logs for any error messages
3. Fix any identified issues
4. Redeploy your application
5. Retest the endpoints

If you continue to experience issues, please share the results of these diagnostic tests along with any error messages from the Vercel function logs.