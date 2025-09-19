import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/types/pos';

interface ServiceSelectionPopupProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, service: 'iron' | 'washAndIron' | 'dryClean', quantity: number) => void;
}

export function ServiceSelectionPopup({ product, isOpen, onClose, onAddToCart }: ServiceSelectionPopupProps) {
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const handleAddToCart = (service: 'iron' | 'washAndIron' | 'dryClean') => {
    onAddToCart(product, service, quantity);
    onClose();
    setQuantity(1); // Reset quantity for next selection
  };

  const getServiceRate = (service: 'iron' | 'washAndIron' | 'dryClean') => {
    switch (service) {
      case 'iron': return product.ironRate;
      case 'washAndIron': return product.washAndIronRate;
      case 'dryClean': return product.dryCleanRate;
      default: return 0;
    }
  };

  const getServiceName = (service: 'iron' | 'washAndIron' | 'dryClean') => {
    switch (service) {
      case 'iron': return 'Iron';
      case 'washAndIron': return 'Wash & Iron';
      case 'dryClean': return 'Dry Clean';
      default: return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Select Service for {product.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Quantity:</span>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </Button>
              <span className="w-10 text-center">{quantity}</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Card 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleAddToCart('iron')}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Iron</h3>
                    <p className="text-sm text-muted-foreground">Basic ironing service</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">AED {(product.ironRate || 0).toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">per item</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleAddToCart('washAndIron')}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Wash & Iron</h3>
                    <p className="text-sm text-muted-foreground">Full wash and iron service</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">AED {(product.washAndIronRate || 0).toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">per item</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleAddToCart('dryClean')}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Dry Clean</h3>
                    <p className="text-sm text-muted-foreground">Professional dry cleaning</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">AED {(product.dryCleanRate || 0).toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">per item</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Button variant="outline" onClick={onClose} className="w-full">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}