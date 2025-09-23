# Supabase Setup Guide for Tally POS

This guide will help you set up Supabase as the database for your Tally POS system.

## Prerequisites

1. A Supabase account (free at [supabase.com](https://supabase.com/))
2. Node.js installed on your system

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com/) and sign up or log in
2. Click "New Project"
3. Choose an organization or create a new one
4. Enter a name for your project (e.g., "Tally-POS")
5. Select a region closest to you
6. Set a strong database password
7. Click "Create Project"

## Step 2: Get Your Supabase Credentials

1. Once your project is created, go to the "Project Settings" (gear icon)
2. Click on "API" in the left sidebar
3. Copy the following values:
   - Project URL (SUPABASE_URL)
   - anon public key (SUPABASE_KEY)

## Step 3: Configure Your Environment Variables

1. In your project directory, open the `.env` file in the `backend-new` folder
2. Replace the placeholder values with your actual Supabase credentials:

```env
SUPABASE_URL=your-actual-project-url
SUPABASE_KEY=your-actual-anon-key
PORT=3001
NODE_ENV=development
```

## Step 4: Initialize the Database

Run the following command to create all necessary tables and insert initial data:

```bash
npm run init-supabase
```

This will:
- Create all required tables (products, customers, orders, etc.)
- Insert sample products
- Create a default customer ("Walk-in Customer")
- Set up default settings

## Step 5: Test the Connection

Verify that everything is set up correctly:

```bash
npm run test-supabase
```

## Step 6: Start the Server

Once everything is configured, start your server:

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

## Adding Foreign Key Constraints (Optional)

The initialization script creates tables but doesn't set up foreign key constraints due to limitations in the approach used. To add proper relationships:

1. Go to your Supabase dashboard
2. Navigate to "Table Editor"
3. For each table that has foreign keys, you can add them manually:
   - orders.customer_id → customers.id
   - order_items.order_id → orders.id
   - order_items.product_id → products.id
   - returns.order_id → orders.id
   - return_items.return_id → returns.id
   - return_items.product_id → products.id

## Troubleshooting

### Common Issues

1. **"supabaseUrl is required" error**: Make sure your `.env` file has the correct SUPABASE_URL
2. **"Invalid API key" error**: Verify that you're using the "anon" key, not the "service_role" key
3. **Connection timeout**: Check your internet connection and Supabase project status

### Testing Database Queries

You can test database queries directly in the Supabase SQL editor:

1. Go to your Supabase dashboard
2. Click on "SQL Editor" in the left sidebar
3. Run queries like:
   ```sql
   SELECT * FROM products;
   SELECT * FROM customers;
   SELECT * FROM settings;
   ```

## Using with Vercel

When deploying to Vercel, set your environment variables in the Vercel dashboard:

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add:
   - SUPABASE_URL (with your project URL)
   - SUPABASE_KEY (with your anon key)

## Security Notes

- Never commit your `.env` file to version control
- Use the "anon" key for client-side operations
- For sensitive operations, use the "service_role" key only on the server
- Regularly rotate your API keys