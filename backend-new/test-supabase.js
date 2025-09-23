const { supabase } = require('./supabaseClient');

async function testSettingsTable() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test connection by querying the settings table
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error querying settings table:', error);
      return;
    }
    
    console.log('Settings table data:', data);
    
    // Check if the table exists and has the required columns
    if (data && data.length > 0) {
      console.log('Settings table exists and has data');
      console.log('Columns available:', Object.keys(data[0]));
    } else {
      console.log('Settings table is empty or does not exist');
      
      // Try to insert a default row
      const { data: insertData, error: insertError } = await supabase
        .from('settings')
        .insert([{ id: 1 }])
        .select();
      
      if (insertError) {
        console.error('Error inserting default row:', insertError);
      } else {
        console.log('Default row inserted:', insertData);
      }
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testSettingsTable();