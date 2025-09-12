# cPanel Database Connection Troubleshooting Guide

This guide will help you resolve the connection issue you're experiencing with your cPanel database.

## Current Error Analysis

The error you're seeing indicates:
```
Error connecting to the cPanel database: AggregateError [ECONNREFUSED]
connect ECONNREFUSED ::1:3306
connect ECONNREFUSED 127.0.0.1:3306
```

This means your application is trying to connect to localhost (your local machine) instead of your cPanel database server.

## Step-by-Step Solution

### 1. Verify Your Database Host

The most common issue is an incorrect database host. In cPanel:

1. Log in to your cPanel
2. Go to "MySQL Databases"
3. Look for the database server information (often displayed at the top)
4. The host is NOT usually your domain name

Common cPanel database hosts:
- `localhost` (for scripts running on the same server)
- A specific hostname like `sql123.webhosting.com`
- Your domain name (less common)

### 2. Whitelist Your IP Address

If you're connecting from a remote server:

1. In cPanel, find "Remote MySQL" (under Databases section)
2. Add your server's public IP address to the whitelist
3. To find your IP: https://www.whatismyip.com/

### 3. Test Different Connection Methods

Run the test script to try different host configurations:

```bash
cd backend
npm run test-connection
```

### 4. Contact Your Hosting Provider

If the above steps don't work, contact your hosting provider for:
- The correct database host
- Confirmation that remote database connections are allowed
- Any specific configuration requirements

## Common cPanel Database Configurations

### Option 1: Same Server Connection
If your Node.js application runs on the same server as your cPanel:

```
DB_HOST=localhost
DB_USER=techzontech_Billing_User
DB_PASSWORD=Welc0me$27
DB_NAME=techzontech_Billing_Pos
DB_PORT=3306
```

### Option 2: Remote Connection
If connecting from a different server:

```
DB_HOST=your-cpanel-provided-hostname
DB_USER=techzontech_Billing_User
DB_PASSWORD=Welc0me$27
DB_NAME=techzontech_Billing_Pos
DB_PORT=3306
```

## Manual Verification Steps

1. **Check database exists**:
   - In cPanel → MySQL Databases
   - Verify `techzontech_Billing_Pos` is listed

2. **Check user exists and has privileges**:
   - In cPanel → MySQL Databases
   - Find "Add User To Database" section
   - Verify `techzontech_Billing_User` is assigned to `techzontech_Billing_Pos`
   - Ensure "ALL PRIVILEGES" is selected

3. **Test with a simple PHP script** (optional):
   Create a file `test-db.php` in your public_html:
   ```php
   <?php
   $link = mysqli_connect("localhost", "techzontech_Billing_User", "Welc0me$27", "techzontech_Billing_Pos");
   if (!$link) {
       die("Connection failed: " . mysqli_connect_error());
   }
   echo "Connected successfully";
   mysqli_close($link);
   ?>
   ```

## Additional Troubleshooting

1. **Firewall Issues**:
   - Some hosting providers block remote MySQL connections by default
   - Contact support to enable remote MySQL access

2. **Port Issues**:
   - MySQL typically runs on port 3306
   - Some providers use different ports
   - Check with your hosting provider

3. **SSL Requirements**:
   - Some providers require SSL connections
   - Try setting `DB_SSL=true` in your .env file

## Next Steps

1. Try the connection test script:
   ```bash
   cd backend
   npm run test-connection
   ```

2. If that fails, contact your hosting provider for the exact database host

3. Once you have the correct host, update your `.env` file and restart your application

If you continue to have issues, please share:
1. Your hosting provider name
2. Any documentation they provided about database connections
3. The results of the test-connection script