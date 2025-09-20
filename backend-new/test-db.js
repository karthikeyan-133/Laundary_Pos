const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

async function testDatabase() {
  let connection;
  
  try {
    console.log('Testing database connection with config:');
    console.log('Host:', process.env.DB_HOST || 'localhost');
    console.log('User:', process.env.DB_USER || 'root');
    console.log('Database:', process.env.DB_NAME || 'Pos_system');
    console.log('Port:', process.env.DB_PORT || 3306);
    
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'Pos_system',
      port: process.env.DB_PORT || 3306,
    });
    
    console.log('✅ Successfully connected to the MySQL database.');
    
    // Check if required tables exist
    const [tables] = await connection.execute("SHOW TABLES");
    console.log('Available tables:', tables);
    
    // Check specific tables
    const [returnsTable] = await connection.execute("SHOW TABLES LIKE 'returns'");
    const [returnItemsTable] = await connection.execute("SHOW TABLES LIKE 'return_items'");
    const [productsTable] = await connection.execute("SHOW TABLES LIKE 'products'");
    const [ordersTable] = await connection.execute("SHOW TABLES LIKE 'orders'");
    const [orderItemsTable] = await connection.execute("SHOW TABLES LIKE 'order_items'");
    
    console.log('Returns table exists:', returnsTable.length > 0);
    console.log('Return items table exists:', returnItemsTable.length > 0);
    console.log('Products table exists:', productsTable.length > 0);
    console.log('Orders table exists:', ordersTable.length > 0);
    console.log('Order items table exists:', orderItemsTable.length > 0);
    
    if (returnsTable.length > 0) {
      // Get table structure
      const [returnsStructure] = await connection.execute("DESCRIBE `returns`");
      console.log('Returns table structure:', returnsStructure);
    }
    
    if (returnItemsTable.length > 0) {
      // Get table structure
      const [returnItemsStructure] = await connection.execute("DESCRIBE return_items");
      console.log('Return items table structure:', returnItemsStructure);
    }
    
    if (productsTable.length > 0) {
      // Get table structure
      const [productsStructure] = await connection.execute("DESCRIBE products");
      console.log('Products table structure:', productsStructure);
      
      // Get sample products
      const [products] = await connection.execute("SELECT * FROM products LIMIT 5");
      console.log('Sample products data:', products);
    }
    
    if (ordersTable.length > 0) {
      // Get table structure
      const [ordersStructure] = await connection.execute("DESCRIBE orders");
      console.log('Orders table structure:', ordersStructure);
      
      // Get sample orders
      const [orders] = await connection.execute("SELECT * FROM orders LIMIT 3");
      console.log('Sample orders data:', orders);
    }
    
    if (orderItemsTable.length > 0) {
      // Get table structure
      const [orderItemsStructure] = await connection.execute("DESCRIBE order_items");
      console.log('Order items table structure:', orderItemsStructure);
      
      // Get sample order items
      const [orderItems] = await connection.execute("SELECT * FROM order_items LIMIT 5");
      console.log('Sample order items data:', orderItems);
    }
    
    // Test a simple query
    if (returnsTable.length > 0) {
      const [returns] = await connection.execute("SELECT * FROM `returns` LIMIT 5");
      console.log('Sample returns data:', returns);
    }
    
    if (returnItemsTable.length > 0) {
      const [items] = await connection.execute("SELECT * FROM return_items LIMIT 5");
      console.log('Sample return items data:', items);
    }
    
  } catch (err) {
    console.error('Database test error:', err);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testDatabase();