# cPanel Deployment Guide for Tally POS System

This guide will help you deploy the Tally POS system on cPanel with both frontend and backend properly connected to the database.

## Prerequisites

1. cPanel hosting account with Node.js support
2. MySQL database access through cPanel
3. SSH access to cPanel (optional but recommended)
4. The following information from your [.env](file:///C:/Users/TECHZON-17/Desktop/Tally_Pos/backend-new/.env) file:
   - Database name: `techzontech_Lanundry_Pos`
   - Database user: `techzontech_Pos_user`
   - Database password: `Welc0me$27`
   - Host: `techzontech.com`

## Step-by-Step Deployment

### 1. Set up the Database

If you haven't already set up the database, follow these steps:

1. Log into your cPanel
2. Navigate to "MySQL Databases"
3. Create a new database named `Laundry_Pos` (cPanel will prefix it with your account name)
4. Create a new database user with username `Pos_user` and a strong password
5. Assign the user to the database with all privileges
6. Enable Remote MySQL access for your IP address

### 2. Upload Backend Files

1. Create a directory for your backend in your cPanel file manager (e.g., `tally-pos-backend`)
2. Upload all files from the `backend-new` directory to this folder
3. Ensure the [.env](file:///C:/Users/TECHZON-17/Desktop/Tally_Pos/backend-new/.env) file is properly configured with your database credentials

### 3. Install Backend Dependencies

1. Access your cPanel terminal or SSH
2. Navigate to your backend directory:
   ```bash
   cd /path/to/your/tally-pos-backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### 4. Initialize the Database

1. From your backend directory, run:
   ```bash
   node init-cpanel-db.js
   ```
2. Then run:
   ```bash
   node create-tables.js
   ```

### 5. Set up the Frontend

1. Build the frontend for production:
   ```bash
   cd /path/to/your/frontend
   npm run build
   ```
2. Upload the contents of the `dist` folder to your public_html directory or a subdirectory

### 6. Configure API Connection for Production

The frontend is already configured to work with relative paths when deployed to the same domain as the backend. Ensure both frontend and backend are accessible from the same domain.

### 7. Set up Node.js Application in cPanel

1. In cPanel, find "Setup Node.js App" (may be under Software section)
2. Create a new Node.js application:
   - Application root: `/path/to/your/tally-pos-backend`
   - Application URL: `/api` (or your preferred path)
   - Application startup file: `server.js`
3. Click "Create"

### 8. Start the Application

1. After creating the application, click "Run NPM Install" to install dependencies
2. Click "Start App" to start the backend server

### 9. Configure Rewrite Rules (if needed)

If you need to serve the frontend and backend from the same domain, you may need to set up rewrite rules in your [.htaccess](file:///C:/Users/TECHZON-17/Desktop/Tally_Pos/frontend/public/.htaccess) file:

```apache
RewriteEngine On

# Redirect API requests to the Node.js application
RewriteRule ^api/(.*)$ http://localhost:YOUR_NODEJS_PORT/api/$1 [P,L]

# Serve frontend files for all other requests
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [QSA,L]
```

## Testing the Deployment

1. Visit your domain to access the frontend
2. Try logging in with the default credentials (admin/admin123)
3. Navigate to different sections to ensure data is loading correctly
4. Test creating new products, customers, and orders

## Troubleshooting

### Common Issues and Solutions

1. **Database Connection Issues**
   - Verify database credentials in [.env](file:///C:/Users/TECHZON-17/Desktop/Tally_Pos/backend-new/.env) file
   - Ensure Remote MySQL access is enabled for your server's IP
   - Check if your hosting provider requires a specific database host

2. **API Connection Issues**
   - Verify the backend is running
   - Check if the API path is correctly configured
   - Ensure CORS headers are properly set

3. **Frontend Not Loading**
   - Check that all frontend files were uploaded correctly
   - Verify the build process completed without errors
   - Ensure the [.htaccess](file:///C:/Users/TECHZON-17/Desktop/Tally_Pos/frontend/public/.htaccess) file is properly configured

### Contact Your Hosting Provider

If you continue having issues:
1. Confirm Node.js version compatibility
2. Check if there are any firewall restrictions
3. Verify port availability for your Node.js application

## Security Recommendations

1. Change the default admin password immediately after first login
2. Use HTTPS for your deployment
3. Regularly update your dependencies
4. Implement proper authentication and authorization
5. Monitor your application logs for suspicious activity

## Next Steps

Once your application is deployed:
1. Log in with admin/admin123 and change the default password
2. Configure your business settings in the Settings section
3. Add your products and customers
4. Start processing orders