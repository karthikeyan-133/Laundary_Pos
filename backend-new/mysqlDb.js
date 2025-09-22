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
console.log('Host:', process.env.DB_HOST || '190.92.174.102'); // Default to IPv4 address
console.log('User:', process.env.DB_USER || 'root');
console.log('Database:', process.env.DB_NAME || 'Pos_system');
console.log('Port:', process.env.DB_PORT || 3306);
console.log('SSL:', process.env.DB_SSL === 'true' ? 'enabled' : 'disabled');
console.log('Force IPv4:', process.env.DB_FORCE_IPV4 === 'true' ? 'enabled' : 'disabled');
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

// Add DNS resolution logging
const dns = require('dns');

// Force IPv4 if requested
if (process.env.DB_FORCE_IPV4 === 'true') {
  console.log('Forcing IPv4 resolution...');
  dns.setDefaultResultOrder('ipv4first');
}

dns.lookup(process.env.DB_HOST || 'localhost', (err, address, family) => {
  if (err) {
    console.error('❌ DNS lookup failed for DB_HOST:', err);
  } else {
    console.log('DNS lookup result for DB_HOST:', { address, family });
  }
});

// Create a connection pool to the database
const pool = mysql.createPool({
  host: process.env.DB_HOST || '190.92.174.102', // Default to IPv4 address
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'Pos_system',
  port: process.env.DB_PORT || 3306,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 2, // Reduced to 2
  queueLimit: 0,
  // Add connection timeout
  connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT) || 5000, // 5 seconds
  acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT) || 5000, // 5 seconds
  // Enable keep-alive
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // Handle reconnect
  reconnect: true,
  // Removed invalid options that cause warnings
});

// Get a promise-based connection from the pool
const promisePool = pool.promise();

// Test the connection
async function testConnection() {
  try {
    console.log('Attempting database connection...');
    const connection = await promisePool.getConnection();
    console.log('✅ Successfully connected to the MySQL database.');
    connection.release();
    return true;
  } catch (err) {
    console.error('Error connecting to the MySQL database:', err);
    if (err.code === 'ETIMEDOUT') {
      console.error('\n🔧 ETIMEDOUT Error Troubleshooting:');
      console.error('This error means the connection attempt to your database timed out.');
      console.error('Possible causes and solutions:');
      console.error('1. ❌ Incorrect DB_HOST in .env file');
      console.error('   Solution: Verify your database host is correct');
      console.error('2. ❌ Remote MySQL not enabled in cPanel');
      console.error('   Solution: Enable Remote MySQL in your cPanel');
      console.error('3. ❌ Your IP is not whitelisted');
      console.error('   Solution: Add your IP to Remote MySQL whitelist in cPanel');
      console.error('4. ❌ Firewall blocking outgoing connections on port 3306');
      console.error('   Solution: Check your firewall settings');
      console.error('5. ❌ Hosting provider uses a different port');
      console.error('   Solution: Check with your hosting provider for correct port');
      console.error('6. ❌ Hosting provider requires a specific hostname');
      console.error('   Solution: Check with your hosting provider for correct hostname');
      console.error('7. ❌ IPv6 connection issues');
      console.error('   Solution: Force IPv4 connection with DB_FORCE_IPV4=true');
      console.error('\n🔧 Diagnostic Steps:');
      console.error('1. Try connecting with a MySQL client:');
      console.error('   mysql -h techzontech.com -u techzontech_Pos_user -p techzontech_Lanundry_Pos');
      console.error('2. Check if you can reach the host:');
      console.error('   ping techzontech.com');
      console.error('3. Check if port 3306 is accessible:');
      console.error('   telnet techzontech.com 3306');
      console.error('   or');
      console.error('   nc -zv techzontech.com 3306');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('\n🔧 ECONNREFUSED Error Troubleshooting:');
      console.error('This error means the connection was actively refused by the server.');
      console.error('Possible causes:');
      console.error('1. MySQL server is not running on the host');
      console.error('2. MySQL is not accepting connections from your IP');
      console.error('3. Incorrect port number');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n🔧 Access Denied Error Troubleshooting:');
      console.error('This error means your credentials are incorrect.');
      console.error('Possible causes:');
      console.error('1. Incorrect username or password');
      console.error('2. User does not have permission to access the database');
      console.error('3. User is not allowed to connect from your IP');
    }
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
  }
};