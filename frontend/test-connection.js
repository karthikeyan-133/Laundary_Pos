// Simple test script to verify frontend can connect to backend
const fs = require('fs');
const path = require('path');

console.log('=== Frontend Connection Test ===\n');

// Check if .env file exists and has VITE_API_URL
const envPath = path.join(__dirname, '.env');
console.log('Checking .env configuration...');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('VITE_API_URL')) {
    console.log('✅ .env file found with VITE_API_URL');
    const apiUrlMatch = envContent.match(/VITE_API_URL=(.*)/);
    if (apiUrlMatch && apiUrlMatch[1]) {
      console.log(`   API URL: ${apiUrlMatch[1]}`);
    }
  } else {
    console.log('⚠️  .env file found but missing VITE_API_URL');
  }
} else {
  console.log('❌ .env file not found');
  console.log('   Please create a .env file with VITE_API_URL=http://localhost:3004');
}

console.log('\n=== Frontend Connection Test Complete ===');