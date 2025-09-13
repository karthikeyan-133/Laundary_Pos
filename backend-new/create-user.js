const mysql = require('mysql2');
require('dotenv').config();

console.log('=== cPanel Database User Setup ===');
console.log('This script is designed for local development with root MySQL access.');
console.log('For cPanel hosting, you need to create the database user manually through cPanel:');
console.log('');
console.log('1. Log in to your cPanel');
console.log('2. Go to "MySQL Databases" under the "Databases" section');
console.log('3. Create a new database user with the following credentials:');
console.log(`   Username: ${process.env.DB_USER}`);
console.log(`   Password: ${process.env.DB_PASSWORD}`);
console.log('4. Assign this user to your database and grant all privileges');
console.log('');
console.log('After creating the user in cPanel, you can skip this script and run:');
console.log('npm run init-db');
console.log('');

// For those who still want to try running this script (might work in some cPanel configurations)
console.log('Attempting to connect with provided credentials...');

// Create a connection using the provided credentials (not as root)
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 3306
});

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL with provided credentials:', err);
    console.log('');
    console.log('This is expected on most cPanel hosting environments.');
    console.log('Please create your database user manually through cPanel as described above.');
    return;
  }
  
  console.log('Successfully connected to MySQL with provided credentials.');
  console.log('In most cPanel environments, the user is already created through the cPanel interface.');
  console.log('Proceeding to initialize the database...');
  
  // Read the create_user.sql file for reference
  const fs = require('fs');
  const path = require('path');
  const createuserSqlPath = path.join(__dirname, 'create_user.sql');
  
  try {
    const createuserSql = fs.readFileSync(createuserSqlPath, 'utf8');
    console.log('');
    console.log('For reference, these are the SQL commands that would be run locally:');
    console.log(createuserSql);
    console.log('');
    console.log('In cPanel, these steps are done through the web interface.');
  } catch (err) {
    console.log('Could not read create_user.sql file for reference.');
  }
  
  connection.end();
});