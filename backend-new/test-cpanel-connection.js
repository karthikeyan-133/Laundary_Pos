const mysql = require('mysql2');

// Database configuration from your .env file
const dbConfig = {
  host: 'techzontech.com',
  user: 'techzontech_Pos_user',
  password: 'Welc0me$27',
  database: 'techzontech_Lanundry_Pos',
  port: 3306,
  connectTimeout: 10000 // 10 seconds timeout
};

console.log('Attempting to connect to cPanel MySQL database...');
console.log('Host:', dbConfig.host);
console.log('User:', dbConfig.user);
console.log('Database:', dbConfig.database);
console.log('Port:', dbConfig.port);

// Create a connection to the database
const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
  if (err) {
    console.error('❌ Error connecting to the MySQL database:', err.message);
    if (err.code === 'ETIMEDOUT') {
      console.error('\n🔧 Troubleshooting steps:');
      console.error('1. Check if remote MySQL access is enabled in cPanel');
      console.error('2. Verify your IP is whitelisted in cPanel Remote MySQL settings');
      console.error('3. Confirm database name, username, and password are correct');
      console.error('4. Check if your hosting provider allows external connections');
      console.error('5. Some hosts require using a specific hostname instead of your domain');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('\n🔧 Connection refused. Check if:'); 
      console.error('1. The database server is running');
      console.error('2. The port number is correct');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n❌ Access denied. Check if:');
      console.error('1. Username and password are correct');
      console.error('2. The user has proper permissions for the database');
    }
    return;
  }
  console.log('✅ Successfully connected to the MySQL database.');
  connection.end();
});