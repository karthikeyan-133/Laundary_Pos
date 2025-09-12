# cPanel Database Setup Guide for Tally POS System

This guide will help you configure your Tally POS system to connect to a cPanel MySQL database instead of a local database.

## Step 1: Create a Database in cPanel

1. Log in to your cPanel account
2. Navigate to the "Databases" section
3. Click on "MySQL Databases"
4. Create a new database (note the database name)
5. Create a new database user (note the username and password)
6. Assign the user to the database and grant all privileges

## Step 2: Configure Remote MySQL Access (if needed)

If you're connecting from a remote server:

1. In cPanel, find "Remote MySQL" under the "Databases" section
2. Add your server's IP address to the whitelist
3. You can find your IP address by visiting https://www.whatismyip.com/

## Step 3: Update Your Database Configuration

Edit the `.env` file in the `backend` directory with your cPanel database credentials:

```env
# cPanel Database Configuration
DB_HOST=your_cpanel_hostname_or_ip
DB_USER=your_cpanel_mysql_username
DB_PASSWORD=your_secure_database_password
DB_NAME=your_cpanel_database_name
DB_PORT=3306
DB_SSL=false
PORT=3001
```

### Configuration Details:

- **DB_HOST**: Your cPanel hostname (often your domain name) or the IP provided by your host
- **DB_USER**: Your cPanel MySQL username (often prefixed with your cPanel username)
- **DB_PASSWORD**: The password for your database user
- **DB_NAME**: Your database name (often prefixed with your cPanel username)
- **DB_PORT**: Usually 3306 for MySQL (change if your host uses a different port)
- **DB_SSL**: Set to "true" if your host requires SSL connections
- **PORT**: The port on which your Node.js server will run

## Step 4: Initialize Your Database

After updating the configuration:

1. Make sure your database is empty
2. Run the database initialization script:

```bash
cd backend
node init-db.js
```

This will create all the necessary tables and insert sample data.

## Troubleshooting

### Common Issues:

1. **Connection Refused**: 
   - Check that your credentials are correct
   - Verify your IP is whitelisted in Remote MySQL settings
   - Confirm the database host and port are correct

2. **Access Denied**:
   - Ensure the database user has proper privileges
   - Double-check the username and password

3. **SSL Connection Errors**:
   - Try setting DB_SSL=true in your .env file
   - Contact your hosting provider for SSL configuration details

### Testing the Connection:

You can test your database connection by running:

```bash
cd backend
node -e "require('./db.js'); console.log('If you see no errors above, the connection is successful')"
```

## Security Notes

- Never commit your `.env` file to version control
- Use strong passwords for your database users
- Limit database user privileges to only what's necessary
- Regularly update your database credentials

## Support

If you continue to have issues connecting to your cPanel database, contact your hosting provider for specific configuration details for your hosting environment.