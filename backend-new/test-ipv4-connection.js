// Test database connection using explicit IPv4 address
const mysql = require('mysql2');

console.log('Testing database connection with explicit IPv4 address...');

// Create a single connection with minimal settings using IPv4 address
const connection = mysql.createConnection({
  host: '190.92.174.102', // Explicit IPv4 address
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
      console.error('\n🔧 Connection timed out.');
      console.error('Even with IPv4 address, we still have connection issues.');
      console.error('This suggests either:');
      console.error('1. Firewall blocking outgoing connections on port 3306');
      console.error('2. Remote MySQL not properly configured in cPanel');
      console.error('3. IP not whitelisted in cPanel Remote MySQL settings');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('\n🔧 Connection refused. Database server may be down.');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n🔧 Access denied. Check your username and password.');
    }
    process.exit(1);
  }
  
  console.log('✅ Database connection successful with IPv4 address!');
  
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