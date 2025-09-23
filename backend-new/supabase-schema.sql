-- Complete Database Schema for Tally POS System (Supabase Version)
-- This file contains all tables and relationships for the POS system

-- Note: Extensions are typically enabled through the Supabase dashboard
-- Uncomment the following line if you need to enable the UUID extension via SQL
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: products
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  ironRate NUMERIC NOT NULL,
  washAndIronRate NUMERIC NOT NULL,
  dryCleanRate NUMERIC NOT NULL,
  category TEXT,
  barcode TEXT UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: customers
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  place TEXT,
  emirate TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: settings (includes admin credentials)
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY,
  tax_rate NUMERIC,
  currency TEXT,
  business_name TEXT,
  business_address TEXT,
  business_phone TEXT,
  barcode_scanner_enabled BOOLEAN,
  /* Admin credentials */
  admin_username TEXT,
  admin_email TEXT,
  admin_password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to settings table if they don't exist
ALTER TABLE settings ADD COLUMN IF NOT EXISTS admin_username TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS admin_email TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS admin_password_hash TEXT;

-- Table: orders
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_id TEXT,
  subtotal NUMERIC NOT NULL,
  discount NUMERIC DEFAULT 0,
  tax NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  payment_method TEXT,
  cash_amount NUMERIC,
  card_amount NUMERIC,
  status TEXT,
  delivery_status TEXT,
  payment_status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: order_items
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT,
  product_id TEXT,
  quantity INTEGER NOT NULL,
  discount NUMERIC DEFAULT 0,
  subtotal NUMERIC NOT NULL,
  service TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: returns
CREATE TABLE IF NOT EXISTS returns (
  id TEXT PRIMARY KEY,
  order_id TEXT,
  reason TEXT,
  refund_amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: return_items
CREATE TABLE IF NOT EXISTS return_items (
  id TEXT PRIMARY KEY,
  return_id TEXT,
  product_id TEXT,
  quantity INTEGER NOT NULL,
  refund_amount NUMERIC NOT NULL
);

-- Table: id_sequences
CREATE TABLE IF NOT EXISTS id_sequences (
  prefix TEXT PRIMARY KEY,
  counter_value INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add check constraint for service types
-- This constraint ensures service values are one of the allowed options
ALTER TABLE order_items ADD CONSTRAINT service_check CHECK (service IN ('iron', 'washAndIron', 'dryClean'));

-- Note on Foreign Key Constraints:
-- Foreign key constraints should be added via the Supabase dashboard or migrations
-- Here are the relationships for reference:
-- orders.customer_id → customers.id
-- order_items.order_id → orders.id
-- order_items.product_id → products.id
-- returns.order_id → orders.id
-- return_items.return_id → returns.id
-- return_items.product_id → products.id