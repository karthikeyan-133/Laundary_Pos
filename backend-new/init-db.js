const mysql = require('mysql2');
const path = require('path');
const dotenv = require('dotenv');
const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });
const fs = require('fs');
const { exec } = require('child_process');

// This script will initialize the MySQL database by running the init_db.sql file

console.log('Initializing MySQL database...');

// Path to the SQL initialization file
const sqlFilePath = path.join(__dirname, 'init_db.sql');

// Check if the SQL file exists
if (!fs.existsSync(sqlFilePath)) {
  console.error('❌ SQL initialization file not found:', sqlFilePath);
  console.log('Please make sure init_db.sql exists in the backend-new directory.');
  process.exit(1);
}

console.log('Found SQL initialization file:', sqlFilePath);

// Read the SQL file
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

console.log('SQL file content loaded successfully.');


// For MySQL, we need to connect and execute the SQL commands
// This would typically be done with a MySQL client, but for simplicity,
// we'll use the mysql command line tool

console.log('\nTo initialize your MySQL database, please follow these steps:');
console.log('1. Make sure MySQL server is running');
console.log('2. Open MySQL Workbench or command line MySQL client');
console.log('3. Connect to your MySQL server');
console.log('4. Run the init_db.sql file:');
console.log('   - In MySQL Workbench: Open the init_db.sql file and execute it');
console.log('   - Or from command line:');
console.log('     mysql -u root -p < init_db.sql');
console.log('');
console.log('Alternatively, you can run this script with a MySQL client library to');
console.log('automatically execute the SQL commands.');

console.log('\nDatabase initialization instructions completed.');
console.log('Please follow the steps above to set up your MySQL database.');

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

// Create a connection to the database with the POS user
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
});

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    console.log('\nTroubleshooting steps:');
    console.log('1. Verify your database host in .env file (DB_HOST)');
    console.log('   Common values: localhost, 127.0.0.1, or a specific host from your provider');
    console.log('2. Check that your database and user exist');
    console.log('3. Verify your database credentials (username, password)');
    return;
  }
  
  console.log('✅ Connected to MySQL database.');
  
  // Read the init_db.sql file
  const initDbPath = path.join(__dirname, 'init_db.sql');
  const initDbSql = fs.readFileSync(initDbPath, 'utf8');
  
  // Split the SQL file into individual statements
  const statements = initDbSql
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);
  
  console.log(`Found ${statements.length} SQL statements to execute.`);
  
  // Execute each statement sequentially
  let index = 0;
  
  function executeNextStatement() {
    if (index >= statements.length) {
      console.log('✅ All database tables created successfully.');
      console.log('✅ Sample data inserted.');
      connection.end();
      return;
    }
    
    const statement = statements[index];
    console.log(`Executing statement ${index + 1}/${statements.length}...`);
    
    connection.query(statement, (err, results) => {
      if (err) {
        console.error(`Error executing statement ${index + 1}:`, err);
        connection.end();
        return;
      }
      
      console.log(`✅ Statement ${index + 1} executed successfully.`);
      index++;
      executeNextStatement();
    });
  }
  
  // Start executing statements
  executeNextStatement();
});