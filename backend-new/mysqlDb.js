const mysql = require('mysql2');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables only in local development
// Vercel will provide environment variables directly
const isVercel = !!process.env.VERCEL;
if (!isVercel) {
  const envPath = path.resolve(__dirname, '.env');
  dotenv.config({ path: envPath });
}

console.log('Attempting to connect to MySQL database with the following configuration:');
console.log('Host:', process.env.DB_HOST || 'localhost');
console.log('User:', process.env.DB_USER || 'root');
console.log('Database:', process.env.DB_NAME || 'Pos_system');
console.log('Port:', process.env.DB_PORT || 3306);
console.log('SSL:', process.env.DB_SSL === 'true' ? 'enabled' : 'disabled');
console.log('Running on Vercel:', !!isVercel);

// Check if environment variables are loaded
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
  console.error('❌ Environment variables are not loaded properly!');
  console.log('Please check that your environment variables are set in Vercel dashboard.');
  console.log('Current working directory:', process.cwd());
  if (!isVercel) {
    console.log('Expected .env path:', path.resolve(__dirname, '.env'));
  }
  // Don't exit in Vercel environment as it might cause issues
  if (!isVercel) {
    process.exit(1);
  }
}

// Create a connection pool to the database
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'Pos_system',
  port: process.env.DB_PORT || 3306,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  connectionLimit: 10, // Limit connections to prevent overload
  queueLimit: 0,
  // Add connection timeout
  connectTimeout: 30000, // 30 seconds
  // Add acquire timeout
  acquireTimeout: 30000, // 30 seconds
  // Add timeout for queries
  timeout: 30000, // 30 seconds
  // Handle cPanel specific connection issues
  timezone: '+00:00', // Use UTC timezone
  // Removed invalid options that cause warnings
});

// Get a promise-based connection from the pool
const promisePool = pool.promise();

// Test the connection
async function testConnection() {
  try {
    const connection = await promisePool.getConnection();
    console.log('✅ Successfully connected to the MySQL database.');
    connection.release();
    return true;
  } catch (err) {
    console.error('Error connecting to the MySQL database:', err);
    console.log('\nTroubleshooting steps:');
    console.log('1. Verify your database host in .env file (DB_HOST)');
    console.log('2. Check that your database and user exist');
    console.log('3. Verify your database credentials (username, password)');
    console.log('4. Ensure MySQL server is running');
    console.log('5. For cPanel databases, ensure remote MySQL access is enabled');
    console.log('6. For cPanel databases, ensure your IP is whitelisted');
    console.log('7. Check if your hosting provider requires a specific database host');
    return false;
  }
}

// Run test connection only in local development
if (!isVercel) {
  testConnection();
}

// Export the pool and helper functions
module.exports = {
  pool: promisePool,
  query: async (query, params = []) => {
    try {
      const [rows] = await promisePool.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Database query error:', error);
      // Re-throw the error so it can be handled by the calling function
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
  },
  // Add a retry function for database connections
  retryQuery: async (query, params = [], maxRetries = 3, delay = 2000) => {
    let lastError;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        const [rows] = await promisePool.execute(query, params);
        if (i > 0) {
          console.log(`✅ Database query succeeded after ${i} retry attempts`);
        }
        return rows;
      } catch (error) {
        lastError = error;
        if (i < maxRetries) {
          console.log(`⚠️ Database query failed (attempt ${i + 1}/${maxRetries + 1}):`, error.message);
          console.log(`⏳ Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          // Exponential backoff
          delay *= 2;
        }
      }
    }
    
    console.error('❌ Database query failed after all retry attempts:', lastError);
    throw lastError;
  }
};