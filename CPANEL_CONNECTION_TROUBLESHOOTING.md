# cPanel Database Connection Troubleshooting

This guide helps diagnose and resolve common connection issues when using a cPanel MySQL database with the Tally POS system.

## Common Error Messages and Solutions

### 1. ETIMEDOUT Errors

**Error Message:**
```
Error connecting to the MySQL database: AggregateError [ETIMEDOUT]
```

**Cause:** The connection attempt to the database timed out, meaning the server didn't respond within the expected time.

**Solutions:**
1. **Check Remote MySQL Settings in cPanel**
   - Log in to cPanel
   - Navigate to "Remote MySQL"
   - Ensure your IP address is whitelisted
   - If you're on a dynamic IP, you may need to periodically update this

2. **Verify Database Host**
   - Some hosting providers use a specific hostname for remote database connections
   - Check your hosting provider's documentation for the correct database host
   - It might not be your domain name

3. **Check Firewall Settings**
   - Ensure your local firewall allows outgoing connections on port 3306
   - Some corporate networks block MySQL ports

4. **Verify Port Number**
   - While 3306 is the standard MySQL port, some hosts use different ports
   - Check with your hosting provider

### 2. ECONNREFUSED Errors

**Error Message:**
```
Error: connect ECONNREFUSED ::1:3306
connect ECONNREFUSED 127.0.0.1:3306
```

**Cause:** The connection was actively refused by the server.

**Solutions:**
1. Check that you're not using localhost/127.0.0.1 as your DB_HOST
2. Verify that remote MySQL is enabled in cPanel
3. Confirm MySQL service is running on the server

### 3. Access Denied Errors

**Error Message:**
```
Error: Access denied for user 'username'@'host' (using password: YES)
```

**Cause:** Incorrect database credentials or insufficient privileges.

**Solutions:**
1. Double-check your DB_USER and DB_PASSWORD in the [.env](file://c:/Users/TECHZON-17/Desktop/Tally_Pos/backend-new/.env) file
2. In cPanel, verify the database user exists and is assigned to your database
3. Confirm the user has ALL PRIVILEGES on the database
4. Reset the database user password in cPanel and update your [.env](file://c:/Users/TECHZON-17/Desktop/Tally_Pos/backend-new/.env) file

### 4. Unknown Database Errors

**Error Message:**
```
Error: Unknown database 'Pos_system'
```

**Cause:** The database doesn't exist or the name is incorrect.

**Solutions:**
1. In cPanel, verify that the database exists
2. Check that the DB_NAME in your [.env](file://c:/Users/TECHZON-17/Desktop/Tally_Pos/backend-new/.env) file matches exactly (case-sensitive)
3. Create the database in cPanel if it doesn't exist

### 5. Host Not Found Errors

**Error Message:**
```
Error: getaddrinfo ENOTFOUND your-hostname.com
```

**Cause:** The DB_HOST value is incorrect or cannot be resolved.

**Solutions:**
1. Verify the DB_HOST value in your [.env](file://c:/Users/TECHZON-17/Desktop/Tally_Pos/backend-new/.env) file
2. Contact your hosting provider to confirm the correct database host
3. Try using the IP address instead of the hostname

## Diagnostic Steps

### 1. Verify Environment Variables

Check that your [.env](file://c:/Users/TECHZON-17/Desktop/Tally_Pos/backend-new/.env) file contains the correct values:

```env
DB_HOST=your_actual_cpanel_hostname
DB_USER=your_actual_database_username
DB_PASSWORD=your_actual_database_password
DB_NAME=your_actual_database_name
DB_PORT=3306
DB_SSL=false
```

### 2. Run the cPanel Connection Test

Use the new test script to diagnose connection issues:

```bash
cd backend-new
npm run test-cpanel
```

This script will provide detailed information about what's failing and suggestions for fixing it.

### 3. Test Network Connectivity

From your development machine, test if you can reach the cPanel host:

```bash
# Test hostname resolution
ping your_cpanel_hostname_here

# Test MySQL port accessibility (Windows PowerShell)
Test-NetConnection your_cpanel_hostname_here -Port 3306
```

### 4. Test Database Connection Manually

Use the MySQL command-line client to test the connection:

```bash
mysql -h your_cpanel_hostname_here -u your_database_username -p your_database_name
```

### 5. Check cPanel Remote MySQL Settings

1. Log in to cPanel
2. Navigate to "Remote MySQL"
3. Ensure your IP address is listed in the access list
4. If not, add your IP address and save

## Vercel Deployment Issues

### Environment Variables Not Set

When deploying to Vercel, environment variables from your [.env](file://c:/Users/TECHZON-17/Desktop/Tally_Pos/backend-new/.env) file are not automatically transferred.

**Solution:**
1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add each DB_* variable from your [.env](file://c:/Users/TECHZON-17/Desktop/Tally_Pos/backend-new/.env) file

### IP Whitelisting for Vercel

Vercel uses dynamic IP addresses, which may not be whitelisted in your cPanel Remote MySQL settings.

**Solutions:**
1. Contact your hosting provider to request access for Vercel's IP ranges
2. Some hosts provide specific IP ranges for cloud platforms
3. Consider using a proxy or tunnel service for database connections

## Advanced Troubleshooting

### Enable Detailed Logging

Update your [mysqlDb.js](file://c:/Users/TECHZON-17/Desktop/Tally_Pos/backend-new/mysqlDb.js) file to enable more detailed logging:

```javascript
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'Pos_system',
  port: process.env.DB_PORT || 3306,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  connectionLimit: 10,
  queueLimit: 0,
  debug: true, // Add this line for detailed MySQL debugging
  trace: true  // Add this line for stack traces
});
```

### Test with Different SSL Settings

If you're having SSL-related issues, try different SSL configurations:

```env
# Try without SSL
DB_SSL=false

# Or try with SSL but without certificate validation
DB_SSL=true
```

## Contact Your Hosting Provider

If you've tried all the above solutions and still can't connect:

1. Provide them with the exact error message
2. Ask for the correct database host for remote connections
3. Request that your IP address (or Vercel's IPs) be whitelisted
4. Ask if there are any specific connection requirements or restrictions
5. Some hosts require you to use a specific hostname for database connections that's different from your domain name

## Security Notes

1. Never share your database credentials
2. Use strong, unique passwords for database users
3. Limit database user privileges to only what's necessary
4. Regularly rotate credentials
5. Monitor database access logs for suspicious activity