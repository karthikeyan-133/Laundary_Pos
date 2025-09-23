const { supabase } = require('./supabaseClient');

async function clearTestAdmin() {
  try {
    console.log('Clearing test admin credentials...');
    
    // Clear the admin credentials in the settings table
    const { data, error } = await supabase
      .from('settings')
      .update({
        admin_username: null,
        admin_email: null,
        admin_password_hash: null
      })
      .eq('id', 1)
      .select();
    
    if (error) {
      throw new Error(error.message);
    }
    
    console.log('✅ Test admin credentials cleared successfully!');
    console.log('You can now signup with your own admin credentials through the signup page.');
  } catch (error) {
    console.error('Error clearing test admin credentials:', error);
  }
}

clearTestAdmin();