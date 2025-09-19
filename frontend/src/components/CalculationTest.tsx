import React, { useState } from 'react';
import { usePOSStore } from '@/hooks/usePOSStore';

const CalculationTest: React.FC = () => {
  const { 
    products, 
    cart, 
    addToCart, 
    updateCartItemQuantity, 
    updateCartItemDiscount, 
    calculateTotals,
    clearCart
  } = usePOSStore();
  
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      // Clear cart first
      clearCart();
      
      // Test 1: Add items to cart
      const testResultsArray: string[] = [];
      
      testResultsArray.push('Test 1: Adding items to cart...');
      if (products.length > 0) {
        const product = products[0];
        addToCart(product, 'iron', 2);
        testResultsArray.push(`Added 2x ${product.name} (iron service) to cart`);
      }
      
      if (products.length > 1) {
        const product = products[1];
        addToCart(product, 'washAndIron', 1);
        testResultsArray.push(`Added 1x ${product.name} (washAndIron service) to cart`);
      }
      
      // Check cart contents
      testResultsArray.push(`Cart now has ${cart.length} items`);
      
      // Test 2: Update quantity
      testResultsArray.push('Test 2: Updating item quantity...');
      if (cart.length > 0) {
        const firstItem = cart[0];
        const oldQuantity = firstItem.quantity;
        const oldSubtotal = firstItem.subtotal;
        updateCartItemQuantity(firstItem.id, 3);
        testResultsArray.push(`Updated quantity from ${oldQuantity} to 3`);
        testResultsArray.push(`Subtotal changed from ${oldSubtotal} to ${cart[0]?.subtotal || 'N/A'}`);
      }
      
      // Test 3: Apply discount
      testResultsArray.push('Test 3: Applying discount...');
      if (cart.length > 0) {
        const firstItem = cart[0];
        const oldSubtotal = firstItem.subtotal;
        updateCartItemDiscount(firstItem.id, 10); // 10% discount
        testResultsArray.push(`Applied 10% discount to item`);
        testResultsArray.push(`Subtotal changed from ${oldSubtotal} to ${cart[0]?.subtotal || 'N/A'}`);
      }
      
      // Test 4: Calculate totals
      testResultsArray.push('Test 4: Calculating cart totals...');
      const totals = calculateTotals();
      testResultsArray.push(`Subtotal: ${totals.subtotal}`);
      testResultsArray.push(`Discount: ${totals.discount}`);
      testResultsArray.push(`Tax: ${totals.tax}`);
      testResultsArray.push(`Total: ${totals.total}`);
      
      // Test 5: Verify calculations
      testResultsArray.push('Test 5: Verifying calculations...');
      let calculationCorrect = true;
      
      // Check if item subtotals are calculated correctly
      cart.forEach(item => {
        let expectedPrice = 0;
        switch (item.service) {
          case 'iron':
            expectedPrice = item.product.ironRate;
            break;
          case 'washAndIron':
            expectedPrice = item.product.washAndIronRate;
            break;
          case 'dryClean':
            expectedPrice = item.product.dryCleanRate;
            break;
        }
        
        const expectedSubtotal = item.quantity * expectedPrice * (1 - item.discount / 100);
        if (Math.abs(item.subtotal - expectedSubtotal) > 0.01) {
          calculationCorrect = false;
          testResultsArray.push(`❌ Item subtotal incorrect for ${item.product.name}: expected ${expectedSubtotal}, got ${item.subtotal}`);
        }
      });
      
      // Check if cart totals are calculated correctly
      const expectedSubtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
      if (Math.abs(totals.subtotal - expectedSubtotal) > 0.01) {
        calculationCorrect = false;
        testResultsArray.push(`❌ Cart subtotal incorrect: expected ${expectedSubtotal}, got ${totals.subtotal}`);
      }
      
      const expectedTotal = expectedSubtotal + (expectedSubtotal * 0.05); // Assuming 5% tax
      if (Math.abs(totals.total - expectedTotal) > 0.01) {
        calculationCorrect = false;
        testResultsArray.push(`❌ Cart total incorrect: expected ${expectedTotal}, got ${totals.total}`);
      }
      
      if (calculationCorrect) {
        testResultsArray.push('✅ All calculations are correct!');
      }
      
      setTestResults(testResultsArray);
    } catch (error) {
      setTestResults([`❌ Error running tests: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Calculation Test</h2>
      
      <div className="mb-4">
        <button 
          onClick={runTests}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isRunning ? 'Running Tests...' : 'Run Calculation Tests'}
        </button>
      </div>
      
      {testResults.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Test Results:</h3>
          <ul className="list-disc pl-5 space-y-1">
            {testResults.map((result, index) => (
              <li key={index} className={result.includes('✅') ? 'text-green-600' : result.includes('❌') ? 'text-red-600' : ''}>
                {result}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {cart.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Current Cart:</h3>
          <ul className="list-disc pl-5 space-y-1">
            {cart.map(item => (
              <li key={item.id}>
                {item.product.name} ({item.service}) - Qty: {item.quantity}, Discount: {item.discount}%, Subtotal: {item.subtotal}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CalculationTest;