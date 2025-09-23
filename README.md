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
- Database: Supabase (migrated from MySQL)
- Deployment: Vercel

## Project Structure
- `frontend/` - React frontend application
- `backend-new/` - Node.js/Express backend with Supabase database

## Getting Started
1. Clone the repository
2. Install dependencies for both frontend and backend
3. Set up Supabase database (see instructions below)
4. Configure environment variables
5. Run the development servers

## Database Options

### Option 1: Supabase Database (Recommended)
- Follow the [Supabase Setup Guide](backend-new/SUPABASE_SETUP.md)
- Create a free Supabase account and project
- Update [.env](file://c:/Users/TECHZON-17/Desktop/Tally_Pos/backend-new/.env) file with Supabase credentials
- Initialize the database with `npm run init-supabase`

### Option 2: Local MySQL Database (Legacy)
- Install MySQL server locally
- Create database and user
- Update [.env](file://c:/Users/TECHZON-17/Desktop/Tally_Pos/backend-new/.env) file with local database credentials

### Option 3: cPanel Database (Legacy)
- Follow the [cPanel Database Setup Guide](CPANEL_DATABASE_SETUP.md)
- Enable remote MySQL access in cPanel
- Update [.env](file://c:/Users/TECHZON-17/Desktop/Tally_Pos/backend-new/.env) file with cPanel database credentials

## Troubleshooting
If you encounter database connection issues:
- For Supabase: Check your credentials and [Supabase Setup Guide](backend-new/SUPABASE_SETUP.md)
- For cPanel: Refer to the [cPanel Connection Troubleshooting Guide](CPANEL_CONNECTION_TROUBLESHOOTING.md)