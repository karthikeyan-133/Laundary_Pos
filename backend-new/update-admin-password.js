const bcrypt = require('bcryptjs');
const { supabase } = require('./supabaseClient');

async function updateAdminPassword() {
  try {
    const password = 'admin123';
    const saltRounds = 10;
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('New hash for "admin123":', hashedPassword);
    
    // Update the admin password in the database
    const { data, error } = await supabase
      .from('settings')
      .update({ admin_password_hash: hashedPassword })
      .eq('id', 1)
      .select();
    
    if (error) {
      throw new Error(error.message);
    }
    
    console.log('✅ Admin password updated successfully!');
  } catch (error) {
    console.error('Error updating admin password:', error);
  }
}

updateAdminPassword();