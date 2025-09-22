import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Printer, 
  FileText, 
  CreditCard, 
  Banknote, 
  Package,
  User,
  Calendar,
  Hash,
  Tag
} from 'lucide-react';
import { Order, Product } from '@/types/pos';

interface BillingDetailsProps {
  order: Order;
  onPrint: (order: Order) => void;
  settings: {
    currency: string;
    businessName: string;
    businessAddress: string;
    businessPhone: string;
    taxRate?: number; // Add taxRate to settings
  };
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
const getServiceRate = (product: Product, service: 'iron' | 'washAndIron' | 'dryClean') => {
  switch (service) {
    case 'iron': return product.ironRate || 0;
    case 'washAndIron': return product.washAndIronRate || 0;
    case 'dryClean': return product.dryCleanRate || 0;
    default: return 0;
  }
};

export function BillingDetails({ order, onPrint, settings }: BillingDetailsProps) {
  // Calculate item details
  const itemDetails = order.items?.map(item => {
    const serviceRate = getServiceRate(item.product, item.service);
    const itemTotal = item.quantity * serviceRate * (1 - item.discount / 100);
    return {
      ...item,
      serviceRate,
      itemTotal
    };
  }) || [];

  // Calculate totals with tax-inclusive pricing
  const subtotal = itemDetails.reduce((sum, item) => sum + (item.quantity * item.serviceRate), 0);
  const totalDiscount = itemDetails.reduce((sum, item) => sum + (item.quantity * item.serviceRate * item.discount / 100), 0);
  const discountedSubtotal = subtotal - totalDiscount;
  
  // Calculate tax and totals for prices that already include tax
  const taxRate = settings?.taxRate || 0;
  const taxMultiplier = taxRate / 100;
  const preTaxAmount = discountedSubtotal / (1 + taxMultiplier);
  const taxAmount = discountedSubtotal - preTaxAmount;
  const total = discountedSubtotal; // Total remains the same as it already includes tax

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <FileText className="h-5 w-5" />
            Billing Details
          </CardTitle>
          <Button 
            variant="outline" 
            onClick={() => onPrint(order)}
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print Receipt
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Business Information */}
        <div className="text-center">
          <h2 className="text-2xl font-bold">{settings.businessName}</h2>
          <p className="text-muted-foreground">{settings.businessAddress}</p>
          <p className="text-muted-foreground">Phone: {settings.businessPhone}</p>
        </div>

        <Separator />

        {/* Order Information */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Order ID:</span>
              <span>#{order.id.slice(-6)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Date:</span>
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Customer:</span>
              <span>{order.customer?.name || 'Walk-in Customer'}</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Payment:</span>
              <Badge variant="secondary">{order.paymentMethod}</Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* Items */}
        <div>
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <Package className="h-4 w-4" />
            Items
          </h3>
          <div className="space-y-3">
            {itemDetails.map((item, index) => (
              <div key={index} className="flex justify-between items-start border-b pb-2">
                <div className="flex-1">
                  <div className="font-medium">{item.product.name || 'Unknown Product'}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Tag className="h-3 w-3" />
                    {getServiceName(item.service)} - {settings.currency} {item.serviceRate.toFixed(2)} × {item.quantity}
                    {item.discount > 0 && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-1 rounded">
                        {item.discount}% off
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right font-medium">
                  {settings.currency} {item.itemTotal.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{settings.currency} {subtotal.toFixed(2)}</span>
          </div>
          {totalDiscount > 0 && (
            <div className="flex justify-between text-red-500">
              <span>Discount:</span>
              <span>- {settings.currency} {totalDiscount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Tax ({settings.taxRate || 0}%):</span>
            <span>{settings.currency} {taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>Total:</span>
            <span>{settings.currency} {total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Method Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Banknote className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Cash:</span>
            <span>
              {order.paymentMethod === 'both' && order.cashAmount ? `${settings.currency} ${order.cashAmount.toFixed(2)}` : 
               order.paymentMethod === 'cash' ? `${settings.currency} ${order.total.toFixed(2)}` : `${settings.currency} 0.00`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Card:</span>
            <span>
              {order.paymentMethod === 'both' && order.cardAmount ? `${settings.currency} ${order.cardAmount.toFixed(2)}` : 
               order.paymentMethod === 'card' ? `${settings.currency} ${order.total.toFixed(2)}` : `${settings.currency} 0.00`}
            </span>
          </div>
        </div>

        <Separator />

        {/* Status */}
        <div className="flex justify-between items-center">
          <span className="font-medium">Status:</span>
          <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
            {order.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}