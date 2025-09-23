# cPanel Database Setup Guide

This guide will help you set up your MySQL database on cPanel for the Tally POS system.

## Prerequisites

1. cPanel hosting account
2. Access to cPanel control panel
3. The following information from your [.env](file:///C:/Users/TECHZON-17/Desktop/Tally_Pos/backend-new/.env) file:
   - Database name: `techzontech_Laundry_Pos`
   - Database user: `techzontech_Pos_user`
   - Database password: `Welc0me$27`
   - Host: `techzontech.com`

## Step-by-Step Setup

### 1. Log into cPanel

1. Go to your cPanel login URL (usually `https://yourdomain.com/cpanel` or provided by your host)
2. Enter your cPanel username and password

### 2. Create MySQL Database

1. In cPanel, find and click on "MySQL Databases" (under the Databases section)
2. In the "Create New Database" section:
   - Enter database name: `Laundry_Pos`
   - Click "Create Database"
3. You should see `techzontech_Laundry_Pos` in your database list

### 3. Create Database User

1. In the "MySQL Databases" page, scroll to "Add New User" section
2. Fill in the details:
   - Username: `Pos_user` (cPanel will prefix it with your account name)
   - Password: `Welc0me$27` (or a strong password of your choice)
   - Confirm password
3. Click "Create User"

### 4. Assign User to Database

1. Scroll to "Add User To Database" section
2. Select the user: `techzontech_Pos_user`
3. Select the database: `techzontech_Laundry_Pos`
4. Click "Add"
5. In the next screen, select "All Privileges" 
6. Click "Make Changes"

### 5. Enable Remote MySQL Access

1. Find and click on "Remote MySQL" (may be under Databases or Security section)
2. In the "Add Access Hosts" section, add your IP address:
   - To find your IP: visit https://www.whatismyip.com/
   - Enter your IP address in the field
   - Click "Add Host"
3. Optionally, you can add `%` to allow connections from any IP (less secure)

### 6. Test Database Connection

After completing the above steps:

1. Navigate to your project directory:
   ```
   cd c:\Users\TECHZON-17\Desktop\Tally_Pos\backend-new
   ```

2. Run the test script:
   ```
   node cpanel-db-setup.js
   ```

3. If successful, initialize the database:
   ```
   node init-cpanel-db.js
   ```

## Troubleshooting

### Common Issues and Solutions

1. **Connection Timeout**
   - Ensure remote MySQL access is enabled
   - Verify your IP is whitelisted
   - Check if your hosting provider requires a specific hostname

2. **Access Denied**
   - Double-check username and password
   - Confirm user privileges on the database
   - Some hosts require using `username_database` format for database name

3. **Host Not Found**
   - Some hosts use a specific database hostname (not your domain)
   - Check your hosting provider's documentation
   - Common alternatives: `localhost`, `127.0.0.1`, or a specific server IP

4. **SSL Connection Issues**
   - Try setting `DB_SSL=false` in your [.env](file:///C:/Users/TECHZON-17/Desktop/Tally_Pos/backend-new/.env) file
   - Some hosts require SSL connections

### Contact Your Hosting Provider

If you continue having issues:
1. Ask for the correct database hostname
2. Confirm if remote MySQL connections are allowed
3. Check if there are any firewall restrictions
4. Verify port 3306 is open for MySQL connections

## Security Recommendations

1. Use a strong password for your database user
2. Only whitelist necessary IP addresses in Remote MySQL
3. Regularly update your database credentials
4. Limit user privileges to only what's necessary
5. Consider using SSL connections in production

## Next Steps

Once your database is set up and connected:
1. Run `node init-cpanel-db.js` to create tables
2. Start your server with `npm start`
3. Access the application and log in with the default admin credentials
4. Change the default admin password immediately