// Simple test script to verify the fix
console.log('Testing database fix script...');

// Try to load the main fix script
try {
  require('./fix-database-schema.js');
} catch (error) {
  console.error('Error loading fix script:', error.message);
}