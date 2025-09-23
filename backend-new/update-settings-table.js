const { supabase } = require('./supabaseClient');

async function updateSettingsTable() {
  try {
    console.log('Updating settings table with missing columns...');
    
    // First, let's check what columns currently exist
    const { data: currentData, error: currentError } = await supabase
      .from('settings')
      .select('*')
      .limit(1);
    
    if (currentError) {
      console.error('Error querying current settings table:', currentError);
      return;
    }
    
    console.log('Current settings table structure:', currentData[0] || 'No data');
    
    // Check if the required columns exist
    const currentColumns = currentData[0] ? Object.keys(currentData[0]) : [];
    const requiredColumns = ['admin_username', 'admin_email', 'admin_password_hash'];
    const missingColumns = requiredColumns.filter(col => !currentColumns.includes(col));
    
    if (missingColumns.length === 0) {
      console.log('All required columns already exist in settings table');
      return;
    }
    
    console.log('Missing columns:', missingColumns);
    
    // For Supabase, we need to add columns through the dashboard or by running SQL
    // Since we can't directly alter tables through the JS client, we'll need to
    // use the Supabase SQL editor to run the ALTER TABLE statements
    
    console.log('Please run the following SQL in your Supabase SQL editor:');
    missingColumns.forEach(column => {
      console.log(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS ${column} TEXT;`);
    });
    
    // If the settings table is empty, let's insert a default row
    if (!currentData[0]) {
      console.log('Inserting default settings row...');
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

updateSettingsTable();