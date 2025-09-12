const mysql = require('mysql2');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Check if environment variables are loaded
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
  console.error('❌ Environment variables are not loaded properly!');
  console.log('Please check that your .env file exists in the backend directory with the correct values.');
  console.log('Current working directory:', process.cwd());
  console.log('Expected .env path:', path.resolve(__dirname, '.env'));
  process.exit(1);
}

console.log('=== cPanel Database Connection Test ===');
console.log('Configuration:');
console.log('- Host:', process.env.DB_HOST);
console.log('- User:', process.env.DB_USER);
console.log('- Database:', process.env.DB_NAME);
console.log('- Port:', process.env.DB_PORT || 3306);
console.log('- SSL:', process.env.DB_SSL === 'true' ? 'Enabled' : 'Disabled');
console.log('');

// Test different host configurations
const hostsToTry = [
  process.env.DB_HOST,
  'localhost',
  '127.0.0.1'
];

console.log('Testing connection with different host configurations...\n');

let success = false;

hostsToTry.forEach((host, index) => {
  console.log(`Test ${index + 1}: Trying host '${host}'`);
  
  const connection = mysql.createConnection({
    host: host,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    connectTimeout: 10000 // 10 seconds timeout
  });

  connection.connect((err) => {
    if (err) {
      console.log(`  ❌ Failed to connect to ${host}:`, err.message);
    } else {
      console.log(`  ✅ Successfully connected to ${host}`);
      success = true;
      connection.end();
    }
    
    // If this is the last test and no success, show additional troubleshooting info
    if (index === hostsToTry.length - 1 && !success) {
      console.log('\n=== Additional Troubleshooting Information ===');
      console.log('1. Make sure your database exists in cPanel');
      console.log('2. Make sure your database user exists and is assigned to the database');
      console.log('3. Add your server IP to the Remote MySQL whitelist in cPanel');
      console.log('4. Contact your hosting provider for the correct database host if the above fails');
    }
  });
});