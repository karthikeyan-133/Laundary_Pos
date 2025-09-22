// Test database connection with your specific IP configuration
const mysql = require('mysql2');

console.log('Testing database connection with your specific configuration...');
console.log('Host: 190.92.174.102');
console.log('User: techzontech_Pos_user');
console.log('Database: techzontech_Lanundry_Pos');
console.log('Your IP: 152.58.201.91 (make sure this is whitelisted in cPanel Remote MySQL)');

// Create a single connection
const connection = mysql.createConnection({
  host: '190.92.174.102',
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
    
    if (err.code === 'ETIMEDOUT') {
      console.error('\n🔧 Connection timed out. This is the most common issue.');
      console.error('SOLUTIONS:');
      console.error('1. ✅ ENSURE YOUR IP (152.58.201.91) IS WHITELISTED IN CPANEL REMOTE MYSQL');
      console.error('2. ✅ VERIFY REMOTE MYSQL IS ENABLED IN YOUR CPANEL');
      console.error('3. ✅ CHECK FIREWALL SETTINGS FOR OUTGOING CONNECTIONS ON PORT 3306');
      console.error('4. ✅ CONTACT YOUR HOSTING PROVIDER ABOUT IPv4 CONNECTIVITY');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('\n🔧 Connection refused. Database server may be down.');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n🔧 Access denied. Check your username and password.');
    } else if (err.code === 'ER_DBACCESS_DENIED_ERROR') {
      console.error('\n🔧 Database access denied. Check your database name.');
    } else if (err.code === 'ENOTFOUND') {
      console.error('\n🔧 Host not found. Check your host address.');
    }
    
    process.exit(1);
  }
  
  console.log('✅ Database connection successful!');
  
  // Test a simple query
  connection.query('SELECT VERSION() as version, DATABASE() as database', (error, results) => {
    if (error) {
      console.error('❌ Query failed:', error);
    } else {
      console.log('✅ Database info:', results[0]);
    }
    
    // Close the connection
    connection.end();
    console.log('Connection closed.');
  });
});