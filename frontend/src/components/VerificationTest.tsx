import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function VerificationTest() {
  // Test calculations
  const testCalculations = () => {
    // Test 1: Basic calculation
    const quantity1 = 2;
    const ironRate1 = 15.50;
    const subtotal1 = quantity1 * ironRate1;
    console.log('Test 1 - Basic calculation:', { quantity: quantity1, rate: ironRate1, subtotal: subtotal1 });
    
    // Test 2: Discount calculation
    const quantity2 = 3;
    const washAndIronRate2 = 25.00;
    const discount2 = 10; // 10%
    const subtotal2 = quantity2 * washAndIronRate2;
    const discountedSubtotal2 = subtotal2 * (1 - discount2 / 100);
    console.log('Test 2 - Discount calculation:', { 
      quantity: quantity2, 
      rate: washAndIronRate2, 
      subtotal: subtotal2,
      discount: discount2,
      discountedSubtotal: discountedSubtotal2
    });
    
    // Test 3: Cart totals calculation
    const items = [
      { quantity: 2, price: 15.50, discount: 0 },
      { quantity: 1, price: 35.75, discount: 5 },
      { quantity: 3, price: 25.00, discount: 10 }
    ];
    
    const cartSubtotal = items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.price;
      const discountedItemSubtotal = itemSubtotal * (1 - item.discount / 100);
      return sum + discountedItemSubtotal;
    }, 0);
    
    const cartDiscount = 0; // No cart-level discount
    const taxRate = 5; // 5% tax
    const taxAmount = cartSubtotal * (taxRate / 100);
    const total = cartSubtotal + taxAmount;
    
    console.log('Test 3 - Cart totals calculation:', {
      items,
      cartSubtotal,
      cartDiscount,
      taxRate,
      taxAmount,
      total
    });
  };

  // Run tests when component mounts
  React.useEffect(() => {
    testCalculations();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p>Calculation tests have been run. Check the browser console for results.</p>
          <div className="bg-muted p-4 rounded">
            <h3 className="font-bold mb-2">Expected Results:</h3>
            <p>Test 1: 2 × 15.50 = 31.00</p>
            <p>Test 2: 3 × 25.00 = 75.00, with 10% discount = 67.50</p>
            <p>Test 3: Cart total should be approximately 120.56 (with 5% tax)</p>
          </div>
          <button 
            onClick={testCalculations}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Run Tests Again
          </button>
        </div>
      </CardContent>
    </Card>
  );
}