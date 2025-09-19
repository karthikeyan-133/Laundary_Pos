import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export function CalculationDebug() {
  // Test data
  const [testData, setTestData] = useState({
    quantity: '2',
    ironRate: '15.50',
    washAndIronRate: '25.00',
    dryCleanRate: '35.75',
    discount: '10',
    service: 'iron'
  });

  const [results, setResults] = useState({
    price: 0,
    subtotal: 0,
    discountedSubtotal: 0
  });

  const calculate = () => {
    const quantity = parseFloat(testData.quantity) || 0;
    const ironRate = parseFloat(testData.ironRate) || 0;
    const washAndIronRate = parseFloat(testData.washAndIronRate) || 0;
    const dryCleanRate = parseFloat(testData.dryCleanRate) || 0;
    const discount = parseFloat(testData.discount) || 0;
    
    let price = 0;
    switch (testData.service) {
      case 'iron':
        price = ironRate;
        break;
      case 'washAndIron':
        price = washAndIronRate;
        break;
      case 'dryClean':
        price = dryCleanRate;
        break;
    }
    
    const subtotal = quantity * price;
    const discountedSubtotal = subtotal * (1 - discount / 100);
    
    setResults({
      price,
      subtotal,
      discountedSubtotal
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calculation Debug</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                value={testData.quantity}
                onChange={(e) => setTestData({...testData, quantity: e.target.value})}
              />
            </div>
            <div>
              <Label>Service</Label>
              <select
                value={testData.service}
                onChange={(e) => setTestData({...testData, service: e.target.value})}
                className="w-full p-2 border rounded"
              >
                <option value="iron">Iron</option>
                <option value="washAndIron">Wash & Iron</option>
                <option value="dryClean">Dry Clean</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Iron Rate</Label>
              <Input
                type="number"
                value={testData.ironRate}
                onChange={(e) => setTestData({...testData, ironRate: e.target.value})}
              />
            </div>
            <div>
              <Label>Wash & Iron Rate</Label>
              <Input
                type="number"
                value={testData.washAndIronRate}
                onChange={(e) => setTestData({...testData, washAndIronRate: e.target.value})}
              />
            </div>
            <div>
              <Label>Dry Clean Rate</Label>
              <Input
                type="number"
                value={testData.dryCleanRate}
                onChange={(e) => setTestData({...testData, dryCleanRate: e.target.value})}
              />
            </div>
          </div>
          
          <div>
            <Label>Discount (%)</Label>
            <Input
              type="number"
              value={testData.discount}
              onChange={(e) => setTestData({...testData, discount: e.target.value})}
            />
          </div>
          
          <Button onClick={calculate}>Calculate</Button>
          
          <div className="space-y-2 p-4 bg-muted rounded">
            <h3 className="font-bold">Results:</h3>
            <p>Price: AED {results.price.toFixed(2)}</p>
            <p>Subtotal: AED {results.subtotal.toFixed(2)}</p>
            <p>Discounted Subtotal: AED {results.discountedSubtotal.toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}