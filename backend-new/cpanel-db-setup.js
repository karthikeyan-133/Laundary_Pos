/**
 * Script to test and verify cPanel database connection
 * Run this after setting up your database in cPanel
 */

const mysql = require('mysql2/promise');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

console.log('🔍 Testing cPanel Database Connection');
console.log('=====================================');
console.log('Configuration from .env:');
console.log('- Host:', process.env.DB_HOST);
console.log('- User:', process.env.DB_USER);
console.log('- Database:', process.env.DB_NAME);
console.log('- Port:', process.env.DB_PORT);
console.log('- SSL:', process.env.DB_SSL);

async function testConnection() {
  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    connectTimeout: 15000 // 15 seconds
  };

  console.log('\n🔄 Attempting to connect...');

  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Successfully connected to the database!');
    
    // Test with a simple query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query executed successfully:', rows[0]);
    
    // Check if required tables exist (you can modify these based on your schema)
    try {
      const [tables] = await connection.execute('SHOW TABLES');
      console.log('📋 Database tables:');
      tables.forEach(table => {
        console.log('  -', Object.values(table)[0]);
      });
    } catch (err) {
      console.log('⚠️ Could not list tables:', err.message);
    }
    
    await connection.end();
    console.log('\n🎉 Database connection test completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (error.code === 'ETIMEDOUT') {
      console.error('\n🔧 Troubleshooting steps:');
      console.error('1. Ensure remote MySQL is enabled in cPanel');
      console.error('2. Add your IP to the remote MySQL whitelist');
      console.error('3. Check if your hosting provider allows external connections');
      console.error('4. Verify database name, username, and password');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n🔧 Connection refused:');
      console.error('1. Check if the database server is running');
      console.error('2. Verify the port number is correct');
      console.error('3. Confirm the hostname is correct');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n❌ Access denied:');
      console.error('1. Check username and password');
      console.error('2. Verify user has privileges on the database');
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n❌ Host not found:');
      console.error('1. Check if the hostname is correct');
      console.error('2. Verify DNS resolution');
    }
    
    console.error('\n📋 Full error details:');
    console.error(JSON.stringify(error, null, 2));
    return false;
  }
}

// Run the test
testConnection().then(success => {
  if (success) {
    console.log('\n✅ Ready to proceed with application setup!');
  } else {
    console.log('\n❌ Please fix the database connection issues before proceeding.');
  }
});