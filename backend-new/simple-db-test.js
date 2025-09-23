const mysql = require('mysql2');

console.log('Testing database connection with simple script...');

// Load environment variables
require('dotenv').config({ path: './.env' });

console.log('Using configuration:');
console.log('- Host:', process.env.DB_HOST);
console.log('- User:', process.env.DB_USER);
console.log('- Database:', process.env.DB_NAME);
console.log('- Port:', process.env.DB_PORT);

// Create connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  connectTimeout: 10000 // 10 seconds timeout
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Connection failed:', err);
    if (err.code === 'ETIMEDOUT') {
      console.log('\n🔧 This is a timeout error. Possible causes:');
      console.log('1. Remote MySQL not enabled in cPanel');
      console.log('2. Your IP is not whitelisted in cPanel');
      console.log('3. Firewall blocking outgoing connections on port 3306');
      console.log('4. Hosting provider uses a different hostname or port');
    }
    process.exit(1);
  }
  
  console.log('✅ Successfully connected to the database!');
  connection.end();
});