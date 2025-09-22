const { query } = require('./mysqlDb');

async function clearAdmin() {
  try {
    console.log('Clearing admin credentials from the settings table...');
    
    // Clear the admin credentials in the settings table
    await query(
      'UPDATE settings SET admin_username = NULL, admin_email = NULL, admin_password_hash = NULL WHERE id = 1'
    );
    
    console.log('✅ Admin credentials cleared successfully!');
    console.log('You can now signup with new admin credentials.');
  } catch (error) {
    console.error('Error clearing admin credentials:', error);
  }
}

clearAdmin();