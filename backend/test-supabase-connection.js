const { supabase } = require('./supabaseDb');

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test basic connection by getting the Supabase URL
    console.log('Supabase URL:', supabase.supabaseUrl);
    
    // Test a simple query to see if we can connect
    const { data, error } = await supabase
      .from('settings')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('⚠️  Connection test result: Unable to query tables');
      console.log('This is expected if tables do not exist yet');
      console.log('Error details:', error.message);
    } else {
      console.log('✅ Connection test result: Successfully connected to Supabase');
      console.log('Settings table exists with', data.length, 'records');
    }
    
    console.log('\n✅ Supabase connection test completed!');
    console.log('\nNext steps:');
    console.log('1. Create the required tables in your Supabase dashboard');
    console.log('2. Run "npm run init-supabase" to initialize the database');
    console.log('3. Start your server with "npm start"');
    
  } catch (err) {
    console.error('❌ Error testing Supabase connection:', err);
  }
}

// Run the test
testSupabaseConnection();