// Test script to verify Supabase connection
const supabase = require('./supabaseClient');
const db = require('./mysqlDb');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const result = await db.query('SELECT 1 as connected');
    
    if (result.length > 0) {
      console.log('✅ Database connection successful!');
      console.log('Connected result:', result[0]);
    } else {
      console.log('❌ Database connection failed - no results');
    }
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
    console.error('Error details:', err);
  }
  
  // Close the connection pool
  if (db.pool) {
    db.pool.end();
  }
}

testConnection();
