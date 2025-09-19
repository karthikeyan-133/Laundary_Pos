// Import Supabase with error handling
let createClient;
try {
  ({ createClient } = require('@supabase/supabase-js'));
} catch (error) {
  console.error('Failed to import @supabase/supabase-js:', error);
  console.error('Please ensure the package is installed by running "npm install" in the root directory');
  process.exit(1);
}

const path = require('path');
const dotenv = require('dotenv');

// Check if we're running on Vercel
const isVercel = !!process.env.VERCEL;

// Load environment variables only in local development
if (!isVercel) {
  const envPath = path.resolve(__dirname, '.env');
  dotenv.config({ path: envPath });
  console.log('Environment: Local Development');
  console.log('Loaded environment variables:');
  console.log('- SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'NOT SET');
  console.log('- SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'SET' : 'NOT SET');
} else {
  console.log('Environment: Vercel');
  console.log('Vercel environment variables:');
  console.log('- SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'NOT SET');
  console.log('- SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'SET' : 'NOT SET');
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
    console.log('Go to your Vercel dashboard -> Settings -> Environment Variables');
    console.log('Add SUPABASE_URL and SUPABASE_KEY with your Supabase project credentials');
  }
  // Don't exit in Vercel as it might cause deployment issues
  if (!isVercel) {
    process.exit(1);
  }
}

// Create a Supabase client (only if we have the required variables)
let supabase;
if (supabaseUrl && supabaseKey) {
  try {
    // Validate that the URL is valid
    if (supabaseUrl !== 'your_supabase_project_url_here' && supabaseUrl.startsWith('http')) {
      console.log('Creating Supabase client with URL:', supabaseUrl);
      supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false
        }
      });
      console.log('Supabase client created successfully');
    } else {
      console.error('Invalid Supabase URL:', supabaseUrl);
      supabase = null;
    }
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    supabase = null;
  }
} else {
  supabase = null;
}

// If Supabase client couldn't be created, create a mock client
if (!supabase) {
  // Create a mock client for environments where variables aren't set
  const createMockQuery = () => ({
    select: () => createMockQuery(),
    insert: () => createMockQuery(),
    update: () => createMockQuery(),
    delete: () => createMockQuery(),
    eq: () => createMockQuery(),
    limit: () => createMockQuery(),
    single: () => createMockQuery(),
    from: () => createMockQuery()
  });
  
  supabase = {
    from: () => ({
      select: () => createMockQuery(),
      insert: () => createMockQuery(),
      update: () => createMockQuery(),
      delete: () => createMockQuery(),
      eq: () => createMockQuery(),
      limit: () => createMockQuery(),
      single: () => createMockQuery()
    })
  };
  console.warn('⚠️  Supabase client not properly configured - using mock client');
}

// Test the connection
async function testConnection() {
  try {
    if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your_supabase_project_url_here') {
      console.log('⚠️  Supabase not configured - skipping connection test');
      return;
    }
    
    if (!supabase) {
      console.log('⚠️  Supabase client not created - skipping connection test');
      return;
    }
    
    // Skip test for mock client
    if (!supabaseUrl.startsWith('http')) {
      console.log('⚠️  Using mock client - skipping connection test');
      return;
    }
    
    console.log('Testing Supabase connection...');
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