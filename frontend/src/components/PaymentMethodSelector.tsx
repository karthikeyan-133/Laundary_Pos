import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, 
  Banknote, 
  Wallet,
  Split
} from 'lucide-react';
import { Order } from '@/types/pos';
import { SplitPaymentPopup } from '@/components/SplitPaymentPopup';

interface PaymentMethodSelectorProps {
  selectedMethod: Order['paymentMethod'];
  onMethodChange: (method: Order['paymentMethod']) => void;
  onConfirm: () => void;
  totalAmount: number;
  currency: string;
}

export function PaymentMethodSelector({ 
  selectedMethod, 
  onMethodChange, 
  onConfirm,
  totalAmount,
  currency
}: PaymentMethodSelectorProps) {
  const [showSplitPayment, setShowSplitPayment] = useState(false);

  const handleMethodChange = (method: Order['paymentMethod']) => {
    // If user selects "both", show split payment popup
    if (method === 'both') {
      setShowSplitPayment(true);
    } else {
      onMethodChange(method);
    }
  };

  const handleSplitPaymentConfirm = (cashAmount: number, cardAmount: number) => {
    setShowSplitPayment(false);
    onMethodChange('both');
    // In a real implementation, you might want to store the split amounts
    onConfirm();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant={selectedMethod === 'cash' ? 'default' : 'outline'}
          onClick={() => handleMethodChange('cash')}
          className="flex flex-col items-center justify-center h-30"
        >
          <Banknote className="h-6 w-6 mb-2" />
          <span>Cash</span>
        </Button>
        
        <Button
          variant={selectedMethod === 'card' ? 'default' : 'outline'}
          onClick={() => handleMethodChange('card')}
          className="flex flex-col items-center justify-center h-30"
        >
          <Wallet className="h-6 w-6 mb-2" />
          <span>Card</span>
        </Button>
        
        <Button
          variant={selectedMethod === 'credit' ? 'default' : 'outline'}
          onClick={() => handleMethodChange('credit')}
          className="flex flex-col items-center justify-center h-30"
        >
          <CreditCard className="h-6 w-6 mb-2" />
          <span>Credit</span>
        </Button>
        
        <Button
          variant={selectedMethod === 'both' ? 'default' : 'outline'}
          onClick={() => handleMethodChange('both')}
          className="flex flex-col items-center justify-center h-30"
        >
          <Split className="h-6 w-6 mb-2" />
          <span>Split Payment</span>
        </Button>
      </div>
      
      <Button 
        onClick={onConfirm} 
        className="w-full"
        disabled={!selectedMethod}
      >
        Confirm Payment ({currency} {totalAmount.toFixed(2)})
      </Button>
      
      <SplitPaymentPopup
        isOpen={showSplitPayment}
        totalAmount={totalAmount}
        currency={currency}
        onClose={() => setShowSplitPayment(false)}
        onConfirm={handleSplitPaymentConfirm}
      />
    </div>
  );
}