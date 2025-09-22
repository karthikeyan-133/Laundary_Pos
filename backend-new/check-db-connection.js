// Simple script to check database connection status with IPv4 forcing
const mysql = require('mysql2');
const dns = require('dns');

console.log('Checking database connection with IPv4 forcing...');

// Force IPv4 resolution
dns.setDefaultResultOrder('ipv4first');

// Create a single connection with minimal settings
const connection = mysql.createConnection({
  host: 'techzontech.com',
  user: 'techzontech_Pos_user',
  password: 'Welc0me$27',
  database: 'techzontech_Lanundry_Pos',
  port: 3306,
  ssl: false,
  connectTimeout: 5000, // 5 seconds
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
    if (err.code === 'ER_TOO_MANY_USER_CONNECTIONS') {
      console.error('\n🔧 Too many connections. Please wait a few minutes and try again.');
    } else if (err.code === 'ETIMEDOUT') {
      console.error('\n🔧 Connection timed out. Possible network or firewall issue.');
      console.error('This is likely due to IPv6 connection issues with your cPanel hosting.');
      console.error('Try these solutions:');
      console.error('1. Ensure Remote MySQL is enabled in cPanel');
      console.error('2. Add your IP to the Remote MySQL whitelist in cPanel');
      console.error('3. Contact your hosting provider about IPv6 connectivity issues');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('\n🔧 Connection refused. Database server may be down.');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n🔧 Access denied. Check your username and password.');
    }
    process.exit(1);
  }
  
  console.log('✅ Database connection successful!');
  
  // Test a simple query
  connection.query('SELECT 1 as connected', (error, results) => {
    if (error) {
      console.error('❌ Query failed:', error);
    } else {
      console.log('✅ Query successful:', results);
    }
    
    // Close the connection
    connection.end();
    console.log('Connection closed.');
  });
});