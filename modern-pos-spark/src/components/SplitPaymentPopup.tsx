import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Banknote, CreditCard } from 'lucide-react';

interface SplitPaymentPopupProps {
  isOpen: boolean;
  totalAmount: number;
  currency: string;
  onClose: () => void;
  onConfirm: (cashAmount: number, cardAmount: number) => void;
}

export function SplitPaymentPopup({ isOpen, totalAmount, currency, onClose, onConfirm }: SplitPaymentPopupProps) {
  const [cashAmount, setCashAmount] = useState<string>('');
  const [cardAmount, setCardAmount] = useState<string>('');
  
  // Reset amounts when popup opens
  useEffect(() => {
    if (isOpen) {
      setCashAmount('');
      setCardAmount('');
    }
  }, [isOpen]);

  // Calculate the remaining amount when one field is updated
  const handleCashChange = (value: string) => {
    setCashAmount(value);
    
    if (value && !isNaN(parseFloat(value))) {
      const cash = parseFloat(value);
      const remaining = totalAmount - cash;
      setCardAmount(remaining >= 0 ? remaining.toFixed(2) : '0.00');
    } else if (!value) {
      setCardAmount('');
    }
  };

  const handleCardChange = (value: string) => {
    setCardAmount(value);
    
    if (value && !isNaN(parseFloat(value))) {
      const card = parseFloat(value);
      const remaining = totalAmount - card;
      setCashAmount(remaining >= 0 ? remaining.toFixed(2) : '0.00');
    } else if (!value) {
      setCashAmount('');
    }
  };

  const handleConfirm = () => {
    const cash = parseFloat(cashAmount) || 0;
    const card = parseFloat(cardAmount) || 0;
    
    // Validate that the amounts sum to the total
    if (Math.abs(cash + card - totalAmount) < 0.01) { // Allow for floating point precision issues
      onConfirm(cash, card);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            <Banknote className="h-5 w-5" />
            Split Payment
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="text-center text-lg font-semibold">
            Total Amount: {currency} {totalAmount.toFixed(2)}
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cash" className="flex items-center gap-2">
                  <Banknote className="h-4 w-4" />
                  Cash Amount
                </Label>
                <Input
                  id="cash"
                  type="number"
                  step="0.01"
                  min="0"
                  value={cashAmount}
                  onChange={(e) => handleCashChange(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="card" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Card Amount
                </Label>
                <Input
                  id="card"
                  type="number"
                  step="0.01"
                  min="0"
                  value={cardAmount}
                  onChange={(e) => handleCardChange(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Enter amount for one payment method, and the other will be calculated automatically.
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!cashAmount && !cardAmount}>
            Confirm Split Payment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}