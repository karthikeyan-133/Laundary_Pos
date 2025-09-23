/**
 * Simple database connection test
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: './.env' });

async function testConnection() {
  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    connectTimeout: 15000
  };

  console.log('Testing connection with config:', {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Successfully connected to the database!');
    
    // Test with a simple query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query executed successfully:', rows[0]);
    
    await connection.end();
    console.log('✅ Connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error errno:', error.errno);
    
    // Try connecting without specifying database
    console.log('\n🔄 Trying to connect without specifying database...');
    try {
      const configWithoutDB = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
        connectTimeout: 15000
      };
      
      const connection = await mysql.createConnection(configWithoutDB);
      console.log('✅ Connected to MySQL server without specifying database');
      
      // List databases
      const [databases] = await connection.execute('SHOW DATABASES');
      console.log('\n📋 Available databases:');
      databases.forEach(db => {
        if (db.Database.includes('techzontech')) {
          console.log('  -', db.Database);
        }
      });
      
      await connection.end();
    } catch (error2) {
      console.error('❌ Failed to connect even without specifying database:', error2.message);
    }
  }
}

// Run the test
testConnection();