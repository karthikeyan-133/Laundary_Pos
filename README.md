# Laundary_Pos

This is a Point of Sale (POS) system for a laundry business.

## Features
- Product management
- Order processing
- Billing and invoicing
- Customer management
- Reporting

## Technology Stack
- Frontend: React with TypeScript
- Backend: Node.js with Express
- Database: MySQL (can be used with local MySQL, MySQL Workbench, or cPanel hosting)
- Deployment: Vercel

## Project Structure
- `frontend/` - React frontend application
- `backend-new/` - Node.js/Express backend with MySQL database

## Getting Started
1. Clone the repository
2. Install dependencies for both frontend and backend
3. Set up the database (see options below)
4. Configure environment variables
5. Run the development servers

## Database Options

### Option 1: Local MySQL Database
- Install MySQL server locally
- Create database and user
- Update [.env](file://c:/Users/TECHZON-17/Desktop/Tally_Pos/backend-new/.env) file with local database credentials

### Option 2: cPanel Database
- Follow the [cPanel Database Setup Guide](CPANEL_DATABASE_SETUP.md)
- Enable remote MySQL access in cPanel
- Update [.env](file://c:/Users/TECHZON-17/Desktop/Tally_Pos/backend-new/.env) file with cPanel database credentials

## Deployment to Vercel

To deploy the application to Vercel:

1. Push your code to a GitHub repository
2. Connect the repository to Vercel
3. Configure the project settings:
   - Build command: `cd frontend && npm run build`
   - Output directory: `frontend/dist`
   - Install command: `npm install && cd frontend && npm install`
4. Add environment variables in Vercel dashboard if needed

## Troubleshooting
If you encounter database connection issues, refer to the [cPanel Connection Troubleshooting Guide](CPANEL_CONNECTION_TROUBLESHOOTING.md)

If you encounter deployment issues, refer to the [Deployment Verification Guide](DEPLOYMENT_VERIFICATION.md)