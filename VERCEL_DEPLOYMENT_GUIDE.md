# Vercel Deployment Guide for Tally POS with Supabase

This guide will help you deploy your Tally POS application to Vercel with Supabase as the database backend.

## Prerequisites

1. A Vercel account (free at [vercel.com](https://vercel.com))
2. A Supabase account (free at [supabase.com](https://supabase.com))
3. Node.js installed locally
4. Git installed locally

## Step 1: Set up Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your:
   - Project URL (e.g., `https://your-project.supabase.co`)
   - Project API Key (anon key, found in Settings > API)

## Step 2: Create Database Tables in Supabase

In your Supabase project, go to the SQL Editor and run the following queries to create the required tables:

### Products Table
```sql
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  category TEXT,
  sku TEXT UNIQUE,
  barcode TEXT,
  stock INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Customers Table
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

### Orders Table
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

### Order Items Table
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

### Settings Table
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

### Insert Default Settings
```sql
INSERT INTO settings (id, tax_rate, currency, business_name, business_address, business_phone, barcode_scanner_enabled)
VALUES (1, 5.0, 'AED', 'TallyPrime Café', 'Shop 123, Marina Mall, Dubai Marina, Dubai, UAE', '+971 4 123 4567', true);
```

## Step 3: Configure Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Create a new project or select an existing one
3. In the project settings, go to "Environment Variables"
4. Add the following environment variables:

| Variable Name | Value | Description |
|---------------|-------|-------------|
| SUPABASE_URL | `https://your-project.supabase.co` | Your Supabase project URL |
| SUPABASE_KEY | `your-anon-key` | Your Supabase anon key |
| PORT | `3001` | Port for the backend server |

## Step 4: Deploy to Vercel

### Option 1: Deploy using Git (Recommended)

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Connect your repository to Vercel
3. Configure the build settings:
   - Build Command: `npm run build`
   - Output Directory: `modern-pos-spark/dist`
   - Install Command: `npm install`

### Option 2: Deploy using Vercel CLI

1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```

2. Navigate to your project root directory:
   ```bash
   cd c:\Users\TECHZON-17\Desktop\Tally_Pos
   ```

3. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

## Step 5: Configure CORS (if needed)

If you encounter CORS issues, update the CORS configuration in your [backend/server.js](file:///c%3A/Users/TECHZON-17/Desktop/Tally_Pos/backend/server.js) file to include your Vercel deployment URL:

```javascript
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost for development
    if (origin.indexOf('localhost') !== -1 || origin.indexOf('127.0.0.1') !== -1) {
      return callback(null, true);
    }
    
    // Allow Vercel deployments
    if (origin.indexOf('.vercel.app') !== -1) {
      return callback(null, true);
    }
    
    // Add your production domain here when you have one
    // if (origin === 'https://your-production-domain.com') {
    //   return callback(null, true);
    // }
    
    // For now, allow all origins in development
    return callback(null, true);
  },
  credentials: true
}));
```

## Step 6: Test Your Deployment

1. Visit your frontend URL (provided by Vercel)
2. Test API endpoints by visiting `/api/products`, `/api/customers`, etc.
3. Verify that data is being stored in your Supabase database

## Troubleshooting

### Common Issues:

1. **Environment Variables Not Loading**: Make sure you've added the environment variables in the Vercel dashboard, not just in your local `.env` file.

2. **CORS Errors**: Ensure your CORS configuration allows requests from your Vercel deployment domain.

3. **Database Connection Issues**: Verify that your Supabase URL and API key are correct and that your database tables exist.

4. **API Routes Not Working**: Make sure your [vercel.json](file:///c%3A/Users/TECHZON-17/Desktop/Tally_Pos/vercel.json) file is correctly configured to route API requests to your backend.

### Checking Your Deployment:

1. Check Vercel logs for any build errors
2. Check the backend logs for database connection issues
3. Test API endpoints directly in your browser or with a tool like Postman

## Additional Notes

- The application is configured to work with both local development and Vercel deployment
- The frontend automatically detects if it's running on Vercel and adjusts API calls accordingly
- Database operations use the Supabase JavaScript client directly rather than SQL queries

For more information about Supabase, visit [supabase.com/docs](https://supabase.com/docs)
For more information about Vercel, visit [vercel.com/docs](https://vercel.com/docs)