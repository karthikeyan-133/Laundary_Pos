const { supabase } = require('./backend/supabaseDb');

async function testSettings() {
  try {
    console.log('Fetching settings from Supabase...');
    
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error fetching settings:', error);
      return;
    }
    
    console.log('Settings data:', JSON.stringify(data, null, 2));
    
    if (data && data.length > 0) {
      const settings = data[0];
      console.log('Tax rate:', settings.tax_rate, 'Type:', typeof settings.tax_rate);
      console.log('Currency:', settings.currency);
      console.log('Business name:', settings.business_name);
    } else {
      console.log('No settings found in database');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

testSettings();