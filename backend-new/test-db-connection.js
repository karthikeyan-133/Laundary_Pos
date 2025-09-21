// Simple script to test database connection
const { query } = require('./mysqlDb');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection with a simple query
    const result = await query('SELECT 1 as connected');
    
    if (result.length > 0 && result[0].connected === 1) {
      console.log('✅ Database connection successful!');
      
      // Test if required tables exist
      const tables = [
        'products', 
        'customers', 
        'orders', 
        'order_items', 
        'settings', 
        'returns', 
        'return_items'
      ];
      
      console.log('Checking if required tables exist...');
      
      for (const table of tables) {
        try {
          const tableCheck = await query(`SHOW TABLES LIKE '${table}'`);
          if (tableCheck.length > 0) {
            console.log(`✅ Table '${table}' exists`);
          } else {
            console.log(`❌ Table '${table}' does not exist`);
          }
        } catch (err) {
          console.log(`❌ Error checking table '${table}':`, err.message);
        }
      }
      
      // Test sample data
      try {
        const products = await query('SELECT COUNT(*) as count FROM products');
        console.log(`Found ${products[0].count} products in the database`);
        
        const customers = await query('SELECT COUNT(*) as count FROM customers');
        console.log(`Found ${customers[0].count} customers in the database`);
        
        const orders = await query('SELECT COUNT(*) as count FROM orders');
        console.log(`Found ${orders[0].count} orders in the database`);
      } catch (err) {
        console.log('Error fetching sample data:', err.message);
      }
      
    } else {
      console.log('❌ Database connection failed');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  }
}

testConnection();