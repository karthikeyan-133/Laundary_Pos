// Test database connection with IPv4 forcing
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

console.log('Testing database connection with IPv4 forcing...');
console.log('Host:', process.env.DB_HOST);
console.log('User:', process.env.DB_USER);
console.log('Database:', process.env.DB_NAME);

// Force IPv4
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

// Test connection
async function testConnection() {
  let connection;
  
  try {
    console.log('Creating connection...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      connectTimeout: 10000, // 10 seconds
    });

    console.log('✅ Connection successful!');
    
    // Test a simple query
    console.log('Testing simple query...');
    const [rows] = await connection.execute('SELECT 1 as connected');
    console.log('Query result:', rows);
    
    if (rows && rows[0] && rows[0].connected === 1) {
      console.log('✅ Database query successful!');
    } else {
      console.log('❌ Database query failed');
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
    
    if (error.code === 'ER_TOO_MANY_USER_CONNECTIONS') {
      console.error('\n🔧 Too Many Connections Error:');
      console.error('Your database user has reached the maximum number of connections.');
      console.error('Possible solutions:');
      console.error('1. Wait a few minutes and try again (connections may close automatically)');
      console.error('2. Contact your hosting provider to increase connection limits');
      console.error('3. Reduce the connection limit in your application');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('\n🔧 Troubleshooting steps:');
      console.error('1. Check that Remote MySQL is enabled in your cPanel');
      console.error('2. Verify your IP is whitelisted in cPanel Remote MySQL');
      console.error('3. Try connecting with a MySQL client:');
      console.error('   mysql -h techzontech.com -u techzontech_Pos_user -p techzontech_Lanundry_Pos');
      console.error('4. Check if port 3306 is accessible:');
      console.error('   telnet techzontech.com 3306');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('Connection closed.');
    }
  }
}

testConnection();