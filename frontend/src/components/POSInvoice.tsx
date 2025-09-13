import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { 
  Trash2, 
  Plus, 
  Minus, 
  User, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Printer, 
  Wallet, 
  Package, 
  UserPlus,
  Pause,
  Play
} from 'lucide-react';
import { CartItem, Customer, Order, POSSettings, Product } from '@/types/pos';
import { CustomerCreationPopup } from '@/components/CustomerCreationPopup';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { SplitPaymentPopup } from '@/components/SplitPaymentPopup'; // Add split payment popup
import { useToast } from '@/components/ui/use-toast';

interface POSInvoiceProps {
  cart: CartItem[];
  customer: Customer;
  customers: Customer[];
  totals: { subtotal: number; discount: number; tax: number; total: number };
  settings: POSSettings;
  cartDiscount: { type: 'flat' | 'percentage'; value: number };
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onUpdateDiscount: (itemId: string, discount: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCustomerChange: (customer: Customer) => void;
  onAddCustomer: (customer: Customer) => Customer;
  onCheckout: (paymentMethod: Order['paymentMethod'], cashAmount?: number, cardAmount?: number) => Order | null;
  onClearCart: () => void;
  onSetCartDiscount: (type: 'flat' | 'percentage', value: number) => void;
  onHoldCart: () => string | null;
  onUnholdCart: (holdId: string) => boolean;
  isCartHeld: boolean;
  currentHoldId: string | null;
  onAddToCart: (product: Product, quantity?: number) => void;
  products: Product[];
}

export function POSInvoice({
  cart,
  customer,
  customers,
  totals,
  settings,
  cartDiscount,
  onUpdateQuantity,
  onUpdateDiscount,
  onRemoveItem,
  onCustomerChange,
  onAddCustomer,
  onCheckout,
  onClearCart,
  onSetCartDiscount,
  onHoldCart,
  onUnholdCart,
  isCartHeld,
  currentHoldId,
  onAddToCart,
  products
}: POSInvoiceProps) {
  const [paymentMethod, setPaymentMethod] = useState<Order['paymentMethod']>('cash');
  const [showCustomerPopup, setShowCustomerPopup] = useState(false);
  const [showSplitPaymentPopup, setShowSplitPaymentPopup] = useState(false); // Add split payment popup state
  const [discountType, setDiscountType] = useState<'flat' | 'percentage'>(cartDiscount.type);
  const [discountValue, setDiscountValue] = useState<string>(cartDiscount.value.toString());
  const [tempDiscountValue, setTempDiscountValue] = useState<string>(cartDiscount.value.toString());
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setDiscountType(cartDiscount.type);
    setDiscountValue(cartDiscount.value.toString());
    setTempDiscountValue(cartDiscount.value.toString());
  }, [cartDiscount]);

  const handleCheckout = () => {
    // If "both" payment method is selected, show split payment popup
    if (paymentMethod === 'both') {
      setShowSplitPaymentPopup(true);
      return;
    }
    
    const order = onCheckout(paymentMethod);
    if (order) {
      setPaymentMethod('cash');
      toast({
        title: "Checkout Successful",
        description: "Order has been processed successfully."
      });
    }
  };

  // Handle split payment confirmation
  const handleSplitPaymentConfirm = (cashAmount: number, cardAmount: number) => {
    setShowSplitPaymentPopup(false);
    
    // Pass the cash and card amounts to the checkout function
    const order = onCheckout('both', cashAmount, cardAmount);
    if (order) {
      setPaymentMethod('cash');
      toast({
        title: "Checkout Successful",
        description: `Order processed with ${settings.currency} ${cashAmount.toFixed(2)} cash and ${settings.currency} ${cardAmount.toFixed(2)} card.`
      });
    }
  };

  const handleCreateCustomer = (newCustomer: Customer) => {
    const createdCustomer = onAddCustomer(newCustomer);
    onCustomerChange(createdCustomer);
  };

  const handleDiscountTypeChange = (value: 'flat' | 'percentage') => {
    if (value) {
      setDiscountType(value);
    }
  };

  const handleApplyDiscount = () => {
    const numValue = parseFloat(tempDiscountValue) || 0;
    setDiscountValue(tempDiscountValue);
    onSetCartDiscount(discountType, numValue);
  };

  const handleClearDiscount = () => {
    setTempDiscountValue('0');
    setDiscountValue('0');
    onSetCartDiscount(discountType, 0);
  };

  const handleBarcodeScan = (barcode: string) => {
    const foundProduct = products.find((product) => product.sku === barcode);
    
    if (foundProduct) {
      onAddToCart(foundProduct);
      toast({
        title: "Product Added",
        description: `${foundProduct.name} has been added to cart`
      });
    } else {
      toast({
        title: "Product Not Found",
        description: `No product found with barcode ${barcode}`,
        variant: "destructive"
      });
    }
  };

  const handleHoldCart = () => {
    if (cart.length === 0) {
      toast({
        title: "Cannot Hold Cart",
        description: "Cart is empty. Add items to cart before holding.",
        variant: "destructive"
      });
      return;
    }

    if (isCartHeld) {
      if (currentHoldId && onUnholdCart(currentHoldId)) {
        toast({
          title: "Cart Unheld",
          description: "Cart has been restored from hold."
        });
      }
    } else {
      const holdId = onHoldCart();
      if (holdId) {
        toast({
          title: "Cart Held",
          description: "Cart has been held for later use."
        });
      }
    }
  };

  return (
    <>
      <CustomerCreationPopup 
        isOpen={showCustomerPopup} 
        onClose={() => setShowCustomerPopup(false)} 
        onCreate={handleCreateCustomer} 
      />
      
      {/* Split Payment Popup */}
      <SplitPaymentPopup
        isOpen={showSplitPaymentPopup}
        totalAmount={totals.total}
        currency={settings.currency}
        onClose={() => setShowSplitPaymentPopup(false)}
        onConfirm={handleSplitPaymentConfirm}
      />
      
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Sales Invoice
            </CardTitle>
            <Badge variant="outline">Invoice #{Date.now().toString().slice(-6)}</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Customer Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <Label className="text-sm font-medium">Customer</Label>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Select 
                  value={customer.id} 
                  onValueChange={(customerId) => {
                    const selectedCustomer = customers.find(c => c.id === customerId);
                    if (selectedCustomer) {
                      onCustomerChange(selectedCustomer);
                    }
                  }}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((cust) => (
                      <SelectItem key={cust.id} value={cust.id!}>
                        {cust.name} {cust.code ? `(${cust.code})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="icon" 
                className="h-9 w-9" 
                onClick={() => setShowCustomerPopup(true)}
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
            
            {customer.name && (
              <div className="text-sm text-muted-foreground">
                {customer.contactName && <div>Contact: {customer.contactName}</div>}
                {customer.phone && <div>Phone: {customer.phone}</div>}
                {(customer.place || customer.emirate) && (
                  <div>Location: {[customer.place, customer.emirate].filter(Boolean).join(', ')}</div>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Barcode Scanner (only shown in development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="py-4">
              <BarcodeScanner onScan={handleBarcodeScan} />
            </div>
          )}
          
          {/* Cart Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Items ({cart.length})</Label>
              {cart.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearCart}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No items in cart</p>
                <p className="text-sm">Add products to start billing</p>
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2">
                {cart.map((item) => (
                  <div key={item.id} className="border rounded-lg p-3 bg-muted/30">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.product.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {item.product.description}
                        </p>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {item.product.category}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="space-y-1">
                        <div className="text-lg font-bold text-primary">
                          AED {item.product.price.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          SKU: {item.product.sku} • Barcode: {item.product.barcode} • Stock: {item.product.stock}
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRemoveItem(item.id)}
                        className="text-destructive hover:text-destructive p-1 h-6 w-6"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="h-6 w-6 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <div className="font-semibold text-sm">
                          {settings.currency} {item.subtotal.toFixed(2)}
                        </div>
                        {item.discount > 0 && (
                          <div className="text-xs text-warning">
                            -{item.discount}% off
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <Label className="text-xs text-muted-foreground">Disc%:</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={item.discount}
                        onChange={(e) => onUpdateDiscount(item.id, Number(e.target.value))}
                        className="h-6 text-xs w-16"
                        placeholder="0"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{settings.currency} {totals.subtotal.toFixed(2)}</span>
                </div>
                
                <div className="py-2">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">Discount</Label>
                  </div>
                  <div className="flex gap-2 items-center">
                    <ToggleGroup 
                      type="single" 
                      value={discountType} 
                      onValueChange={handleDiscountTypeChange}
                      className="gap-0"
                    >
                      <ToggleGroupItem 
                        value="flat" 
                        aria-label="Flat discount"
                        className="rounded-r-none border-r-0 px-3 h-8 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                      >
                        Flat
                      </ToggleGroupItem>
                      <ToggleGroupItem 
                        value="percentage" 
                        aria-label="Percentage discount"
                        className="rounded-l-none border-l-0 px-3 h-8 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                      >
                        %
                      </ToggleGroupItem>
                    </ToggleGroup>
                    <Input
                      type="number"
                      min="0"
                      value={tempDiscountValue}
                      onChange={(e) => setTempDiscountValue(e.target.value)}
                      className="h-8 flex-1 text-sm"
                      placeholder={discountType === 'percentage' ? "Enter % discount" : "Enter flat discount"}
                    />
                    <Button 
                      onClick={handleApplyDiscount}
                      className="h-8 text-sm px-3"
                    >
                      Apply
                    </Button>
                  </div>
                  {totals.discount > 0 && (
                    <div className="flex justify-between text-sm mt-1">
                      <span>Discount Applied:</span>
                      <span className="text-destructive">-{settings.currency} {totals.discount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                
                <Separator className="my-1" />
                <div className="flex justify-between text-sm">
                  <span>Tax ({settings.taxRate}%):</span>
                  <span>{settings.currency} {totals.tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>{settings.currency} {totals.total.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}

          {cart.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label className="text-sm font-medium">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={(value: Order['paymentMethod']) => setPaymentMethod(value)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Credit
                      </div>
                    </SelectItem>
                    <SelectItem value="cash">
                      <div className="flex items-center gap-2">
                        <Banknote className="h-4 w-4" />
                        Cash
                      </div>
                    </SelectItem>
                    <SelectItem value="card">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        Card
                      </div>
                    </SelectItem>
                    <SelectItem value="both">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <Banknote className="h-4 w-4" />
                        Both
                      </div>
                    </SelectItem>
                    <SelectItem value="cod">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        COD (Cash on Delivery)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    onClick={handleHoldCart} 
                    className="w-full"
                    variant={isCartHeld ? "default" : "outline"}
                  >
                    {isCartHeld ? (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Unhold
                      </>
                    ) : (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Hold
                      </>
                    )}
                  </Button>
                  <Button onClick={handleCheckout} className="w-full">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Checkout
                  </Button>
                  <Button variant="outline" onClick={() => window.print()} className="w-full">
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}