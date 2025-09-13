const mysql = require('mysql2');
const path = require('path');
const dotenv = require('dotenv');
const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

console.log('Attempting to connect to database with the following configuration:');
console.log('Host:', process.env.DB_HOST);
console.log('User:', process.env.DB_USER);
console.log('Database:', process.env.DB_NAME);
console.log('Port:', process.env.DB_PORT || 3306);
console.log('Env file path:', envPath);

// Check if environment variables are loaded
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
  console.error('❌ Environment variables are not loaded properly!');
  console.log('Please check that your .env file exists in the backend directory with the correct values.');
  console.log('Current working directory:', process.cwd());
  console.log('Expected .env path:', envPath);
  process.exit(1);
}

// Create a connection to the database
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  connectTimeout: 30000, // 30 seconds timeout
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    console.log('\nTroubleshooting steps:');
    console.log('1. Verify your database host in .env file (DB_HOST)');
    console.log('2. Check that your database and user exist');
    console.log('3. Verify your database credentials (username, password)');
    return;
  }
  console.log('✅ Successfully connected to the MySQL database.');
});

module.exports = connection;