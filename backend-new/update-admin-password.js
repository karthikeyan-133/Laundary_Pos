const bcrypt = require('bcryptjs');
const { query } = require('./mysqlDb');

async function updateAdminPassword() {
  try {
    const password = 'admin123';
    const saltRounds = 10;
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('New hash for "admin123":', hashedPassword);
    
    // Update the admin password in the database
    await query(
      'UPDATE settings SET admin_password_hash = ? WHERE id = 1',
      [hashedPassword]
    );
    
    console.log('✅ Admin password updated successfully!');
  } catch (error) {
    console.error('Error updating admin password:', error);
  }
}

updateAdminPassword();