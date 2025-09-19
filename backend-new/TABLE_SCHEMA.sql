-- Tally POS System - Table Creation Schema
-- This file contains the database creation, selection, and table creation statements

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS Pos_system
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Use the database
USE Pos_system;

-- Products table
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

-- Customers table
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

-- Settings table
CREATE TABLE settings (
  id INT PRIMARY KEY,
  tax_rate DECIMAL(5,2) DEFAULT 5.00,
  currency VARCHAR(10) DEFAULT 'AED',
  business_name VARCHAR(255) DEFAULT 'TallyPrime Café',
  business_address TEXT,
  business_phone VARCHAR(255) DEFAULT '+971 4 123 4567',
  barcode_scanner_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Orders table
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

-- Returns table
CREATE TABLE returns (
  id VARCHAR(255) PRIMARY KEY,
  order_id VARCHAR(255),
  reason TEXT,
  refund_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

-- Order Items table
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

-- Return Items table
CREATE TABLE return_items (
  id VARCHAR(255) PRIMARY KEY,
  return_id VARCHAR(255),
  product_id VARCHAR(255),
  quantity INT NOT NULL,
  refund_amount DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (return_id) REFERENCES returns(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);