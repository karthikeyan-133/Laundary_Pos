/**
 * Script to list available databases in cPanel
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: './.env' });

async function listDatabases() {
  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    connectTimeout: 15000
  };

  let connection;
  
  try {
    // Connect without specifying database first
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to MySQL server');
    
    // List databases
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('\n📋 Available databases:');
    databases.forEach(db => {
      console.log('  -', db.Database);
    });
    
    await connection.end();
    console.log('\n✅ Database listing completed');
    
  } catch (error) {
    console.error('❌ Failed to list databases:', error.message);
    
    if (connection) {
      await connection.end();
    }
    
    process.exit(1);
  }
}

// Run the function
listDatabases();