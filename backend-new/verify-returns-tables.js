const supabase = require('./supabaseClient');

async function verifyReturnsTables() {
  console.log('Checking if returns tables exist in Supabase...');
  
  try {
    // Check if returns table exists
    console.log('Checking returns table...');
    const { data: returnsData, error: returnsError } = await supabase
      .from('returns')
      .select('id')
      .limit(1);
    
    if (returnsError) {
      console.log('Returns table error:', returnsError.message);
      if (returnsError.message.includes('relation "returns" does not exist')) {
        console.log('❌ Returns table does not exist');
      } else {
        console.log('Returns table exists but has an error');
      }
    } else {
      console.log('✅ Returns table exists and is accessible');
    }
    
    // Check if return_items table exists
    console.log('Checking return_items table...');
    const { data: returnItemsData, error: returnItemsError } = await supabase
      .from('return_items')
      .select('id')
      .limit(1);
    
    if (returnItemsError) {
      console.log('Return items table error:', returnItemsError.message);
      if (returnItemsError.message.includes('relation "return_items" does not exist')) {
        console.log('❌ Return items table does not exist');
      } else {
        console.log('Return items table exists but has an error');
      }
    } else {
      console.log('✅ Return items table exists and is accessible');
    }
    
    console.log('\nIf tables do not exist, please create them using the SQL commands from schema.sql');
    
  } catch (err) {
    console.error('Error checking returns tables:', err);
  }
}

// Run the function
verifyReturnsTables();