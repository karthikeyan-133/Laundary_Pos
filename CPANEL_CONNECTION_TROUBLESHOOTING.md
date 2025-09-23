# cPanel Database Connection Troubleshooting

This guide helps diagnose and resolve common connection issues when using a cPanel MySQL database with the Tally POS system.

## Common Error Messages and Solutions

### 1. ECONNREFUSED Errors

**Error Message:**
```
Error connecting to the cPanel database: AggregateError [ECONNREFUSED]
connect ECONNREFUSED ::1:3306
connect ECONNREFUSED 127.0.0.1:3306
```

**Cause:** The application is trying to connect to localhost instead of your cPanel database host.

**Solutions:**
1. Check your [.env](file://c:/Users/TECHZON-17/Desktop/Tally_Pos/backend-new/.env) file and ensure DB_HOST is set to your cPanel hostname, not localhost
2. Verify that remote MySQL access is enabled in cPanel
3. Confirm your IP address is whitelisted in cPanel's Remote MySQL settings

### 2. Access Denied Errors

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

### 3. Unknown Database Errors

**Error Message:**
```
Error: Unknown database 'Pos_system'
```

**Cause:** The database doesn't exist or the name is incorrect.

**Solutions:**
1. In cPanel, verify that the database exists
2. Check that the DB_NAME in your [.env](file://c:/Users/TECHZON-17/Desktop/Tally_Pos/backend-new/.env) file matches exactly (case-sensitive)
3. Create the database in cPanel if it doesn't exist

### 4. Host Not Found Errors

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

### 2. Test Network Connectivity

From your development machine, test if you can reach the cPanel host:

```bash
# Test hostname resolution
ping your_cpanel_hostname_here

# Test MySQL port accessibility
telnet your_cpanel_hostname_here 3306
# or
nc -zv your_cpanel_hostname_here 3306
```

### 3. Test Database Connection Manually

Use the MySQL command-line client to test the connection:

```bash
mysql -h your_cpanel_hostname_here -u your_database_username -p your_database_name
```

### 4. Check cPanel Remote MySQL Settings

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

## Security Notes

1. Never share your database credentials
2. Use strong, unique passwords for database users
3. Limit database user privileges to only what's necessary
4. Regularly rotate credentials
5. Monitor database access logs for suspicious activity