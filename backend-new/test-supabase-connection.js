const { query } = require('./mysqlDb');

async function testConnection() {
  try {
    console.log('Testing MySQL database connection...');
    
    // Test the connection by running a simple query
    const result = await query('SELECT 1 as connected');
    
    if (result.length > 0) {
      console.log('✅ Successfully connected to MySQL database.');
      console.log('Database is ready for use.');
    } else {
      console.log('⚠️ Connection test returned unexpected result.');
    }
  } catch (error) {
    console.error('❌ Error connecting to MySQL database:', error.message);
    console.log('\nTroubleshooting steps:');
    console.log('1. Verify your MySQL server is running');
    console.log('2. Check your database credentials in the .env file');
    console.log('3. Ensure the database exists');
    console.log('4. Verify network connectivity to the database server');
  }
}

testConnection();