const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const dotenv = require('dotenv');
const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

console.log('Attempting to connect to Supabase with the following configuration:');
console.log('Supabase URL:', process.env.SUPABASE_URL);
console.log('Env file path:', envPath);

// Check if environment variables are loaded
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error('❌ Supabase environment variables are not loaded properly!');
  console.log('Please check that your .env file exists in the backend directory with the correct values.');
  console.log('Current working directory:', process.cwd());
  console.log('Expected .env path:', envPath);
  process.exit(1);
}

// Create a Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Test the connection
async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('⚠️  Warning: Could not connect to Supabase tables, but client is initialized');
      console.log('This might be expected if tables are not yet created');
      console.log('Error details:', error.message);
    } else {
      console.log('✅ Successfully connected to Supabase database.');
    }
  } catch (err) {
    console.error('Error testing Supabase connection:', err);
  }
}

// Run test connection
testConnection();

module.exports = supabase;