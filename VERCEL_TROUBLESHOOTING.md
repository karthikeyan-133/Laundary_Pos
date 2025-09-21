# Vercel Deployment Troubleshooting Guide

## Problem
You're still experiencing 500 Internal Server errors when accessing the backend API endpoints:
- https://pos-laundry-backend.vercel.app/api/returns
- https://pos-laundry-backend.vercel.app/api/products
- https://pos-laundry-backend.vercel.app/api/settings
- https://pos-laundry-backend.vercel.app/api/customers
- https://pos-laundry-backend.vercel.app/api/orders

## Root Cause
The 500 Internal Server errors indicate that the backend application is failing to start or connect to the database properly in the Vercel environment.

## Troubleshooting Steps

### 1. Check Environment Variables in Vercel Dashboard

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Ensure the following variables are set:
   ```
   DB_HOST=your_database_host
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_NAME=Pos_system
   DB_PORT=3306
   ```

### 2. Test Environment Variables

After setting the environment variables, you can test if they're properly configured by visiting:
```
https://pos-laundry-backend.vercel.app/api/test-env
```

This endpoint will show you which environment variables are set and which are missing.

### 3. Verify Database Connectivity

Make sure your MySQL database is accessible from Vercel:
1. Your database host must be publicly accessible (not localhost)
2. The database user must allow connections from Vercel's IP addresses
3. The database credentials must be correct
4. The database must have the required tables created

### 4. Check Vercel Function Logs

1. Go to your Vercel project dashboard
2. Click on the "Functions" tab
3. Look for any functions with errors
4. Click on individual function logs to see detailed error messages

### 5. Manual Database Table Creation

If the tables don't exist in your database, you may need to create them manually:

1. Connect to your MySQL database using a client like MySQL Workbench
2. Run the following SQL commands to create the required tables:

```sql
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  ironRate DECIMAL(10, 2) NOT NULL,
  washAndIronRate DECIMAL(10, 2) NOT NULL,
  dryCleanRate DECIMAL(10, 2) NOT NULL,
  category VARCHAR(255),
  barcode VARCHAR(255) UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(255),
  contact_name VARCHAR(255),
  phone VARCHAR(255),
  email VARCHAR(255),
  place VARCHAR(255),
  emirate VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY,
  tax_rate DECIMAL(5, 2) DEFAULT 5.00,
  currency VARCHAR(10) DEFAULT 'AED',
  business_name VARCHAR(255) DEFAULT 'TallyPrime Café',
  business_address TEXT DEFAULT 'Shop 123, Marina Mall, Dubai Marina, Dubai, UAE',
  business_phone VARCHAR(255) DEFAULT '+971 4 123 4567',
  barcode_scanner_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(255) PRIMARY KEY,
  customer_id VARCHAR(255),
  subtotal DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(255),
  cash_amount DECIMAL(10, 2),
  card_amount DECIMAL(10, 2),
  status VARCHAR(255),
  delivery_status VARCHAR(255),
  payment_status VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id VARCHAR(255) PRIMARY KEY,
  order_id VARCHAR(255),
  product_id VARCHAR(255),
  quantity INT NOT NULL,
  discount DECIMAL(5, 2) DEFAULT 0,
  subtotal DECIMAL(10, 2) NOT NULL,
  service VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS returns (
  id VARCHAR(255) PRIMARY KEY,
  order_id VARCHAR(255),
  reason TEXT,
  refund_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS return_items (
  id VARCHAR(255) PRIMARY KEY,
  return_id VARCHAR(255),
  product_id VARCHAR(255),
  quantity INT NOT NULL,
  refund_amount DECIMAL(10, 2) NOT NULL
);
```

### 6. Redeploy the Application

After making changes to environment variables:
1. Trigger a new deployment in Vercel
2. Or push a new commit to trigger an automatic deployment

### 7. Test Database Connection Locally

Before deploying, you can test the database connection locally:

1. Create a `.env` file in the `backend-new` directory with your database credentials:
   ```
   DB_HOST=your_database_host
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_NAME=Pos_system
   DB_PORT=3306
   ```

2. Run the test script:
   ```bash
   cd backend-new
   npm run test-db-vercel
   ```

## Common Issues and Solutions

### Issue: "Environment variables are not loaded properly"
**Solution**: Make sure all required environment variables are set in the Vercel dashboard.

### Issue: "Error connecting to the MySQL database"
**Solution**: 
1. Verify database credentials
2. Ensure the database is accessible from Vercel
3. Check that the database user has proper permissions

### Issue: "Table 'table_name' doesn't exist"
**Solution**: Manually create the required tables in your database using the SQL commands above.

## Prevention

To prevent similar issues in the future:
1. Always set environment variables in the Vercel dashboard for production deployments
2. Test database connectivity before deploying
3. Monitor Vercel function logs for errors
4. Keep documentation updated with deployment requirements