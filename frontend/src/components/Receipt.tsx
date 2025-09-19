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
  showActions = true
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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
            Print
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
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-card-foreground">
            {settings.businessName}
          </CardTitle>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>{settings.businessAddress}</p>
            <p>{settings.businessPhone}</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Order Info */}
          <div className="text-center space-y-2">
            <div className="text-lg font-semibold text-card-foreground">
              Receipt #{order.id}
            </div>
            <div className="text-sm text-muted-foreground">
              {formatDate(order.createdAt)}
            </div>
            <div className="text-sm text-muted-foreground">
              Payment: {order.paymentMethod.toUpperCase()}
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Customer Info */}
          <div className="space-y-1">
            <h4 className="font-semibold text-card-foreground">Customer:</h4>
            <p className="text-sm text-card-foreground">{order.customer?.name || 'Walk-in Customer'}</p>
            {order.customer?.phone && (
              <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
            )}
            {order.customer?.email && (
              <p className="text-sm text-muted-foreground">{order.customer.email}</p>
            )}
          </div>

          <Separator className="bg-border" />

          {/* Items */}
          <div className="space-y-3">
            <h4 className="font-semibold text-card-foreground">Items:</h4>
            {order.items.map((item, index) => {
              // Get the correct price based on service
              const serviceRate = getServiceRate(item.product, item.service);
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-card-foreground">{item.product.name || 'Unknown Product'}</p>
                      <p className="text-sm text-muted-foreground">
                        {getServiceName(item.service)} - {settings.currency} {serviceRate.toFixed(2)} × {item.quantity}
                        {item.discount > 0 && (
                          <span className="text-warning ml-1">(-{item.discount}%)</span>
                        )}
                      </p>
                    </div>
                    <p className="font-medium text-card-foreground">
                      {settings.currency} {item.subtotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <Separator className="bg-border" />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-card-foreground">
              <span>Subtotal:</span>
              <span>{settings.currency} {order.subtotal.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-warning">
                <span>Discount:</span>
                <span>-{settings.currency} {order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-card-foreground">
              <span>Tax:</span>
              <span>{settings.currency} {order.tax.toFixed(2)}</span>
            </div>
            <Separator className="bg-border" />
            <div className="flex justify-between text-xl font-bold text-pos-total">
              <span>Total:</span>
              <span>{settings.currency} {order.total.toFixed(2)}</span>
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground space-y-1">
            <p>Thank you for your business!</p>
            <p>Please keep this receipt for your records.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

Receipt.displayName = 'Receipt';