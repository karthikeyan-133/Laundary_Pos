-- Tally POS System - Minimal Table Creation Script
-- Run each statement one at a time in MySQL Workbench

-- 1. First, make sure you're connected to MySQL and create/select the database
-- Run these two lines separately:
-- CREATE DATABASE IF NOT EXISTS Pos_system;
-- USE Pos_system;

-- 2. Create tables one by one - run each CREATE TABLE statement separately:

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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE returns (
  id VARCHAR(255) PRIMARY KEY,
  order_id VARCHAR(255),
  reason TEXT,
  refund_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
  id VARCHAR(255) PRIMARY KEY,
  order_id VARCHAR(255),
  product_id VARCHAR(255),
  quantity INT NOT NULL,
  discount DECIMAL(5,2) DEFAULT 0,
  subtotal DECIMAL(10,2) NOT NULL,
  service VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE return_items (
  id VARCHAR(255) PRIMARY KEY,
  return_id VARCHAR(255),
  product_id VARCHAR(255),
  quantity INT NOT NULL,
  refund_amount DECIMAL(10,2) NOT NULL
);

-- 3. Verify tables were created
-- SHOW TABLES;