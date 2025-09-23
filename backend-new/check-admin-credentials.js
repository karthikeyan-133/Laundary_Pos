const { supabase } = require('./supabaseClient');

async function checkAdminCredentials() {
  try {
    console.log('Checking admin credentials in the database...');
    
    const { data: result, error } = await supabase
      .from('settings')
      .select('admin_username, admin_email, admin_password_hash')
      .eq('id', 1)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }
    
    if (result) {
      console.log('Admin credentials found:');
      console.log('Username:', result.admin_username);
      console.log('Email:', result.admin_email);
      console.log('Password hash:', result.admin_password_hash);
    } else {
      console.log('No admin credentials found in the settings table.');
    }
  } catch (error) {
    console.error('Error checking admin credentials:', error);
  }
}

checkAdminCredentials();