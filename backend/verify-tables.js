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
  
  // Verify tables exist and show row counts
  const tables = ['products', 'customers', 'orders', 'order_items', 'settings'];
  
  function checkTable(index) {
    if (index >= tables.length) {
      console.log('✅ All tables verified successfully!');
      connection.end();
      return;
    }
    
    const table = tables[index];
    const query = `SELECT COUNT(*) as count FROM ${table}`;
    
    connection.query(query, (err, results) => {
      if (err) {
        console.error(`Error checking table ${table}:`, err);
        connection.end();
        return;
      }
      
      console.log(`✅ Table '${table}' exists with ${results[0].count} rows`);
      checkTable(index + 1);
    });
  }
  
  // Start checking tables
  checkTable(0);
});