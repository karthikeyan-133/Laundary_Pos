/**
 * Database connection troubleshooting script
 * Helps diagnose issues with cPanel database connections
 */

const mysql = require('mysql2/promise');
const dns = require('dns').promises;
require('dotenv').config({ path: './.env' });

console.log('🔍 Database Connection Troubleshooter');
console.log('====================================');

async function troubleshoot() {
  console.log('\n📋 Checking environment variables...');
  const requiredVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_PORT'];
  let allPresent = true;
  
  for (const envVar of requiredVars) {
    if (!process.env[envVar]) {
      console.error(`❌ ${envVar} is missing`);
      allPresent = false;
    } else {
      console.log(`✅ ${envVar}: ${envVar === 'DB_PASSWORD' ? '****' : process.env[envVar]}`);
    }
  }
  
  if (!allPresent) {
    console.log('\n🔧 Please check your .env file and ensure all database variables are set.');
    return;
  }
  
  console.log('\n🌐 Checking DNS resolution...');
  try {
    const addresses = await dns.resolve4(process.env.DB_HOST);
    console.log(`✅ DNS resolved successfully: ${addresses.join(', ')}`);
  } catch (err) {
    console.error(`❌ DNS resolution failed: ${err.message}`);
    console.log('🔧 Try using a direct IP address or check your domain name.');
    return;
  }
  
  console.log('\n🔗 Testing direct connection...');
  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    connectTimeout: 5000 // 5 seconds for quick test
  };
  
  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ TCP connection successful');
    await connection.end();
  } catch (err) {
    console.error(`❌ TCP connection failed: ${err.message}`);
    
    if (err.code === 'ETIMEDOUT') {
      console.log('\n🔧 Connection timeout issues:');
      console.log('1. Check if remote MySQL is enabled in cPanel');
      console.log('2. Verify your IP is whitelisted');
      console.log('3. Confirm firewall settings allow outbound connections on port 3306');
    } else if (err.code === 'ECONNREFUSED') {
      console.log('\n🔧 Connection refused:');
      console.log('1. Verify the MySQL server is running');
      console.log('2. Check if port 3306 is correct');
    }
    return;
  }
  
  console.log('\n🔐 Testing authentication...');
  config.database = process.env.DB_NAME;
  
  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Authentication successful');
    await connection.end();
  } catch (err) {
    console.error(`❌ Authentication failed: ${err.message}`);
    
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n🔧 Access denied issues:');
      console.log('1. Check username and password');
      console.log('2. Verify user exists and has privileges');
      console.log('3. Some hosts require using full username (account_user)');
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      console.log('\n🔧 Database not found:');
      console.log('1. Check database name spelling');
      console.log('2. Confirm database exists');
      console.log('3. Some hosts prefix database names with account name');
    }
    return;
  }
  
  console.log('\n🎉 All connection tests passed!');
  console.log('\n🚀 You can now run your application or initialize the database:');
  console.log('   node init-cpanel-db.js');
}

troubleshoot();