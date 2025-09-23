/**
 * Database initialization script for cPanel MySQL database
 * Run this after confirming your database connection works
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: './.env' });

console.log('🚀 Initializing cPanel Database');
console.log('==============================');

async function initializeDatabase() {
  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    connectTimeout: 15000
  };

  let connection;
  
  try {
    // Connect without specifying database first
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to MySQL server');
    
    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
    console.log(`✅ Database '${process.env.DB_NAME}' is ready`);
    
    // Switch to the database
    await connection.changeUser({ database: process.env.DB_NAME });
    console.log(`✅ Using database '${process.env.DB_NAME}'`);
    
    // Create tables
    console.log('\n🏗️ Creating tables...');
    
    // Users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'cashier') DEFAULT 'cashier',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');
    
    // Categories table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Categories table created');
    
    // Products table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        barcode VARCHAR(50) UNIQUE,
        name VARCHAR(255) NOT NULL,
        category_id INT,
        price DECIMAL(10, 2) NOT NULL,
        cost DECIMAL(10, 2) DEFAULT 0,
        stock_quantity INT DEFAULT 0,
        min_stock INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )
    `);
    console.log('✅ Products table created');
    
    // Customers table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(100),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Customers table created');
    
    // Orders table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        customer_id INT,
        subtotal DECIMAL(10, 2) NOT NULL,
        tax_amount DECIMAL(10, 2) DEFAULT 0,
        discount_amount DECIMAL(10, 2) DEFAULT 0,
        total_amount DECIMAL(10, 2) NOT NULL,
        amount_paid DECIMAL(10, 2) NOT NULL,
        amount_due DECIMAL(10, 2) DEFAULT 0,
        payment_method ENUM('cash', 'card', 'split') DEFAULT 'cash',
        status ENUM('pending', 'completed', 'cancelled') DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      )
    `);
    console.log('✅ Orders table created');
    
    // Order items table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        unit_price DECIMAL(10, 2) NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);
    console.log('✅ Order items table created');
    
    // Settings table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_name VARCHAR(255) DEFAULT 'My POS',
        tax_rate DECIMAL(5, 2) DEFAULT 0.00,
        currency_symbol VARCHAR(10) DEFAULT '$',
        receipt_footer TEXT DEFAULT 'Thank you for your business!',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Settings table created');
    
    // Insert default settings if not exists
    try {
      await connection.execute(`
        INSERT INTO settings (company_name) 
        VALUES ('My POS') 
        ON DUPLICATE KEY UPDATE company_name=company_name
      `);
      console.log('✅ Default settings inserted');
    } catch (err) {
      // If the above fails, try without specifying column
      await connection.execute(`
        INSERT INTO settings (id) 
        VALUES (1) 
        ON DUPLICATE KEY UPDATE id=id
      `);
      console.log('✅ Settings record ensured');
    }
    
    // Create admin user if not exists
    const [adminUsers] = await connection.execute(
      'SELECT id FROM users WHERE username = ? AND role = ?', 
      ['admin', 'admin']
    );
    
    if (adminUsers.length === 0) {
      // Note: In production, you should hash the password
      await connection.execute(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        ['admin', 'admin123', 'admin'] // Default admin user - change in production!
      );
      console.log('✅ Default admin user created (username: admin, password: admin123)');
      console.log('⚠️ IMPORTANT: Change the default admin password after first login!');
    } else {
      console.log('✅ Admin user already exists');
    }
    
    await connection.end();
    console.log('\n🎉 Database initialization completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Start your server: npm start');
    console.log('2. Login with admin/admin123');
    console.log('3. Change the default password immediately');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error errno:', error.errno);
    
    if (connection) {
      await connection.end();
    }
    
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();