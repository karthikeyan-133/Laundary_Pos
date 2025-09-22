const { query } = require('./mysqlDb');

async function checkAdminCredentials() {
  try {
    console.log('Checking admin credentials in the database...');
    
    const result = await query('SELECT admin_username, admin_email, admin_password_hash FROM settings WHERE id = 1');
    
    if (result.length > 0) {
      console.log('Admin credentials found:');
      console.log('Username:', result[0].admin_username);
      console.log('Email:', result[0].admin_email);
      console.log('Password hash:', result[0].admin_password_hash);
    } else {
      console.log('No admin credentials found in the settings table.');
    }
  } catch (error) {
    console.error('Error checking admin credentials:', error);
  }
}

checkAdminCredentials();