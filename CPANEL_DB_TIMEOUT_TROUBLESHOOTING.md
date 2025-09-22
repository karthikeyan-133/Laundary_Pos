# cPanel Database Connection Timeout Troubleshooting

This guide will help you resolve the ETIMEDOUT database connection errors you're experiencing with your cPanel MySQL database.

## Current Issue Analysis

The error messages show:
```
DNS lookup result for DB_HOST: { address: '64:ff9b::be5c:ae66', family: 6 }
Error connecting to the MySQL database: Error: connect ETIMEDOUT
```

This indicates that:
1. The DNS lookup is returning an IPv6 address
2. The connection is timing out, likely due to IPv6 connectivity issues

## Root Causes

ETIMEDOUT errors with cPanel databases are typically caused by:

1. **IPv6 Connection Issues** - cPanel servers may not properly handle IPv6 connections
2. **Remote MySQL Not Enabled** - Remote database access must be enabled in cPanel
3. **IP Not Whitelisted** - Your IP address must be whitelisted in cPanel's Remote MySQL
4. **Firewall Blocking** - Firewalls may block outgoing connections on port 3306
5. **Incorrect Hostname** - Some hosting providers require a specific hostname format

## Solutions

### Solution 1: Force IPv4 Connection

Your `.env` file has been updated to force IPv4 connections:

```env
# Force IPv4 connection
DB_FORCE_IPV4=true
```

This setting tells Node.js to prefer IPv4 addresses over IPv6 when resolving hostnames.

### Solution 2: Verify cPanel Remote MySQL Settings

1. Log in to your cPanel
2. Find "Remote MySQL" (usually under "Databases" section)
3. Ensure "Remote MySQL" is enabled
4. Add your IP address to the whitelist:
   - Get your public IP address from https://whatismyipaddress.com/
   - Add this IP to the Remote MySQL access list
   - You may also need to add your IP range (e.g., xxx.xxx.xxx.%)

### Solution 3: Check Database Host Format

Some hosting providers require a specific format for the database host. Try these variations:

1. `localhost` - if running on the same server
2. `127.0.0.1` - force IPv4 localhost
3. `techzontech.com` - your current setting
4. `localhost.techzontech.com` - some providers require this format

### Solution 4: Test Connection with MySQL Client

Test your database connection using a MySQL client:

```bash
mysql -h techzontech.com -u techzontech_Pos_user -p techzontech_Lanundry_Pos
```

If this fails, the issue is with your cPanel configuration, not your application code.

### Solution 5: Check Port and SSL Settings

Verify these settings in your `.env` file:

```env
DB_PORT=3306
DB_SSL=false
```

Some hosting providers:
- Use a different port (3306 is standard but not always used)
- Require SSL connections
- Don't support SSL connections

### Solution 6: Run the IPv4 Test Script

Run the test script we created:

```bash
cd backend-new
node test-db-connection-ipv4.js
```

This will test the connection with IPv4 forcing enabled.

## Expected Behavior After Fix

1. Database connection should succeed without ETIMEDOUT errors
2. DNS lookup should return an IPv4 address
3. Application should start successfully

## If Issues Persist

1. Contact your hosting provider to verify:
   - Remote MySQL access is enabled
   - Your IP is whitelisted
   - The correct database host format to use
   - Whether they require SSL connections
   - Whether they use a non-standard port

2. Try connecting from a different network (to rule out local firewall issues)

3. Check if your hosting provider has any specific requirements for Node.js applications

## Contact for Further Assistance

If you continue to experience issues after trying these solutions, please provide:
1. Screenshots of your cPanel Remote MySQL settings
2. Results of the MySQL client connection test
3. Output of the IPv4 test script
4. Any specific error messages from your hosting provider

This will help in providing more specific guidance for your situation.