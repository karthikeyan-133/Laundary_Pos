/**
 * Script to check admin user status in the database
 */

const db = require('./mysqlDb');

async function checkAdminStatus() {
  try {
    console.log('Checking admin status...');
    
    // Check if settings table exists and has data
    const settings = await db.query('SELECT * FROM settings WHERE id = 1');
    
    if (settings.length === 0) {
      console.log('❌ No settings found in database');
      console.log('You need to initialize the database first.');
      console.log('Run: npm run create-tables');
      return;
    }
    
    const setting = settings[0];
    console.log('Settings found:');
    console.log('- Admin username:', setting.admin_username || 'Not set');
    console.log('- Admin email:', setting.admin_email || 'Not set');
    console.log('- Password hash:', setting.admin_password_hash ? 'Set' : 'Not set');
    console.log('- Business name:', setting.business_name || 'Not set');
    
    if (setting.admin_username && setting.admin_password_hash) {
      console.log('✅ Admin user is set up');
      console.log('You can sign in with username:', setting.admin_username);
    } else {
      console.log('❌ Admin user is not set up');
      console.log('You need to sign up first using the /api/auth/signup endpoint');
    }
    
  } catch (error) {
    console.error('Error checking admin status:', error.message);
    if (error.message.includes('ER_NO_SUCH_TABLE')) {
      console.log('❌ Settings table does not exist');
      console.log('Run: npm run create-tables');
    }
  }
}

checkAdminStatus();