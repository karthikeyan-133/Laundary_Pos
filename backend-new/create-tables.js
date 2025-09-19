const { query } = require('./mysqlDb');

// This script will create the necessary tables in the MySQL database

console.log('Creating tables in MySQL database...');

// Create tables one by one
const tables = [
  `CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    ironRate DECIMAL(10, 2) NOT NULL,
    washAndIronRate DECIMAL(10, 2) NOT NULL,
    dryCleanRate DECIMAL(10, 2) NOT NULL,
    category VARCHAR(255),
    barcode VARCHAR(255) UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  
  `CREATE TABLE IF NOT EXISTS customers (
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
  )`,
  
  `CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY,
    tax_rate DECIMAL(5, 2) DEFAULT 5.00,
    currency VARCHAR(10) DEFAULT 'AED',
    business_name VARCHAR(255) DEFAULT 'TallyPrime Café',
    business_address TEXT DEFAULT 'Shop 123, Marina Mall, Dubai Marina, Dubai, UAE',
    business_phone VARCHAR(255) DEFAULT '+971 4 123 4567',
    barcode_scanner_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  
  `CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(255) PRIMARY KEY,
    customer_id VARCHAR(255),
    subtotal DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0,
    tax DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(255),
    cash_amount DECIMAL(10, 2),
    card_amount DECIMAL(10, 2),
    status VARCHAR(255),
    delivery_status VARCHAR(255),
    payment_status VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  
  `CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(255) PRIMARY KEY,
    order_id VARCHAR(255),
    product_id VARCHAR(255),
    quantity INT NOT NULL,
    discount DECIMAL(5, 2) DEFAULT 0,
    subtotal DECIMAL(10, 2) NOT NULL,
    service VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  
  `CREATE TABLE IF NOT EXISTS returns (
    id VARCHAR(255) PRIMARY KEY,
    order_id VARCHAR(255),
    reason TEXT,
    refund_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  
  `CREATE TABLE IF NOT EXISTS return_items (
    id VARCHAR(255) PRIMARY KEY,
    return_id VARCHAR(255),
    product_id VARCHAR(255),
    quantity INT NOT NULL,
    refund_amount DECIMAL(10, 2) NOT NULL
  )`
];

// Add foreign key constraints
const foreignKeys = [
  `ALTER TABLE orders ADD CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL`,
  `ALTER TABLE order_items ADD CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE`,
  `ALTER TABLE order_items ADD CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL`,
  `ALTER TABLE returns ADD CONSTRAINT fk_returns_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL`,
  `ALTER TABLE return_items ADD CONSTRAINT fk_return_items_return FOREIGN KEY (return_id) REFERENCES returns(id) ON DELETE CASCADE`,
  `ALTER TABLE return_items ADD CONSTRAINT fk_return_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL`,
  `ALTER TABLE order_items ADD CONSTRAINT service_check CHECK (service IN ('iron', 'washAndIron', 'dryClean'))`
];

// Insert statements
const inserts = [
  `INSERT INTO settings (id, tax_rate, currency, business_name, business_address, business_phone, barcode_scanner_enabled)
   VALUES (1, 5.00, 'AED', 'TallyPrime Café', 'Shop 123, Marina Mall, Dubai Marina, Dubai, UAE', '+971 4 123 4567', TRUE)
   ON DUPLICATE KEY UPDATE id=id`,
  
  `INSERT INTO products (id, name, ironRate, washAndIronRate, dryCleanRate, category, barcode, description) VALUES
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
   ON DUPLICATE KEY UPDATE id=id`,
  
  `INSERT INTO customers (id, name, code, contact_name, phone, email, place, emirate) VALUES
   ('1', 'Walk-in Customer', 'WIC001', '', '', '', '', '')
   ON DUPLICATE KEY UPDATE id=id`
];

async function createTables() {
  try {
    console.log('Creating tables...');
    
    // Create tables
    for (let i = 0; i < tables.length; i++) {
      console.log(`Creating table ${i + 1}/${tables.length}...`);
      await query(tables[i]);
      console.log(`✅ Table ${i + 1} created successfully.`);
    }
    
    // Add foreign key constraints
    console.log('Adding foreign key constraints...');
    for (let i = 0; i < foreignKeys.length; i++) {
      try {
        console.log(`Adding foreign key ${i + 1}/${foreignKeys.length}...`);
        await query(foreignKeys[i]);
        console.log(`✅ Foreign key ${i + 1} added successfully.`);
      } catch (err) {
        // Foreign key might already exist, continue
        console.log(`⚠️ Foreign key ${i + 1} may already exist or has an issue:`, err.message);
      }
    }
    
    // Insert sample data
    console.log('Inserting sample data...');
    for (let i = 0; i < inserts.length; i++) {
      console.log(`Inserting data set ${i + 1}/${inserts.length}...`);
      await query(inserts[i]);
      console.log(`✅ Data set ${i + 1} inserted successfully.`);
    }
    
    console.log('✅ All tables created and sample data inserted successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating tables:', err);
    process.exit(1);
  }
}

// Run the table creation
createTables();