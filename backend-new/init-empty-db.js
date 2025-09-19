const mysql = require('mysql2');
const path = require('path');
const dotenv = require('dotenv');
const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });
const fs = require('fs');

console.log('Attempting to connect to database with the following configuration:');
console.log('Host:', process.env.DB_HOST);
console.log('User:', process.env.DB_USER);
console.log('Database:', process.env.DB_NAME);
console.log('Port:', process.env.DB_PORT || 3306);
console.log('Env file path:', envPath);

// Check if environment variables are loaded
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
  console.error('❌ Environment variables are not loaded properly!');
  console.log('Please check that your .env file exists in the backend directory with the correct values.');
  console.log('Current working directory:', process.cwd());
  console.log('Expected .env path:', envPath);
  process.exit(1);
}

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
    console.error('Error connecting to the database:', err);
    console.log('\nTroubleshooting steps:');
    console.log('1. Verify your database host in .env file (DB_HOST)');
    console.log('   Common values: localhost, 127.0.0.1, or a specific host from your provider');
    console.log('2. Check that your database and user exist');
    console.log('3. Verify your database credentials (username, password)');
    return;
  }
  
  console.log('✅ Connected to MySQL database.');
  
  // Create tables without sample data
  const tableStatements = [
    `CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      ironRate DECIMAL(10, 2) NOT NULL,
      washAndIronRate DECIMAL(10, 2) NOT NULL,
      dryCleanRate DECIMAL(10, 2) NOT NULL,
      category VARCHAR(100) NOT NULL,
      barcode VARCHAR(50) UNIQUE,
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
    )`,
    
    `CREATE TABLE IF NOT EXISTS settings (
      id INT PRIMARY KEY AUTO_INCREMENT,
      tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 5.00,
      currency VARCHAR(10) NOT NULL DEFAULT 'AED',
      business_name VARCHAR(255) NOT NULL,
      business_address TEXT,
      business_phone VARCHAR(20),
      barcode_scanner_enabled BOOLEAN DEFAULT TRUE
    )`
  ];
  
  // Insert only the default settings without sample data
  const insertStatements = [
    `INSERT IGNORE INTO settings (tax_rate, currency, business_name, business_address, business_phone, barcode_scanner_enabled)
     VALUES (5.00, 'AED', 'TallyPrime Café', 'Shop 123, Marina Mall, Dubai Marina, Dubai, UAE', '+971 4 123 4567', TRUE)`
  ];
  
  console.log(`Found ${tableStatements.length} table creation statements and ${insertStatements.length} insert statements.`);
  
  // Execute table creation statements
  let tableIndex = 0;
  
  function createNextTable() {
    if (tableIndex >= tableStatements.length) {
      console.log('✅ All database tables created successfully.');
      // Now insert default settings
      insertDefaultSettings();
      return;
    }
    
    const statement = tableStatements[tableIndex];
    console.log(`Creating table ${tableIndex + 1}/${tableStatements.length}...`);
    
    connection.query(statement, (err, results) => {
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
  
  // Insert default settings
  function insertDefaultSettings() {
    let insertIndex = 0;
    
    function insertNextStatement() {
      if (insertIndex >= insertStatements.length) {
        console.log('✅ Default settings inserted successfully.');
        console.log('✅ Database initialized with empty tables and default settings.');
        connection.end();
        return;
      }
      
      const statement = insertStatements[insertIndex];
      console.log(`Inserting default data ${insertIndex + 1}/${insertStatements.length}...`);
      
      connection.query(statement, (err, results) => {
        if (err) {
          console.error(`Error inserting default data ${insertIndex + 1}:`, err);
          connection.end();
          return;
        }
        
        console.log(`✅ Default data ${insertIndex + 1} inserted successfully.`);
        insertIndex++;
        insertNextStatement();
      });
    }
    
    insertNextStatement();
  }
  
  // Start creating tables
  createNextTable();
});