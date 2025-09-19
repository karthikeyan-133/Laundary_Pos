import React from 'react';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CartItem } from '@/types/pos';

interface CartProps {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onUpdateDiscount: (itemId: string, discount: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
}

export function Cart({
  items,
  subtotal,
  tax,
  total,
  onUpdateQuantity,
  onUpdateDiscount,
  onRemoveItem,
  onClearCart
}: CartProps) {
  // Function to get service name for display
  const getServiceName = (service: 'iron' | 'washAndIron' | 'dryClean') => {
    switch (service) {
      case 'iron': return 'Iron';
      case 'washAndIron': return 'Wash & Iron';
      case 'dryClean': return 'Dry Clean';
      default: return service;
    }
  };

  // Function to get service rate
  const getServiceRate = (item: CartItem) => {
    switch (item.service) {
      case 'iron': return item.product.ironRate || 0;
      case 'washAndIron': return item.product.washAndIronRate || 0;
      case 'dryClean': return item.product.dryCleanRate || 0;
      default: return 0;
    }
  };

  if (items.length === 0) {
    return (
      <Card className="h-full bg-card border-border">
        <CardContent className="flex flex-col items-center justify-center h-64">
          <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Cart is empty</p>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Add products to start creating an order
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-card-foreground">
            Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onClearCart}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Cart Items */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {items.map((item) => (
            <div 
              key={item.id}
              className="p-3 bg-muted/30 rounded-lg border border-border"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-card-foreground">{item.product.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {getServiceName(item.service)} - AED {getServiceRate(item).toFixed(2)} each
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRemoveItem(item.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 p-1 h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-card-foreground">
                      AED {item.subtotal.toFixed(2)}
                    </div>
                    {item.discount > 0 && (
                      <div className="text-xs text-warning">
                        -{item.discount}% discount
                      </div>
                    )}
                  </div>
                </div>

                {/* Discount Input */}
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-muted-foreground min-w-0 flex-shrink-0">
                    Discount %:
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={item.discount}
                    onChange={(e) => onUpdateDiscount(item.id, Number(e.target.value))}
                    className="h-8 text-sm"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Totals */}
        <div className="border-t border-border pt-4 space-y-2">
          <div className="flex justify-between text-card-foreground">
            <span>Subtotal:</span>
            <span className="font-medium">AED {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-card-foreground">
            <span>Tax:</span>
            <span className="font-medium text-pos-tax">AED {tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-pos-total border-t border-border pt-2">
            <span>Total:</span>
            <span>AED {total.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}