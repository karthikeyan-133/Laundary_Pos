const mysql = require('mysql2');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'pos_user',
  password: 'Welc0me$27',
  database: 'Pos_system',
  port: 3306
};

console.log('Attempting to connect to MySQL database with the following configuration:');
console.log('Host:', dbConfig.host);
console.log('User:', dbConfig.user);
console.log('Database:', dbConfig.database);
console.log('Port:', dbConfig.port);

// Create a connection to the database
const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the MySQL database:', err);
    return;
  }
  console.log('✅ Successfully connected to the MySQL database.');
  
  // Test a simple query
  connection.query('SELECT 1 + 1 AS solution', (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      connection.end();
      return;
    }
    console.log('Query result:', results[0].solution);
    
    // Test if settings table exists and has the correct structure
    connection.query('DESCRIBE settings', (error, results) => {
      if (error) {
        console.error('Error describing settings table:', error);
        connection.end();
        return;
      }
      console.log('Settings table structure:');
      console.table(results);
      connection.end();
    });
  });
});