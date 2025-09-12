// Debug script to check settings data flow
fetch('http://localhost:3001/api/settings')
  .then(response => response.json())
  .then(rawSettings => {
    console.log('Raw settings from API:', rawSettings);
    console.log('Tax rate type:', typeof rawSettings.tax_rate);
    console.log('Tax rate value:', rawSettings.tax_rate);
    
    // Simulate frontend conversion
    const convertedTaxRate = typeof rawSettings.tax_rate === 'string' ? parseFloat(rawSettings.tax_rate) : rawSettings.tax_rate;
    console.log('Converted tax rate:', convertedTaxRate);
    console.log('Converted tax rate type:', typeof convertedTaxRate);
    
    // Simulate calculation
    const subtotal = 100;
    const tax = subtotal * (convertedTaxRate / 100);
    const total = subtotal + tax;
    
    console.log('Subtotal:', subtotal);
    console.log('Calculated tax:', tax);
    console.log('Calculated total:', total);
  })
  .catch(error => {
    console.error('Error fetching settings:', error);
  });