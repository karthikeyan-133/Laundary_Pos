const { createClient } = require('@supabase/supabase-js');

// Check if we're running on Vercel
const isVercel = !!process.env.VERCEL;

// Load environment variables only in local development
if (!isVercel) {
  require('dotenv').config({ path: '.env' });
}

// Get Supabase URL and key from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Validate environment variables
if (!supabaseUrl) {
  console.error('❌ SUPABASE_URL is not set in environment variables');
  if (!isVercel) {
    console.log('Please check your .env file');
  } else {
    console.log('Please set SUPABASE_URL in your Vercel dashboard');
  }
}

if (!supabaseKey) {
  console.error('❌ SUPABASE_KEY is not set in environment variables');
  if (!isVercel) {
    console.log('Please check your .env file');
  } else {
    console.log('Please set SUPABASE_KEY in your Vercel dashboard');
  }
}

// Create Supabase client (this will still fail if credentials are missing, but gracefully)
let supabase;
try {
  supabase = createClient(supabaseUrl || '', supabaseKey || '', {
    // Optional config
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    db: {
      schema: 'public'
    }
  });
} catch (error) {
  console.error('❌ Error creating Supabase client:', error.message);
  supabase = null;
}

// Test the connection
async function testConnection() {
  // If supabase client wasn't created, return false
  if (!supabase) {
    return false;
  }
  
  try {
    // Try to fetch from the settings table as a connection test
    const { data, error } = await supabase
      .from('settings')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Error connecting to Supabase:', error.message);
      return false;
    }
    
    console.log('✅ Successfully connected to Supabase database');
    return true;
  } catch (err) {
    console.error('❌ Unexpected error testing Supabase connection:', err.message);
    return false;
  }
}

// Run test connection only in local development
if (!isVercel && supabase) {
  testConnection();
}

module.exports = { supabase, testConnection };