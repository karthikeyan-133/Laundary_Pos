/**
 * Simple script to verify database connection with current .env configuration
 */

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
const envPath = path.resolve(__dirname, '.env');
const result = dotenv.config({ path: envPath });

console.log('Dotenv result:', result.parsed ? 'Loaded successfully' : 'Failed to load');

// Display configuration
console.log('Configuration:');
console.log('- Host:', process.env.DB_HOST || 'Not set');
console.log('- User:', process.env.DB_USER || 'Not set');
console.log('- Database:', process.env.DB_NAME || 'Not set');
console.log('- Port:', process.env.DB_PORT || 3306);
console.log('- SSL:', process.env.DB_SSL === 'true' ? 'Enabled' : 'Disabled');

// Check for system environment variables that might override
console.log('\nSystem environment check:');
console.log('- System DB_HOST:', process.env.DB_HOST);

async function verifyConnection() {
  try {
    console.log('\n🔍 Testing connection...');
    
    // Create connection with current configuration
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT) || 20000,
    });
    
    console.log('✅ Connection successful!');
    
    // Test a simple query
    console.log('   Testing simple query...');
    const [results] = await connection.execute('SELECT DATABASE() as db, VERSION() as version');
    console.log('   Connected to database:', results[0].db);
    console.log('   MySQL Version:', results[0].version);
    
    // Close connection
    await connection.end();
    console.log('✅ Connection closed successfully');
    
    console.log('\n🎉 Database connection verified successfully!');
    console.log('   Your .env configuration is working correctly.');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (error.code === 'ETIMEDOUT') {
      console.error('\n🔧 Troubleshooting ETIMEDOUT Error:');
      console.error('   This means the connection attempt timed out.');
      console.error('   Possible causes:');
      console.error('   1. ❌ Remote MySQL not enabled in cPanel');
      console.error('   2. ❌ Your IP is not whitelisted in cPanel');
      console.error('   3. ❌ Firewall blocking outgoing connections on port 3306');
      console.error('   4. ❌ Hosting provider uses a different hostname or port');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n🔧 Troubleshooting ECONNREFUSED Error:');
      console.error('   This means the connection was actively refused.');
      console.error('   Possible causes:');
      console.error('   1. ❌ MySQL server not running');
      console.error('   2. ❌ Incorrect port number');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n🔧 Troubleshooting Access Denied Error:');
      console.error('   This means your credentials are incorrect.');
      console.error('   Possible causes:');
      console.error('   1. ❌ Incorrect username or password');
      console.error('   2. ❌ User not allowed to connect from your IP');
    }
    
    process.exit(1);
  }
}

verifyConnection();