import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Banknote } from 'lucide-react';

interface OpeningCashPopupProps {
  isOpen: boolean;
  onSubmit: (amount: number) => void;
}

export function OpeningCashPopup({ isOpen, onSubmit }: OpeningCashPopupProps) {
  const [amount, setAmount] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!isNaN(numericAmount) && numericAmount >= 0) {
      onSubmit(numericAmount);
      setAmount('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Opening Cash Balance
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="opening-cash">Enter today's opening cash balance</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                AED
              </span>
              <Input
                id="opening-cash"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-12"
                autoFocus
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              type="submit"
              disabled={!amount || isNaN(parseFloat(amount)) || parseFloat(amount) < 0}
            >
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}