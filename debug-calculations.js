const { default: fetch } = require('node-fetch');

async function debugCalculations() {
  try {
    // Get settings
    const settingsResponse = await fetch('http://localhost:3001/api/settings');
    const settings = await settingsResponse.json();
    console.log('Raw settings from API:', settings);
    console.log('Tax rate type:', typeof settings.tax_rate);
    console.log('Tax rate value:', settings.tax_rate);
    
    // Convert tax rate properly
    const taxRate = typeof settings.tax_rate === 'string' ? parseFloat(settings.tax_rate) : settings.tax_rate;
    console.log('Converted tax rate:', taxRate);
    console.log('Converted tax rate type:', typeof taxRate);
    
    // Test calculation with sample values
    const subtotal = 100.00;
    console.log('Subtotal:', subtotal);
    
    const tax = subtotal * (taxRate / 100);
    console.log('Calculated tax:', tax);
    
    const total = subtotal + tax;
    console.log('Calculated total:', total);
    
    // Test with actual cart calculation
    const cart = [
      { quantity: 2, product: { price: 15.00 }, discount: 0 },
      { quantity: 1, product: { price: 8.00 }, discount: 0 }
    ];
    
    const cartSubtotal = cart.reduce((sum, item) => sum + (item.quantity * item.product.price), 0);
    console.log('Cart subtotal:', cartSubtotal);
    
    const cartTax = cartSubtotal * (taxRate / 100);
    console.log('Cart tax:', cartTax);
    
    const cartTotal = cartSubtotal + cartTax;
    console.log('Cart total:', cartTotal);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugCalculations();