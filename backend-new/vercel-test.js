// Simple test file to verify server.js can be imported without errors
try {
  const app = require('./server.js');
  console.log('Server.js imported successfully');
  process.exit(0);
} catch (error) {
  console.error('Error importing server.js:', error.message);
  process.exit(1);
}