const mysql = require('mysql2');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Check if environment variables are loaded
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
  console.error('❌ Environment variables are not loaded properly!');
  process.exit(1);
}

console.log('Connecting to database with the following configuration:');
console.log('Host:', process.env.DB_HOST);
console.log('User:', process.env.DB_USER);
console.log('Database:', process.env.DB_NAME);
console.log('Port:', process.env.DB_PORT || 3306);

// Create a connection to the database
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
});

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the cPanel database:', err);
    return;
  }
  
  console.log('✅ Connected to cPanel MySQL database.');
  
  // Create tables one by one
  const tables = [
    `CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      category VARCHAR(100) NOT NULL,
      sku VARCHAR(50) UNIQUE NOT NULL,
      barcode VARCHAR(50) UNIQUE,
      stock INT NOT NULL DEFAULT 0,
      description TEXT
    )`,
    
    `CREATE TABLE IF NOT EXISTS customers (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      code VARCHAR(50),
      contact_name VARCHAR(255),
      phone VARCHAR(20),
      email VARCHAR(255),
      place VARCHAR(255),
      emirate VARCHAR(100)
    )`,
    
    `CREATE TABLE IF NOT EXISTS settings (
      id INT PRIMARY KEY AUTO_INCREMENT,
      tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 5.00,
      currency VARCHAR(10) NOT NULL DEFAULT 'AED',
      business_name VARCHAR(255) NOT NULL,
      business_address TEXT,
      business_phone VARCHAR(20),
      barcode_scanner_enabled BOOLEAN DEFAULT TRUE
    )`,
    
    `CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(50) PRIMARY KEY,
      customer_id VARCHAR(50) NOT NULL,
      subtotal DECIMAL(10, 2) NOT NULL,
      discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
      tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
      total DECIMAL(10, 2) NOT NULL,
      payment_method ENUM('cash', 'card', 'credit', 'both', 'cod') NOT NULL,
      status ENUM('completed', 'pending', 'cancelled') NOT NULL,
      delivery_status ENUM('pending', 'in-transit', 'delivered'),
      payment_status ENUM('paid', 'unpaid'),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS order_items (
      id VARCHAR(50) PRIMARY KEY,
      order_id VARCHAR(50) NOT NULL,
      product_id VARCHAR(50) NOT NULL,
      quantity INT NOT NULL,
      discount DECIMAL(5, 2) NOT NULL DEFAULT 0,
      subtotal DECIMAL(10, 2) NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )`
  ];
  
  // Insert statements
  const inserts = [
    `INSERT IGNORE INTO settings (tax_rate, currency, business_name, business_address, business_phone, barcode_scanner_enabled)
     VALUES (5.00, 'AED', 'TallyPrime Café', 'Shop 123, Marina Mall, Dubai Marina, Dubai, UAE', '+971 4 123 4567', TRUE)`,
    
    `INSERT IGNORE INTO products (id, name, price, category, sku, barcode, stock, description) VALUES
     ('1', 'Arabica Coffee - Espresso', 15.00, 'Beverages', 'BEV001', 'BEV001', 100, 'Rich, bold espresso shot'),
     ('2', 'Croissant - Plain', 8.00, 'Bakery', 'BAK001', 'BAK001', 25, 'Fresh buttery croissant'),
     ('3', 'Sandwich - Club', 35.00, 'Food', 'FOD001', 'FOD001', 15, 'Turkey, bacon, lettuce, tomato'),
     ('4', 'Latte - Large', 22.00, 'Beverages', 'BEV002', 'BEV002', 50, 'Smooth latte with steamed milk'),
     ('5', 'Muffin - Blueberry', 12.00, 'Bakery', 'BAK002', 'BAK002', 20, 'Fresh baked blueberry muffin'),
     ('6', 'Salad - Caesar', 38.00, 'Food', 'FOD002', 'FOD002', 12, 'Crisp romaine with caesar dressing'),
     ('7', 'Americano - Regular', 18.00, 'Beverages', 'BEV003', 'BEV003', 75, 'Classic black coffee'),
     ('8', 'Bagel - Everything', 10.00, 'Bakery', 'BAK003', 'BAK003', 30, 'Toasted everything bagel'),
     ('9', 'Wrap - Chicken Caesar', 42.00, 'Food', 'FOD003', 'FOD003', 18, 'Grilled chicken caesar wrap'),
     ('10', 'Smoothie - Berry Blast', 28.00, 'Beverages', 'BEV004', 'BEV004', 40, 'Mixed berry smoothie')`,
    
    `INSERT IGNORE INTO customers (id, name, code, contact_name, phone, email, place, emirate) VALUES
     ('1', 'Walk-in Customer', 'WIC001', '', '', '', '', '')`
  ];
  
  // Execute table creation
  let tableIndex = 0;
  
  function createNextTable() {
    if (tableIndex >= tables.length) {
      console.log('✅ All tables created successfully!');
      // Now insert data
      insertData();
      return;
    }
    
    const tableQuery = tables[tableIndex];
    console.log(`Creating table ${tableIndex + 1}/${tables.length}...`);
    
    connection.query(tableQuery, (err, results) => {
      if (err) {
        console.error(`Error creating table ${tableIndex + 1}:`, err);
        connection.end();
        return;
      }
      
      console.log(`✅ Table ${tableIndex + 1} created successfully.`);
      tableIndex++;
      createNextTable();
    });
  }
  
  function insertData() {
    let insertIndex = 0;
    
    function insertNextData() {
      if (insertIndex >= inserts.length) {
        console.log('✅ All sample data inserted successfully!');
        connection.end();
        return;
      }
      
      const insertQuery = inserts[insertIndex];
      console.log(`Inserting data set ${insertIndex + 1}/${inserts.length}...`);
      
      connection.query(insertQuery, (err, results) => {
        if (err) {
          console.error(`Error inserting data set ${insertIndex + 1}:`, err);
          connection.end();
          return;
        }
        
        console.log(`✅ Data set ${insertIndex + 1} inserted successfully.`);
        insertIndex++;
        insertNextData();
      });
    }
    
    insertNextData();
  }
  
  // Start creating tables
  createNextTable();
});