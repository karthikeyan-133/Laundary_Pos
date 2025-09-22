import React, { forwardRef } from 'react';
import { Printer, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Order, POSSettings } from '@/types/pos';

interface ReceiptProps {
  order: Order | null;
  settings: POSSettings;
  onPrint?: () => void;
  onDownload?: () => void;
  showActions?: boolean;
  isReturn?: boolean;
  returnItems?: Record<string, number>;
  returnReason?: string;
}

// Helper function to get service name
const getServiceName = (service: 'iron' | 'washAndIron' | 'dryClean') => {
  switch (service) {
    case 'iron': return 'Iron';
    case 'washAndIron': return 'Wash & Iron';
    case 'dryClean': return 'Dry Clean';
    default: return '';
  }
};

// Helper function to get service rate
const getServiceRate = (product: any, service: 'iron' | 'washAndIron' | 'dryClean') => {
  switch (service) {
    case 'iron': return product.ironRate || 0;
    case 'washAndIron': return product.washAndIronRate || 0;
    case 'dryClean': return product.dryCleanRate || 0;
    default: return 0;
  }
};

export const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(({
  order,
  settings,
  onPrint,
  onDownload,
  showActions = true,
  isReturn = false,
  returnItems = {},
  returnReason
}, ref) => {
  if (!order) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No receipt to display</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate return totals if this is a return receipt
  const calculateReturnTotals = () => {
    if (!isReturn) return { returnSubtotal: 0, returnTax: 0, returnTotal: 0 };
    
    let returnSubtotal = 0;
    let returnTax = 0;
    let returnTotal = 0;

    order.items.forEach(item => {
      const returnQuantity = returnItems[item.id] || 0;
      if (returnQuantity > 0) {
        const serviceRate = getServiceRate(item.product, item.service);
        const itemSubtotal = returnQuantity * serviceRate * (1 - item.discount / 100);
        
        // Calculate tax and totals for prices that already include tax
        const taxRate = settings.taxRate || 0;
        const taxMultiplier = taxRate / 100;
        const preTaxAmount = itemSubtotal / (1 + taxMultiplier);
        const itemTax = itemSubtotal - preTaxAmount;
        
        returnSubtotal += preTaxAmount;
        returnTax += itemTax;
        returnTotal += itemSubtotal;
      }
    });
    
    return { returnSubtotal, returnTax, returnTotal };
  };

  const { returnSubtotal, returnTax, returnTotal } = calculateReturnTotals();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Format date and time separately
  const formatDateOnly = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const formatTimeOnly = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-4">
      {showActions && (
        <div className="flex gap-2">
          <Button 
            onClick={onPrint}
            variant="outline" 
            className="flex-1"
          >
            <Printer className="h-4 w-4 mr-2" />
            {isReturn ? 'Print Return Receipt' : 'Print'}
          </Button>
          <Button 
            onClick={onDownload}
            variant="outline" 
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      )}

      <Card className="bg-pos-receipt border-border shadow-medium" ref={ref}>
        <CardContent className="p-4">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="font-bold text-lg">Prime Zone</div>
            <div className="text-sm">Address: A 126</div>
            <div className="text-sm">UAE 4582</div>
            <div className="text-sm">UAE</div>
            <div className="text-sm">TRN: 56556665</div>
            <div className="font-bold mt-1">{isReturn ? 'TAX RETURN' : 'TAX INVOICE'}</div>
          </div>

          <Separator className="my-2" />

          {/* Invoice Info */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div>
              <div>Invoice No: {order.id}</div>
              <div>Date: {formatDateOnly(order.createdAt)}</div>
              <div>Buyer: {order.customer?.name || 'Walk-in Customer'}</div>
              <div>TRN:</div>
            </div>
            <div>
              <div>Time: {formatTimeOnly(order.createdAt)}</div>
              <div>User: {order.customer?.name || 'Walk-in Customer'}</div>
            </div>
          </div>

          <Separator className="my-2" />

          {/* Items Header */}
          <div className="grid grid-cols-6 gap-1 text-sm font-bold mb-2">
            <div>SI</div>
            <div className="col-span-2">Description</div>
            <div>VAT %</div>
            <div>Qty</div>
            <div>Rate</div>
            <div className="text-right">Amount</div>
          </div>

          {/* Items */}
          <div className="space-y-1 mb-4">
            {(isReturn 
              ? order.items.filter(item => (returnItems[item.id] || 0) > 0)
              : order.items
            ).map((item, index) => {
              // For return receipts, use the return quantity
              const quantity = isReturn ? (returnItems[item.id] || 0) : item.quantity;
              const serviceRate = getServiceRate(item.product, item.service);
              const itemSubtotal = quantity * serviceRate * (1 - item.discount / 100);
              
              // Calculate VAT based on settings
              const vatPercent = settings.taxRate || 5;
              const taxMultiplier = vatPercent / 100;
              const preTaxAmount = itemSubtotal / (1 + taxMultiplier);
              const vatAmount = itemSubtotal - preTaxAmount;
              
              return (
                <div key={item.id} className="grid grid-cols-6 gap-1 text-sm">
                  <div>{index + 1}</div>
                  <div className="col-span-2">{item.product.name || 'Unknown Product'}</div>
                  <div>{vatPercent}%</div>
                  <div>{quantity}</div>
                  <div>{serviceRate.toFixed(2)}</div>
                  <div className="text-right">{itemSubtotal.toFixed(2)}</div>
                </div>
              );
            })}
          </div>

          <Separator className="my-2" />

          {/* Totals */}
          <div className="space-y-1 mb-4">
            {isReturn ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>Return Subtotal:</div>
                  <div className="text-right">AED {returnSubtotal.toFixed(2)}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>Output VAT @{settings.taxRate || 5}%:</div>
                  <div className="text-right">AED {returnTax.toFixed(2)}</div>
                </div>
                <div className="grid grid-cols-2 gap-4 font-bold">
                  <div>Refund Total:</div>
                  <div className="text-right">AED {returnTotal.toFixed(2)}</div>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>Discount:</div>
                  <div className="text-right">AED {order.discount.toFixed(2)}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>Output VAT @{settings.taxRate || 5}%:</div>
                  <div className="text-right">AED {order.tax.toFixed(2)}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>Rounding Off:</div>
                  <div className="text-right">AED 0.00</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>Total:</div>
                  <div className="text-right">AED {order.subtotal.toFixed(2)}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>VAT @{settings.taxRate || 5}%:</div>
                  <div className="text-right">AED {order.tax.toFixed(2)}</div>
                </div>
                <div className="grid grid-cols-2 gap-4 font-bold">
                  <div>Total:</div>
                  <div className="text-right">AED {order.total.toFixed(2)}</div>
                </div>
              </>
            )}
          </div>

          <Separator className="my-2" />

          {/* Footer */}
          <div className="text-center text-sm">
            {isReturn ? (
              <>
                <div className="mb-2">Return Reason: {returnReason || 'N/A'}</div>
                <div>★★★★★ Thank you for your business ★★★★★</div>
              </>
            ) : (
              <div>★★★★★ Thank you for your business ★★★★★</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

Receipt.displayName = 'Receipt';