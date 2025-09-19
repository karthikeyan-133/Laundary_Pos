# MySQL Migration Guide

This document explains how to migrate the Tally POS system from Supabase to MySQL Workbench.

## Overview

The Tally POS system has been updated to use MySQL instead of Supabase for local development. This guide will help you set up and configure the application to work with MySQL Workbench.

## Changes Made

### 1. Database Configuration Files
- Created `init_db.sql` - MySQL schema initialization script
- Updated `.env` - MySQL connection configuration
- Removed all Supabase-specific configuration files

### 2. Backend Code Updates
- Replaced Supabase client with MySQL database interface (`mysqlDb.js`)
- Updated `server.js` to use MySQL queries instead of Supabase operations
- Modified all API endpoints to work with MySQL
- Updated database initialization scripts

### 3. Dependencies
- Removed `@supabase/supabase-js` dependency
- Kept `mysql2` for MySQL connectivity
- Updated package.json scripts

### 4. Removed Files
- `supabaseClient.js` - Supabase client implementation
- `supabaseDb.js` - Supabase database interface
- `supabase-init.sql` - Supabase initialization script
- `supabase-migration.sql` - Supabase migration script
- `supabase-complete-migration.sql` - Complete Supabase migration script

## Setup Instructions

### 1. Install MySQL Workbench
1. Download and install MySQL Workbench from the official website
2. Start MySQL Server (usually starts automatically with MySQL Workbench)

### 2. Configure Database Connection
1. Open the `.env` file in the `backend-new` directory
2. Update the following values with your MySQL credentials:
   ```
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=Pos_system
   DB_PORT=3306
   ```

### 3. Initialize Database
You can initialize the database in two ways:

#### Option A: Using MySQL Workbench (Recommended)
1. Open MySQL Workbench
2. Connect to your MySQL server
3. Open the `init_db.sql` file from the `backend-new` directory
4. Execute the script

#### Option B: Using Command Line
```bash
mysql -u your_username -p < backend-new/init_db.sql
```

### 4. Create Tables and Sample Data
```bash
cd backend-new
npm run create-tables
```

### 5. Start the Application
```bash
npm start
```

## Testing the Setup

### Test Database Connection
```bash
npm run test-connection
```

### Test API Endpoints
```bash
npm run test-api
```

## API Endpoints

All API endpoints remain the same as before, but now connect to MySQL:

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create customer
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order
- `GET /api/settings` - Get application settings
- `PUT /api/settings` - Update application settings

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure MySQL server is running
   - Check hostname and port in `.env`
   - Verify MySQL is accepting connections

2. **Authentication Failed**
   - Check username and password in `.env`
   - Ensure the MySQL user has proper privileges

3. **Database Not Found**
   - Run the `init_db.sql` script to create the database
   - Verify `DB_NAME` in `.env` matches the created database

4. **Table Not Found**
   - Run `npm run create-tables` to create tables
   - Check that the initialization script was executed successfully

### Verifying Setup

1. Check that the server starts without errors
2. Visit `http://localhost:3001/health` to verify the health check
3. Test a few API endpoints to ensure data is being retrieved correctly

## Reverting Changes

If you need to revert to Supabase:
1. Restore the deleted Supabase files from version control
2. Reinstall the `@supabase/supabase-js` dependency
3. Update the server.js file to use Supabase again
4. Update the `.env` file with Supabase credentials