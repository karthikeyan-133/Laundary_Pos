# cPanel Database Setup for Tally POS

This guide will help you configure the Tally POS system to use a cPanel MySQL database instead of a local MySQL installation.

## Prerequisites

1. cPanel hosting account with MySQL database access
2. Remote MySQL access enabled in cPanel
3. Your IP address whitelisted in cPanel's remote MySQL settings

## Step 1: Create Database and User in cPanel

1. Log in to your cPanel
2. Navigate to the "MySQL Databases" section
3. Create a new database named `Pos_system` (or your preferred name)
4. Create a new database user with a strong password
5. Assign the user to the database with ALL PRIVILEGES
6. Note down the following information:
   - Database name
   - Database username
   - Database password
   - Database host (usually your domain name or a specific host provided by your host)

## Step 2: Enable Remote MySQL Access

1. In cPanel, find the "Remote MySQL" section
2. Add your development machine's IP address to the whitelist
3. If deploying to Vercel, you may need to contact your hosting provider to enable remote access

## Step 3: Update Environment Variables

Update the [.env](file://c:/Users/TECHZON-17/Desktop/Tally_Pos/backend-new/.env) file in the `backend-new` directory with your cPanel database information:

```env
# Database Configuration for cPanel
DB_HOST=your_cpanel_hostname_here
DB_USER=your_cpanel_database_username
DB_PASSWORD=your_cpanel_database_password
DB_NAME=your_cpanel_database_name
DB_PORT=3306
DB_SSL=false

# JWT Secret
JWT_SECRET=your_jwt_secret_here
```

## Step 4: Create Database Tables

Run the table creation script:

```bash
cd backend-new
npm run create-tables
```

## Step 5: Test Database Connection

Test the connection with:

```bash
cd backend-new
npm run test-db
```

## Troubleshooting

### Common Issues

1. **ECONNREFUSED Error**: 
   - Verify your DB_HOST is correct (not localhost)
   - Ensure remote MySQL access is enabled in cPanel
   - Check that your IP is whitelisted

2. **Access Denied Error**:
   - Verify database username and password
   - Confirm the user is assigned to the database with proper privileges

3. **SSL Connection Issues**:
   - Try setting DB_SSL=false in your .env file
   - If your host requires SSL, set DB_SSL=true

### Testing Connection to Specific Hosts

If you're having connection issues, you can test connectivity to your cPanel host:

```bash
# Test if you can reach the host
ping your_cpanel_hostname_here

# Test if the MySQL port is open
telnet your_cpanel_hostname_here 3306
```

## Security Considerations

1. Never commit your [.env](file://c:/Users/TECHZON-17/Desktop/Tally_Pos/backend-new/.env) file to version control
2. Use strong passwords for your database user
3. Limit database user privileges to only what's necessary
4. Regularly rotate your database credentials
5. If possible, use SSL connections (DB_SSL=true)

## Deployment to Vercel

When deploying to Vercel, you'll need to set the environment variables in the Vercel dashboard:

1. Go to your Vercel project settings
2. Navigate to the "Environment Variables" section
3. Add all the DB_* variables from your .env file