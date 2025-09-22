/**
 * Test script for cPanel database connection
 * This script will help diagnose connection issues with cPanel MySQL databases
 */

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

console.log('🔍 Testing cPanel Database Connection');
console.log('=====================================');

// Display configuration
console.log('Configuration:');
console.log('- Host:', process.env.DB_HOST || 'Not set');
console.log('- User:', process.env.DB_USER || 'Not set');
console.log('- Database:', process.env.DB_NAME || 'Not set');
console.log('- Port:', process.env.DB_PORT || 3306);
console.log('- SSL:', process.env.DB_SSL === 'true' ? 'Enabled' : 'Disabled');

// Validate required environment variables
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
  console.error('❌ Missing required environment variables!');
  console.error('Please ensure your .env file contains DB_HOST, DB_USER, and DB_NAME');
  process.exit(1);
}

// Test DNS resolution
const dns = require('dns');

console.log('\n🔍 Testing DNS Resolution...');
dns.lookup(process.env.DB_HOST, (err, address, family) => {
  if (err) {
    console.error('❌ DNS lookup failed:', err);
    process.exit(1);
  } else {
    console.log('✅ DNS lookup successful');
    console.log('   Address:', address);
    console.log('   IP Version:', family);
    
    // Continue with connection test
    testConnection();
  }
});

async function testConnection() {
  console.log('\n🔍 Testing Database Connection...');
  
  try {
    console.log('   Attempting to connect to database...');
    
    // Create connection with shorter timeout for testing
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      connectTimeout: 10000, // 10 second timeout for testing
      timeout: 10000
    });
    
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    console.log('   Testing simple query...');
    const [results] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query test successful:', results);
    
    // Close connection
    await connection.end();
    console.log('✅ Connection closed successfully');
    
    console.log('\n🎉 All tests passed! Your database connection is working correctly.');
    console.log('\n💡 Next steps:');
    console.log('   1. Try running the server: npm start');
    console.log('   2. If you still have issues, check the server logs');
    
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
    
    console.log('\n📋 Diagnostic Commands to Run:');
    console.log('   1. Test connectivity:');
    console.log('      ping ' + process.env.DB_HOST);
    console.log('   2. Test port accessibility (Windows):');
    console.log('      Test-NetConnection ' + process.env.DB_HOST + ' -Port ' + (process.env.DB_PORT || 3306));
    console.log('   3. Test with MySQL client (if installed):');
    console.log('      mysql -h ' + process.env.DB_HOST + ' -u ' + process.env.DB_USER + ' -p ' + process.env.DB_NAME);
    
    console.log('\n📋 cPanel Configuration to Check:');
    console.log('   1. Remote MySQL must be enabled in cPanel');
    console.log('   2. Your IP address must be whitelisted in Remote MySQL');
    console.log('   3. Database user must have privileges on the database');
    console.log('   4. Some hosts use a specific database host (not your domain name)');
    
    process.exit(1);
  }
}