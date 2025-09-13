import React, { useState } from 'react';
import { CreditCard, DollarSign, Smartphone, User, Phone, Mail, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Customer, Order } from '@/types/pos';
import { useToast } from '@/hooks/use-toast';

interface BillingFormProps {
  customer: Customer;
  onCustomerUpdate: (customer: Customer) => void;
  onProcessPayment: (paymentMethod: Order['paymentMethod']) => Order | null;
  total: number;
  canProcessPayment: boolean;
}

export function BillingForm({
  customer,
  onCustomerUpdate,
  onProcessPayment,
  total,
  canProcessPayment
}: BillingFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<Order['paymentMethod']>('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!canProcessPayment) {
      toast({
        title: "Cannot process payment",
        description: "Please add items to your cart first.",
        variant: "destructive"
      });
      return;
    }

    if (!customer.name.trim()) {
      toast({
        title: "Customer name required",
        description: "Please enter a customer name to continue.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      const order = onProcessPayment(paymentMethod);
      setIsProcessing(false);

      if (order) {
        toast({
          title: "Payment successful!",
          description: `Order ${order.id} has been processed successfully.`,
          variant: "default"
        });
      }
    }, 1500);
  };

  const paymentMethods = [
    { id: 'cash' as const, label: 'Cash', icon: DollarSign },
    { id: 'card' as const, label: 'Card', icon: CreditCard },
    { id: 'credit' as const, label: 'Credit', icon: CreditCard }
  ];

  return (
    <div className="space-y-6">
      {/* Customer Information */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <User className="h-5 w-5" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer-name" className="text-card-foreground">Name *</Label>
              <Input
                id="customer-name"
                value={customer.name}
                onChange={(e) => onCustomerUpdate({ ...customer, name: e.target.value })}
                placeholder="Enter customer name"
                className="bg-card border-border"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-phone" className="text-card-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" />
                Phone
              </Label>
              <Input
                id="customer-phone"
                value={customer.phone || ''}
                onChange={(e) => onCustomerUpdate({ ...customer, phone: e.target.value })}
                placeholder="(555) 123-4567"
                className="bg-card border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-email" className="text-card-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" />
                Email
              </Label>
              <Input
                id="customer-email"
                type="email"
                value={customer.email || ''}
                onChange={(e) => onCustomerUpdate({ ...customer, email: e.target.value })}
                placeholder="customer@example.com"
                className="bg-card border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-address" className="text-card-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Address
              </Label>
              <Textarea
                id="customer-address"
                value={customer.address || ''}
                onChange={(e) => onCustomerUpdate({ ...customer, address: e.target.value })}
                placeholder="Enter address"
                className="bg-card border-border resize-none"
                rows={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <Button
                  key={method.id}
                  variant={paymentMethod === method.id ? "default" : "outline"}
                  className={`h-16 flex flex-col items-center gap-2 ${
                    paymentMethod === method.id 
                      ? "bg-primary text-primary-foreground border-primary" 
                      : "bg-card hover:bg-secondary border-border"
                  }`}
                  onClick={() => setPaymentMethod(method.id)}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-sm font-medium">{method.label}</span>
                </Button>
              );
            })}
          </div>

          {/* Payment Summary */}
          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-card-foreground">
                Total Amount:
              </span>
              <span className="text-2xl font-bold text-pos-total">
                AED {total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Process Payment Button */}
          <Button
            onClick={handlePayment}
            disabled={!canProcessPayment || isProcessing}
            className="w-full h-14 text-lg font-semibold bg-success hover:bg-success/90 text-success-foreground shadow-medium"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-success-foreground/30 border-t-success-foreground rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              `Process Payment - AED ${total.toFixed(2)}`
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}