const mysql = require('mysql2');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

console.log('Attempting to connect to MySQL database with the following configuration:');
console.log('Host:', process.env.DB_HOST || 'localhost');
console.log('User:', process.env.DB_USER || 'root');
console.log('Database:', process.env.DB_NAME || 'Pos_system');
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

// Create a connection pool to the database
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'Pos_system',
  port: process.env.DB_PORT || 3306,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  connectTimeout: 30000, // 30 seconds timeout
  connectionLimit: 10, // Limit connections to prevent overload
  queueLimit: 0
});

// Get a promise-based connection from the pool
const promisePool = pool.promise();

// Test the connection
async function testConnection() {
  try {
    const connection = await promisePool.getConnection();
    console.log('✅ Successfully connected to the MySQL database.');
    connection.release();
  } catch (err) {
    console.error('Error connecting to the MySQL database:', err);
    console.log('\nTroubleshooting steps:');
    console.log('1. Verify your database host in .env file (DB_HOST)');
    console.log('2. Check that your database and user exist');
    console.log('3. Verify your database credentials (username, password)');
    console.log('4. Ensure MySQL server is running');
  }
}

// Run test connection
testConnection();

// Export the pool and helper functions
module.exports = {
  pool: promisePool,
  query: async (query, params = []) => {
    try {
      const [rows] = await promisePool.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },
  transaction: async (callback) => {
    const connection = await promisePool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
};