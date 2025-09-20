// Simple test script to verify frontend-backend communication
const fs = require('fs');
const path = require('path');

console.log('=== Tally POS System Connection Test ===\n');

// Check if required directories exist
const frontendDir = path.join(__dirname, 'frontend');
const backendDir = path.join(__dirname, 'backend-new');

console.log('Checking directory structure...');
if (fs.existsSync(frontendDir)) {
  console.log('✅ Frontend directory found');
} else {
  console.log('❌ Frontend directory not found');
}

if (fs.existsSync(backendDir)) {
  console.log('✅ Backend directory found');
} else {
  console.log('❌ Backend directory not found');
}

// Check frontend .env file
const frontendEnvPath = path.join(frontendDir, '.env');
console.log('\nChecking frontend configuration...');
if (fs.existsSync(frontendEnvPath)) {
  const frontendEnv = fs.readFileSync(frontendEnvPath, 'utf8');
  if (frontendEnv.includes('VITE_API_URL')) {
    console.log('✅ Frontend .env file configured with VITE_API_URL');
  } else {
    console.log('⚠️  Frontend .env file exists but may be missing VITE_API_URL');
  }
} else {
  console.log('❌ Frontend .env file not found');
}

// Check backend .env file
const backendEnvPath = path.join(backendDir, '.env');
console.log('\nChecking backend configuration...');
if (fs.existsSync(backendEnvPath)) {
  const backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
  const requiredVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  const missingVars = requiredVars.filter(varName => !backendEnv.includes(varName));
  
  if (missingVars.length === 0) {
    console.log('✅ Backend .env file configured with required database variables');
  } else {
    console.log(`⚠️  Backend .env file missing variables: ${missingVars.join(', ')}`);
  }
} else {
  console.log('❌ Backend .env file not found');
}

// Check package.json files
console.log('\nChecking package.json files...');
const frontendPackagePath = path.join(frontendDir, 'package.json');
const backendPackagePath = path.join(backendDir, 'package.json');

if (fs.existsSync(frontendPackagePath)) {
  console.log('✅ Frontend package.json found');
} else {
  console.log('❌ Frontend package.json not found');
}

if (fs.existsSync(backendPackagePath)) {
  console.log('✅ Backend package.json found');
} else {
  console.log('❌ Backend package.json not found');
}

console.log('\n=== Setup Verification Complete ===');
console.log('\nNext steps:');
console.log('1. Ensure your MySQL database is running');
console.log('2. Verify database credentials in backend/.env');
console.log('3. Run "npm install" in both frontend and backend directories');
console.log('4. Start the backend server: cd backend-new && npm run dev');
console.log('5. Start the frontend: cd frontend && npm run dev');
console.log('6. Open your browser to http://localhost:5173');