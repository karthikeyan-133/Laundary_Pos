/**
 * Detailed diagnostic script for cPanel database connection
 * This script will help identify specific issues with cPanel MySQL databases
 */

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

console.log('🔍 Detailed cPanel Database Connection Diagnostic');
console.log('================================================');

// Display configuration
console.log('Configuration:');
console.log('- Host:', process.env.DB_HOST || 'Not set');
console.log('- User:', process.env.DB_USER || 'Not set');
console.log('- Database:', process.env.DB_NAME || 'Not set');
console.log('- Port:', process.env.DB_PORT || 3306);
console.log('- SSL:', process.env.DB_SSL === 'true' ? 'Enabled' : 'Disabled');

// Validate required environment variables
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
  console.error('❌ Missing required environment variables!');
  console.error('Please ensure your .env file contains DB_HOST, DB_USER, and DB_NAME');
  process.exit(1);
}

async function runDiagnostics() {
  console.log('\n🔍 Running Detailed Diagnostics...');
  
  // Test 1: Try connecting with different configurations
  const configs = [
    {
      name: 'Standard Configuration',
      config: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
        connectTimeout: 10000
      }
    },
    {
      name: 'With SSL Enabled',
      config: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        ssl: { rejectUnauthorized: false },
        connectTimeout: 10000
      }
    },
    {
      name: 'Without SSL',
      config: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        ssl: false,
        connectTimeout: 10000
      }
    }
  ];
  
  for (const { name, config } of configs) {
    console.log(`\n🧪 Testing ${name}...`);
    
    try {
      console.log('   Configuration:', JSON.stringify({
        host: config.host,
        user: config.user,
        database: config.database,
        port: config.port,
        ssl: !!config.ssl
      }, null, 2));
      
      const connection = await mysql.createConnection(config);
      console.log(`✅ ${name} successful!`);
      
      // Test a simple query
      console.log('   Testing simple query...');
      const [results] = await connection.execute('SELECT VERSION() as version');
      console.log('   MySQL Version:', results[0].version);
      
      await connection.end();
      console.log('   Connection closed.');
      
      // If we get here, the connection works
      console.log(`\n🎉 ${name} works! This is likely the correct configuration.`);
      return;
    } catch (error) {
      console.error(`❌ ${name} failed:`, error.message);
      
      if (error.code === 'ETIMEDOUT') {
        console.error('   ⚠️  Connection timed out - network or server issue');
      } else if (error.code === 'ECONNREFUSED') {
        console.error('   ⚠️  Connection refused - server not accepting connections');
      } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        console.error('   ⚠️  Access denied - authentication issue');
      } else if (error.code === 'ENOTFOUND') {
        console.error('   ⚠️  Host not found - DNS resolution issue');
      }
    }
  }
  
  // If we get here, all configurations failed
  console.log('\n❌ All connection attempts failed.');
  console.log('\n🔧 Recommended Actions:');
  console.log('1. Check cPanel Remote MySQL settings:');
  console.log('   - Log in to cPanel');
  console.log('   - Navigate to "Remote MySQL"');
  console.log('   - Add your current IP address to the access list');
  console.log('   - Save the changes');
  console.log('');
  console.log('2. Verify database user permissions:');
  console.log('   - In cPanel, go to "MySQL Databases"');
  console.log('   - Check that your user is assigned to the database');
  console.log('   - Ensure the user has ALL PRIVILEGES');
  console.log('');
  console.log('3. Check with your hosting provider:');
  console.log('   - Some hosts use a specific database host (not your domain)');
  console.log('   - Some hosts use a different port for remote connections');
  console.log('   - Some hosts require specific SSL settings');
  console.log('');
  console.log('4. Try using your IP address instead of domain name:');
  console.log('   - Update DB_HOST in .env with your server IP address');
  console.log('   - This can sometimes bypass DNS-related issues');
  
  process.exit(1);
}

runDiagnostics();