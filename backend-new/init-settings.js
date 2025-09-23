const { supabase } = require('./supabaseClient');

async function initSettings() {
  try {
    console.log('Initializing settings table...');
    
    // Check if settings record already exists
    const { data: existingSettings, error: selectError } = await supabase
      .from('settings')
      .select('id')
      .eq('id', 1)
      .single();
    
    if (selectError && selectError.code !== 'PGRST116') {
      throw new Error(`Error checking existing settings: ${selectError.message}`);
    }
    
    if (existingSettings) {
      console.log('Settings record already exists with ID:', existingSettings.id);
      return;
    }
    
    // Create initial settings record
    const { data, error: insertError } = await supabase
      .from('settings')
      .insert([
        {
          id: 1,
          tax_rate: 5.00,
          currency: 'AED',
          business_name: 'TallyPrime Café',
          business_address: 'Shop 123, Marina Mall, Dubai Marina, Dubai, UAE',
          business_phone: '+971 4 123 4567',
          barcode_scanner_enabled: true
        }
      ])
      .select()
      .single();
    
    if (insertError) {
      throw new Error(`Error creating settings record: ${insertError.message}`);
    }
    
    console.log('✅ Settings record created successfully!');
    console.log('Settings ID:', data.id);
  } catch (error) {
    console.error('❌ Error initializing settings:', error.message);
  }
}

initSettings();