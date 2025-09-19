-- MySQL Database Initialization Script for Tally POS System
-- This script creates all the necessary tables for the Tally POS system

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS Pos_system;
USE Pos_system;

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS return_items;
DROP TABLE IF EXISTS returns;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS settings;

-- Create products table
CREATE TABLE products (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  ironRate DECIMAL(10,2) NOT NULL,
  washAndIronRate DECIMAL(10,2) NOT NULL,
  dryCleanRate DECIMAL(10,2) NOT NULL,
  category VARCHAR(255),
  barcode VARCHAR(255) UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create customers table
CREATE TABLE customers (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(255),
  contact_name VARCHAR(255),
  phone VARCHAR(255),
  email VARCHAR(255),
  place VARCHAR(255),
  emirate VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE orders (
  id VARCHAR(255) PRIMARY KEY,
  customer_id VARCHAR(255),
  subtotal DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(255),
  cash_amount DECIMAL(10,2),
  card_amount DECIMAL(10,2),
  status VARCHAR(255),
  delivery_status VARCHAR(255),
  payment_status VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- Create order_items table
CREATE TABLE order_items (
  id VARCHAR(255) PRIMARY KEY,
  order_id VARCHAR(255),
  product_id VARCHAR(255),
  quantity INT NOT NULL,
  discount DECIMAL(5,2) DEFAULT 0,
  subtotal DECIMAL(10,2) NOT NULL,
  service VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  CONSTRAINT service_check CHECK (service IN ('iron', 'washAndIron', 'dryClean'))
);

-- Create settings table
CREATE TABLE settings (
  id INT PRIMARY KEY,
  tax_rate DECIMAL(5,2) DEFAULT 5.00,
  currency VARCHAR(10) DEFAULT 'AED',
  business_name VARCHAR(255) DEFAULT 'TallyPrime Café',
  business_address TEXT DEFAULT 'Shop 123, Marina Mall, Dubai Marina, Dubai, UAE',
  business_phone VARCHAR(255) DEFAULT '+971 4 123 4567',
  barcode_scanner_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create returns table
CREATE TABLE returns (
  id VARCHAR(255) PRIMARY KEY,
  order_id VARCHAR(255),
  reason TEXT,
  refund_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

-- Create return_items table
CREATE TABLE return_items (
  id VARCHAR(255) PRIMARY KEY,
  return_id VARCHAR(255),
  product_id VARCHAR(255),
  quantity INT NOT NULL,
  refund_amount DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (return_id) REFERENCES returns(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Insert default settings
INSERT INTO settings (id, tax_rate, currency, business_name, business_address, business_phone, barcode_scanner_enabled)
VALUES (1, 5.00, 'AED', 'TallyPrime Café', 'Shop 123, Marina Mall, Dubai Marina, Dubai, UAE', '+971 4 123 4567', TRUE)
ON DUPLICATE KEY UPDATE id=id;

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
ON DUPLICATE KEY UPDATE id=id;

-- Insert sample customer
INSERT INTO customers (id, name, code, contact_name, phone, email, place, emirate) VALUES
('1', 'Walk-in Customer', 'WIC001', '', '', '', '', '')
ON DUPLICATE KEY UPDATE id=id;

-- Show tables to confirm creation
SHOW TABLES;