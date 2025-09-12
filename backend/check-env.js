const fs = require('fs');
const path = require('path');

console.log('=== Environment File Check ===');

// Check current working directory
console.log('Current working directory:', process.cwd());

// Check if .env file exists in backend directory
const envPath = path.resolve(__dirname, '.env');
console.log('Looking for .env file at:', envPath);

if (fs.existsSync(envPath)) {
  console.log('✅ .env file found!');
  
  // Read and display first few lines
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n').slice(0, 10); // First 10 lines
  console.log('\nFirst 10 lines of .env file:');
  lines.forEach((line, index) => {
    console.log(`${index + 1}: ${line}`);
  });
  
  // Try to load the environment variables
  require('dotenv').config({ path: envPath });
  
  console.log('\nLoaded environment variables:');
  console.log('DB_HOST:', process.env.DB_HOST || 'NOT SET');
  console.log('DB_USER:', process.env.DB_USER || 'NOT SET');
  console.log('DB_NAME:', process.env.DB_NAME || 'NOT SET');
  console.log('DB_PORT:', process.env.DB_PORT || 'NOT SET');
} else {
  console.log('❌ .env file NOT found!');
  
  // List files in backend directory
  const backendDir = __dirname;
  console.log('\nFiles in backend directory:');
  const files = fs.readdirSync(backendDir);
  files.forEach(file => {
    console.log('- ' + file);
  });
}

console.log('\n=== End Check ===');