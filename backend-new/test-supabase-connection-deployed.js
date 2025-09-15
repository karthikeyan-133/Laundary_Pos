// Test Supabase connection in deployed environment
const supabase = require('./supabaseClient');

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  console.log('Supabase URL:', process.env.SUPABASE_URL);
  console.log('Running on Vercel:', !!process.env.VERCEL);
  
  try {
    // Test a simple query to see if we can connect
    const { data, error } = await supabase
      .from('settings')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('❌ Connection test failed:');
      console.log('Error:', error.message);
      return;
    }
    
    console.log('✅ Connection test successful');
    console.log('Settings data:', data);
    
    // Test returns table
    console.log('Testing returns table access...');
    const { data: returnsData, error: returnsError } = await supabase
      .from('returns')
      .select('id')
      .limit(1);
    
    if (returnsError) {
      console.log('❌ Returns table access failed:');
      console.log('Error:', returnsError.message);
    } else {
      console.log('✅ Returns table access successful');
      console.log('Returns data:', returnsData);
    }
    
    // Test return_items table
    console.log('Testing return_items table access...');
    const { data: returnItemsData, error: returnItemsError } = await supabase
      .from('return_items')
      .select('id')
      .limit(1);
    
    if (returnItemsError) {
      console.log('❌ Return items table access failed:');
      console.log('Error:', returnItemsError.message);
    } else {
      console.log('✅ Return items table access successful');
      console.log('Return items data:', returnItemsData);
    }
    
  } catch (err) {
    console.error('❌ Test failed with exception:', err);
  }
}

// Run the test
testSupabaseConnection();