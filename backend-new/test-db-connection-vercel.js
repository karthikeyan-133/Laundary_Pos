// Simple script to test database connection in Vercel environment
console.log('Testing database connection in Vercel environment...');

// Log environment variables (without sensitive data)
console.log('Environment variables:');
console.log('DB_HOST:', process.env.DB_HOST ? 'SET' : 'NOT SET');
console.log('DB_USER:', process.env.DB_USER ? 'SET' : 'NOT SET');
console.log('DB_NAME:', process.env.DB_NAME ? 'SET' : 'NOT SET');
console.log('DB_PORT:', process.env.DB_PORT || 'NOT SET');
console.log('VERCEL:', process.env.VERCEL ? 'YES' : 'NO');

// Check if required environment variables are set
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_NAME'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  console.log('Please set these environment variables in your Vercel dashboard:');
  missingEnvVars.forEach(envVar => console.log(`- ${envVar}`));
  process.exit(1);
}

// Try to import and test the database connection
try {
  console.log('Attempting to import mysqlDb...');
  const db = require('./mysqlDb');
  
  console.log('mysqlDb imported successfully');
  
  // Test the connection
  async function testConnection() {
    try {
      console.log('Testing database connection...');
      const result = await db.query('SELECT 1 as connected');
      console.log('✅ Database connection successful!');
      console.log('Result:', result);
      process.exit(0);
    } catch (err) {
      console.error('❌ Database connection failed:');
      console.error('Error:', err.message);
      console.error('Stack:', err.stack);
      process.exit(1);
    }
  }
  
  testConnection();
} catch (err) {
  console.error('❌ Failed to import mysqlDb:');
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  process.exit(1);
}