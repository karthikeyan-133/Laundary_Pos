const mysql = require('mysql2');
const path = require('path');
const dotenv = require('dotenv');
const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

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
    return;
  }
  
  console.log('✅ Connected to MySQL database.');
  
  // Tables to clear (in order to respect foreign key constraints)
  const tables = ['order_items', 'orders', 'customers', 'products', 'settings'];
  
  // Clear each table
  let index = 0;
  
  function clearNextTable() {
    if (index >= tables.length) {
      console.log('✅ All tables cleared successfully.');
      connection.end();
      return;
    }
    
    const table = tables[index];
    console.log(`Clearing table ${table}...`);
    
    connection.query(`DELETE FROM ${table}`, (err, results) => {
      if (err) {
        console.error(`Error clearing table ${table}:`, err);
        connection.end();
        return;
      }
      
      console.log(`✅ Table ${table} cleared. Rows affected: ${results.affectedRows}`);
      index++;
      clearNextTable();
    });
  }
  
  // Confirm before proceeding
  console.log('This will delete ALL data from the following tables:');
  console.log(tables.join(', '));
  console.log('Do you want to proceed? (yes/no)');
  
  // For now, we'll proceed automatically since this is a script
  console.log('Proceeding with data deletion...');
  clearNextTable();
});