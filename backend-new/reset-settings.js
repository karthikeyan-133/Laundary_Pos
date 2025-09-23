const { supabase } = require('./supabaseClient');

async function resetSettings() {
  try {
    console.log('Resetting all settings table data to initial state...');
    
    // Reset all settings to NULL/empty values except for the id
    const { data, error } = await supabase
      .from('settings')
      .update({
        tax_rate: null,
        currency: null,
        business_name: null,
        business_address: null,
        business_phone: null,
        barcode_scanner_enabled: null,
        admin_username: null,
        admin_email: null,
        admin_password_hash: null
      })
      .eq('id', 1)
      .select();
    
    if (error) {
      throw new Error(error.message);
    }
    
    console.log('✅ Settings table reset successfully!');
    console.log('All business details and admin credentials have been cleared.');
    console.log('You can now create new company details and admin through the signup form.');
  } catch (error) {
    console.error('Error resetting settings table:', error);
  }
}

resetSettings();