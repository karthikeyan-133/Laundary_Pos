# Supabase Setup for Tally POS

This document explains how to set up and use Supabase as the database for your Tally POS application.

## Prerequisites

1. A Supabase account (free tier available at [supabase.com](https://supabase.com))
2. Node.js installed on your system

## Setting up Supabase

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up or log in
2. Click "New Project"
3. Enter a name for your project (e.g., "tally-pos")
4. Select a region closest to you
5. Set a secure password for your database
6. Click "Create New Project"

### 2. Get Your Supabase Credentials

After your project is created:

1. Click on your project to open it
2. In the left sidebar, click "Project Settings" (gear icon)
3. Click "API" in the settings menu
4. Copy your "Project URL" and "anon" key (public key)

### 3. Update Environment Variables

Update your `.env` file in the `backend` directory with your Supabase credentials:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_KEY=your_supabase_anon_key_here

# Server port
PORT=3001
```

### 4. Create Database Tables

In your Supabase dashboard:

1. In the left sidebar, click "Table Editor"
2. Click "New Table" and create the following tables:

#### Products Table
```sql
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  ironRate NUMERIC NOT NULL,
  washAndIronRate NUMERIC NOT NULL,
  dryCleanRate NUMERIC NOT NULL,
  category TEXT,
  barcode TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Customers Table
```sql
CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  place TEXT,
  emirate TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Orders Table
```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES customers(id),
  subtotal NUMERIC NOT NULL,
  discount NUMERIC DEFAULT 0,
  tax NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  payment_method TEXT,
  status TEXT,
  delivery_status TEXT,
  payment_status TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Order Items Table
```sql
CREATE TABLE order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT REFERENCES orders(id),
  product_id TEXT REFERENCES products(id),
  quantity INTEGER NOT NULL,
  discount NUMERIC DEFAULT 0,
  subtotal NUMERIC NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Settings Table
```sql
CREATE TABLE settings (
  id INTEGER PRIMARY KEY,
  tax_rate NUMERIC DEFAULT 5.0,
  currency TEXT DEFAULT 'AED',
  business_name TEXT DEFAULT 'TallyPrime Café',
  business_address TEXT DEFAULT 'Shop 123, Marina Mall, Dubai Marina, Dubai, UAE',
  business_phone TEXT DEFAULT '+971 4 123 4567',
  barcode_scanner_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 5. Insert Default Settings

After creating the settings table, insert the default settings:

```sql
INSERT INTO settings (id, tax_rate, currency, business_name, business_address, business_phone, barcode_scanner_enabled)
VALUES (1, 5.0, 'AED', 'TallyPrime Café', 'Shop 123, Marina Mall, Dubai Marina, Dubai, UAE', '+971 4 123 4567', true);
```

## Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Test the Supabase connection:
   ```bash
   npm run test-connection
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. In a separate terminal, start the frontend:
   ```bash
   cd modern-pos-spark
   npm run dev
   ```

## Available Scripts

- `npm start` - Start the backend server
- `npm run dev` - Start the backend server (same as start)
- `npm run test-connection` - Test the Supabase connection
- `npm run init-supabase` - Initialize the Supabase database (shows SQL commands)

## Troubleshooting

### Connection Issues
- Verify your Supabase URL and key are correct in the `.env` file
- Ensure your Supabase project is not paused
- Check that you have internet connectivity

### Table Creation Issues
- Make sure you're using the SQL editor in Supabase dashboard
- Verify that you're running each CREATE TABLE statement separately
- Check that you have the correct permissions

### Data Not Loading
- Check the browser console for any errors
- Verify that your tables have been created correctly
- Ensure that the default settings record exists in the settings table

## Security Notes

- Never expose your Supabase service role key in client-side code
- The anon key used here is safe for client-side applications
- For production, consider implementing Row Level Security (RLS) in Supabase