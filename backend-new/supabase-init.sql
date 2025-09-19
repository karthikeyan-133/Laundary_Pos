-- Supabase Initialization Script
-- This script creates all the necessary tables for the Tally POS system

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  ironRate NUMERIC(10,2) NOT NULL,
  washAndIronRate NUMERIC(10,2) NOT NULL,
  dryCleanRate NUMERIC(10,2) NOT NULL,
  category TEXT,
  barcode TEXT UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
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

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES customers(id),
  subtotal NUMERIC(10,2) NOT NULL,
  discount NUMERIC(10,2) DEFAULT 0,
  tax NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  payment_method TEXT,
  cash_amount NUMERIC(10,2),
  card_amount NUMERIC(10,2),
  status TEXT,
  delivery_status TEXT,
  payment_status TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id),
  quantity INTEGER NOT NULL,
  discount NUMERIC(5,2) DEFAULT 0,
  subtotal NUMERIC(10,2) NOT NULL,
  service TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT service_check CHECK (service IN ('iron', 'washAndIron', 'dryClean'))
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY,
  tax_rate NUMERIC(5,2) DEFAULT 5.00,
  currency TEXT DEFAULT 'AED',
  business_name TEXT DEFAULT 'TallyPrime Café',
  business_address TEXT DEFAULT 'Shop 123, Marina Mall, Dubai Marina, Dubai, UAE',
  business_phone TEXT DEFAULT '+971 4 123 4567',
  barcode_scanner_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create returns table
CREATE TABLE IF NOT EXISTS returns (
  id TEXT PRIMARY KEY,
  order_id TEXT REFERENCES orders(id),
  reason TEXT,
  refund_amount NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create return_items table
CREATE TABLE IF NOT EXISTS return_items (
  id TEXT PRIMARY KEY,
  return_id TEXT REFERENCES returns(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id),
  quantity INTEGER NOT NULL,
  refund_amount NUMERIC(10,2) NOT NULL
);

-- Insert default settings
INSERT INTO settings (id, tax_rate, currency, business_name, business_address, business_phone, barcode_scanner_enabled)
VALUES (1, 5.00, 'AED', 'TallyPrime Café', 'Shop 123, Marina Mall, Dubai Marina, Dubai, UAE', '+971 4 123 4567', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Insert sample products (updated for laundry app)
INSERT INTO products (id, name, ironRate, washAndIronRate, dryCleanRate, category, barcode, description) VALUES
('1', 'Shirt', 5.00, 15.00, 25.00, 'Clothing', 'CL001', 'Cotton shirt'),
('2', 'Pant', 7.00, 20.00, 35.00, 'Clothing', 'CL002', 'Formal pant'),
('3', 'Jacket', 10.00, 25.00, 50.00, 'Clothing', 'CL003', 'Winter jacket'),
('4', 'Dress', 8.00, 22.00, 40.00, 'Clothing', 'CL004', 'Evening dress'),
('5', 'Suit', 15.00, 35.00, 75.00, 'Clothing', 'CL005', 'Formal suit'),
('6', 'Bed Sheet', 12.00, 30.00, 45.00, 'Household', 'HH001', 'Queen size bed sheet'),
('7', 'Towel', 3.00, 8.00, 15.00, 'Household', 'HH002', 'Cotton towel'),
('8', 'Curtain', 20.00, 50.00, 80.00, 'Household', 'HH003', 'Living room curtain'),
('9', 'Carpet', 25.00, 60.00, 100.00, 'Household', 'HH004', 'Small carpet'),
('10', 'Saree', 10.00, 30.00, 60.00, 'Clothing', 'CL006', 'Silk saree')
ON CONFLICT (id) DO NOTHING;

-- Insert sample customer
INSERT INTO customers (id, name, code, contact_name, phone, email, place, emirate) VALUES
('1', 'Walk-in Customer', 'WIC001', '', '', '', '', '')
ON CONFLICT (id) DO NOTHING;