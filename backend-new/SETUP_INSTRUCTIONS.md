# Tally POS System Setup Instructions

## Prerequisites
1. Node.js installed
2. Supabase account and project
3. Supabase project URL and anon key

## Setup Instructions

### 1. Configure Environment Variables
1. Copy `.env.example` to `.env` in the backend directory
2. Replace the placeholder values with your actual Supabase credentials:
   ```
   SUPABASE_URL=your_actual_supabase_project_url
   SUPABASE_KEY=your_actual_supabase_anon_key
   ```

### 2. Initialize Database
1. Go to your Supabase dashboard
2. Open the SQL editor
3. Copy and paste the contents of `supabase-init.sql`
4. Run the script to create all necessary tables

### 3. Run Database Migration (if upgrading from old version)
1. If you're upgrading from an older version with the old database structure:
2. Run the migration script in your Supabase SQL editor:
   - Copy and paste the contents of `supabase-migration.sql`
   - Run the script to update your existing tables

### 4. Start the Backend Server
1. Navigate to the backend directory:
   ```
   cd backend-new
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the server:
   ```
   npm start
   ```
4. The server will run on port 3003 by default

### 5. Start the Frontend
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. The frontend will run on port 3000 by default and connect to the backend on port 3003

## Troubleshooting

### "Updating datas not visible in product selection page"
This issue is typically caused by:
1. Port configuration mismatch between frontend and backend
2. Database not properly initialized or migrated
3. Supabase credentials not configured correctly

### Solution Steps:
1. Verify that the backend is running on port 3003
2. Check that the frontend is configured to connect to port 3003 (this has been fixed in the latest code)
3. Ensure all database tables are created with the correct structure
4. Run the migration scripts if upgrading from an older version
5. Verify that your Supabase credentials are correct in the `.env` file

### Testing the Connection
1. Once both frontend and backend are running:
2. Open your browser to `http://localhost:3000`
3. Check the browser console for any connection errors
4. You can also test the API directly by visiting `http://localhost:3003/health`

## Database Structure
The system now uses service-specific pricing:
- `ironRate`: Price for iron service
- `washAndIronRate`: Price for wash and iron service
- `dryCleanRate`: Price for dry clean service

All prices are stored as NUMERIC(10,2) for precision.