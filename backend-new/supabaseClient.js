const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const dotenv = require('dotenv');

// Check if we're running on Vercel
const isVercel = !!process.env.VERCEL;

// Load environment variables only in local development
if (!isVercel) {
  const envPath = path.resolve(__dirname, '.env');
  dotenv.config({ path: envPath });
  console.log('Environment: Local Development');
} else {
  console.log('Environment: Vercel');
}

console.log('Supabase URL:', process.env.SUPABASE_URL || 'Not set');

// Use Vercel environment variables if available, otherwise use local .env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Check if environment variables are loaded
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase environment variables are not loaded properly!');
  console.log('Please check that your environment variables are set correctly.');
  if (!isVercel) {
    console.log('For local development, ensure your .env file exists in the backend directory with the correct values.');
    console.log('Expected .env path:', path.resolve(__dirname, '.env'));
  } else {
    console.log('For Vercel deployment, ensure SUPABASE_URL and SUPABASE_KEY are set in your Vercel project Environment Variables.');
  }
  process.exit(1);
}

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

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