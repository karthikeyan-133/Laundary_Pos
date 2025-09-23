/**
 * Script to list databases accessible by the current user
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: './.env' });

async function listDatabases() {
  console.log('🔍 Checking accessible databases...');
  
  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    connectTimeout: 10000
  };

  let connection;
  
  try {
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to MySQL server');
    
    // Try to list databases
    try {
      const [databases] = await connection.execute('SHOW DATABASES');
      console.log('\n📋 Available databases:');
      databases.forEach(db => {
        console.log('  -', db.Database);
      });
      
      // Look for databases that might match our pattern
      console.log('\n🎯 Potential matching databases:');
      const dbName = 'Laundry_Pos';
      databases.forEach(db => {
        if (db.Database.includes(dbName)) {
          console.log('  🔍 Found possible match:', db.Database);
        }
      });
      
      // Also check for any databases starting with the username
      const userPrefix = process.env.DB_USER.split('_')[0];
      console.log(`\n🔍 Databases with prefix '${userPrefix}_':`);
      databases.forEach(db => {
        if (db.Database.startsWith(userPrefix + '_')) {
          console.log('  -', db.Database);
        }
      });
      
    } catch (err) {
      console.error('❌ Could not list databases:', err.message);
      
      // Try a simpler query
      try {
        const [result] = await connection.execute('SELECT DATABASE() as current_db');
        console.log('Current database:', result[0]?.current_db || 'None');
      } catch (simpleErr) {
        console.error('❌ Could not execute simple query:', simpleErr.message);
      }
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (connection) {
      await connection.end();
    }
    
    process.exit(1);
  }
}

listDatabases();