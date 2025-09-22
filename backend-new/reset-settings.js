const { query } = require('./mysqlDb');

async function resetSettings() {
  try {
    console.log('Resetting all settings table data to initial state...');
    
    // Reset all settings to NULL/empty values except for the id
    await query(
      `UPDATE settings SET 
        tax_rate = NULL,
        currency = NULL,
        business_name = NULL,
        business_address = NULL,
        business_phone = NULL,
        barcode_scanner_enabled = NULL,
        admin_username = NULL,
        admin_email = NULL,
        admin_password_hash = NULL
      WHERE id = 1`
    );
    
    console.log('✅ Settings table reset successfully!');
    console.log('All business details and admin credentials have been cleared.');
    console.log('You can now create new company details and admin through the signup form.');
  } catch (error) {
    console.error('Error resetting settings table:', error);
  }
}

resetSettings();