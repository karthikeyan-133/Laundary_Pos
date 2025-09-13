// Test script to verify local setup
const fs = require('fs');
const path = require('path');

console.log('Testing local setup...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file exists');
  
  // Read the .env file
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check if Supabase variables are set
  if (envContent.includes('SUPABASE_URL=') && !envContent.includes('your_supabase_project_url_here')) {
    console.log('✅ SUPABASE_URL is set');
  } else {
    console.log('⚠️  SUPABASE_URL is not set or using placeholder value');
  }
  
  if (envContent.includes('SUPABASE_KEY=') && !envContent.includes('your-supabase-anon-key-here')) {
    console.log('✅ SUPABASE_KEY is set');
  } else {
    console.log('⚠️  SUPABASE_KEY is not set or using placeholder value');
  }
} else {
  console.log('❌ .env file does not exist');
  console.log('Please copy .env.example to .env and update the values');
}

// Check if required packages are installed
try {
  require('@supabase/supabase-js');
  console.log('✅ @supabase/supabase-js package is installed');
} catch (error) {
  console.log('❌ @supabase/supabase-js package is not installed');
  console.log('Please run "npm install" in the root directory');
}

console.log('\n--- Setup Check Complete ---\n');

console.log('To properly configure your local development environment:');
console.log('1. Copy .env.example to .env: cp .env.example .env');
console.log('2. Edit .env and replace placeholder values with your Supabase credentials');
console.log('3. Ensure you have run "npm install" in the root directory');
console.log('4. Start the server with "node server.js"');