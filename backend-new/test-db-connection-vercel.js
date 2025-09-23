// Simple script to test Supabase connection in Vercel environment
console.log('Testing Supabase connection in Vercel environment...');

// Log environment variables (without sensitive data)
console.log('Environment variables:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'SET' : 'NOT SET');
console.log('VERCEL:', process.env.VERCEL ? 'YES' : 'NO');

// Check if required environment variables are set
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  console.log('Please set these environment variables in your Vercel dashboard:');
  missingEnvVars.forEach(envVar => console.log(`- ${envVar}`));
  process.exit(1);
}

// Try to import and test the Supabase connection
try {
  console.log('Attempting to import supabaseClient...');
  const { supabase } = require('./supabaseClient');
  
  console.log('supabaseClient imported successfully');
  
  // Test the connection
  async function testConnection() {
    try {
      console.log('Testing Supabase connection...');
      const { data, error } = await supabase
        .from('settings')
        .select('id')
        .limit(1);
      
      if (error) {
        throw new Error(error.message);
      }
      
      console.log('✅ Supabase connection successful!');
      console.log('Result:', data);
      process.exit(0);
    } catch (err) {
      console.error('❌ Supabase connection failed:');
      console.error('Error:', err.message);
      console.error('Stack:', err.stack);
      process.exit(1);
    }
  }
  
  testConnection();
} catch (err) {
  console.error('❌ Failed to import supabaseClient:');
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  process.exit(1);
}