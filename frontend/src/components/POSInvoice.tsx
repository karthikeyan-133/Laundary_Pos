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
  onAddCustomer: (customer: Omit<Customer, 'id'>) => Promise<Customer>; // Updated to async
  onCheckout: (paymentMethod: Order['paymentMethod'], cashAmount?: number, cardAmount?: number) => Promise<Order | null>; // Updated to async
  onClearCart: () => void;
  onSetCartDiscount: (type: 'flat' | 'percentage', value: number) => void;
  onHoldCart: () => string | null;
  onUnholdCart: (holdId: string) => boolean;
  isCartHeld: boolean;
  currentHoldId: string | null;
  onAddToCart: (product: Product, quantity?: number) => void;
  products: Product[];
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
  const [isProcessing, setIsProcessing] = useState(false); // Add processing state
  const { toast } = useToast();

  useEffect(() => {
    setDiscountType(cartDiscount.type);
    setDiscountValue(cartDiscount.value.toString());
    setTempDiscountValue(cartDiscount.value.toString());
  }, [cartDiscount]);

  const handleCheckout = async () => {
    // If "both" payment method is selected, show split payment popup
    if (paymentMethod === 'both') {
      setShowSplitPaymentPopup(true);
      return;
    }
    
    // Show loading state immediately
    setIsProcessing(true);
    
    try {
      const order = await onCheckout(paymentMethod);
      if (order) {
        setPaymentMethod('cash');
        toast({
          title: "Checkout Successful",
          description: "Order has been processed successfully."
        });
        
        // Show success message without automatic printing
        console.log("Checkout completed. Invoice available for printing from report page.");
      }
    } catch (error) {
      toast({
        title: "Checkout Failed",
        description: "Failed to process order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle split payment confirmation
  const handleSplitPaymentConfirm = async (cashAmount: number, cardAmount: number) => {
    setShowSplitPaymentPopup(false);
    
    // Show loading state immediately
    setIsProcessing(true);
    
    try {
      const order = await onCheckout('both', cashAmount, cardAmount);
      if (order) {
        toast({
          title: "Checkout Successful",
          description: "Order has been processed successfully."
        });
        
        // Show success message without automatic printing
        console.log("Checkout completed. Invoice available for printing from report page.");
      }
    } catch (error) {
      toast({
        title: "Checkout Failed",
        description: "Failed to process order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddCustomer = async (newCustomer: Omit<Customer, 'id'>) => {
    try {
      const customer = await onAddCustomer(newCustomer);
      onCustomerChange(customer);
      setShowCustomerPopup(false);
      toast({
        title: "Customer Added",
        description: "New customer has been added successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add customer. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleHoldCart = () => {
    const holdId = onHoldCart();
    if (holdId) {
      toast({
        title: "Cart Held",
        description: "Your cart has been saved successfully."
      });
    }
  };

  const applyDiscount = () => {
    const value = parseFloat(tempDiscountValue) || 0;
    onSetCartDiscount(discountType, value);
    setDiscountValue(tempDiscountValue);
  };

  const handleBarcodeScan = (barcode: string) => {
    // Find product by barcode
    const product = products.find(p => p.barcode === barcode);
    if (product) {
      onAddToCart(product);
      toast({
        title: "Product Added",
        description: `${product.name} has been added to cart.`
      });
    } else {
      toast({
        title: "Product Not Found",
        description: `No product found with barcode ${barcode}`,
        variant: "destructive"
      });
    }
    setIsScanning(false);
  };

  // Add generateReceipt function
  const generateReceipt = (order: Order) => {
    const receiptContent = `
      <html>
        <head>
          <title>Receipt - ${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .receipt-header { text-align: center; margin-bottom: 20px; }
            .receipt-title { font-size: 24px; font-weight: bold; }
            .receipt-info { margin-bottom: 20px; }
            .receipt-items { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .receipt-items th, .receipt-items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .receipt-items th { background-color: #f2f2f2; }
            .receipt-totals { width: 100%; border-collapse: collapse; }
            .receipt-totals td { padding: 4px; text-align: right; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .mb-10 { margin-bottom: 10px; }
            .mt-20 { margin-top: 20px; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="receipt-header">
            <div class="receipt-title">${settings.businessName || 'Business Name'}</div>
            <div>${settings.businessAddress || 'Business Address'}</div>
            <div>Phone: ${settings.businessPhone || 'N/A'}</div>
            <div class="divider"></div>
            <div><strong>RECEIPT</strong></div>
          </div>
          
          <div class="receipt-info">
            <div>Order ID: ${order.id || 'N/A'}</div>
            <div>Date: ${order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</div>
            <div>Customer: ${order.customer?.name || 'Walk-in Customer'}</div>
            <div>Payment Method: ${order.paymentMethod || 'N/A'}</div>
          </div>
          
          <table class="receipt-items">
            <thead>
              <tr>
                <th>Item</th>
                <th>Service</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${(order.items || []).map(item => `
                <tr>
                  <td>${item.product?.name || 'Unknown Item'}</td>
                  <td>${getServiceName(item.service)}</td>
                  <td>${item.quantity || 0}</td>
                  <td>${settings.currency} ${getServiceRate(item.product, item.service)}</td>
                  <td>${settings.currency} ${(item.subtotal || 0).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <table class="receipt-totals">
            <tr>
              <td>Subtotal:</td>
              <td>${settings.currency} ${(order.subtotal || 0).toFixed(2)}</td>
            </tr>
            ${order.discount > 0 ? `
            <tr>
              <td>Discount:</td>
              <td>-${settings.currency} ${(order.discount || 0).toFixed(2)}</td>
            </tr>
            ` : ''}
            <tr>
              <td>Tax (${settings.taxRate || 0}%):</td>
              <td>${settings.currency} ${(order.tax || 0).toFixed(2)}</td>
            </tr>
            <tr>
              <td><strong>Total:</strong></td>
              <td><strong>${settings.currency} ${(order.total || 0).toFixed(2)}</strong></td>
            </tr>
          </table>
          
          <div class="text-center mt-20">
            <p>Thank you for your purchase!</p>
            <p>Please visit again</p>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(receiptContent);
      printWindow.document.close();
      // Only focus the window, don't automatically print
      printWindow.focus();
    }
  };

  // Add manual print function for explicit printing requests
  const printReceipt = (order: Order) => {
    const receiptContent = `
      <html>
        <head>
          <title>Receipt - ${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .receipt-header { text-align: center; margin-bottom: 20px; }
            .receipt-title { font-size: 24px; font-weight: bold; }
            .receipt-info { margin-bottom: 20px; }
            .receipt-items { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .receipt-items th, .receipt-items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .receipt-items th { background-color: #f2f2f2; }
            .receipt-totals { width: 100%; border-collapse: collapse; }
            .receipt-totals td { padding: 4px; text-align: right; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .mb-10 { margin-bottom: 10px; }
            .mt-20 { margin-top: 20px; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="receipt-header">
            <div class="receipt-title">${settings.businessName || 'Business Name'}</div>
            <div>${settings.businessAddress || 'Business Address'}</div>
            <div>Phone: ${settings.businessPhone || 'N/A'}</div>
            <div class="divider"></div>
            <div><strong>RECEIPT</strong></div>
          </div>
          
          <div class="receipt-info">
            <div>Order ID: ${order.id || 'N/A'}</div>
            <div>Date: ${order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</div>
            <div>Customer: ${order.customer?.name || 'Walk-in Customer'}</div>
            <div>Payment Method: ${order.paymentMethod || 'N/A'}</div>
          </div>
          
          <table class="receipt-items">
            <thead>
              <tr>
                <th>Item</th>
                <th>Service</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${(order.items || []).map(item => `
                <tr>
                  <td>${item.product?.name || 'Unknown Item'}</td>
                  <td>${getServiceName(item.service)}</td>
                  <td>${item.quantity || 0}</td>
                  <td>${settings.currency} ${getServiceRate(item.product, item.service)}</td>
                  <td>${settings.currency} ${(item.subtotal || 0).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <table class="receipt-totals">
            <tr>
              <td>Subtotal:</td>
              <td>${settings.currency} ${(order.subtotal || 0).toFixed(2)}</td>
            </tr>
            ${order.discount > 0 ? `
            <tr>
              <td>Discount:</td>
              <td>-${settings.currency} ${(order.discount || 0).toFixed(2)}</td>
            </tr>
            ` : ''}
            <tr>
              <td>Tax (${settings.taxRate || 0}%):</td>
              <td>${settings.currency} ${(order.tax || 0).toFixed(2)}</td>
            </tr>
            <tr>
              <td><strong>Total:</strong></td>
              <td><strong>${settings.currency} ${(order.total || 0).toFixed(2)}</strong></td>
            </tr>
          </table>
          
          <div class="text-center mt-20">
            <p>Thank you for your purchase!</p>
            <p>Please visit again</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              // Close window after printing
              window.onfocus = function() { 
                setTimeout(function() { window.close(); }, 500); 
              }
            }
          </script>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(receiptContent);
      printWindow.document.close();
    }
  };

  return (
    <>
      <CustomerCreationPopup
        isOpen={showCustomerPopup}
        onClose={() => setShowCustomerPopup(false)}
        onCreate={handleAddCustomer}
      />
      
      <SplitPaymentPopup
        isOpen={showSplitPaymentPopup}
        onClose={() => setShowSplitPaymentPopup(false)}
        onConfirm={handleSplitPaymentConfirm}
        totalAmount={totals.total}
        currency={settings.currency}
      />

      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Invoice
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <Label>Customer</Label>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2"
                onClick={() => setShowCustomerPopup(true)}
              >
                <UserPlus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            <Select 
              value={customer.id} 
              onValueChange={(value) => {
                const selectedCustomer = customers.find(c => c.id === value);
                if (selectedCustomer) {
                  onCustomerChange(selectedCustomer);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((cust) => (
                  <SelectItem key={cust.id} value={cust.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{cust.name}</span>
                      {cust.emirate && (
                        <span className="ml-2 text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                          {cust.emirate}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator className="my-2" />

          <div className="flex-1 overflow-auto mb-4">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Your cart is empty</p>
                <p className="text-sm">Add products to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 p-2 border rounded">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{item.product.name || 'Unknown Product'}</p>
                      <p className="text-sm text-muted-foreground">
                        {getServiceName(item.service)} - {settings.currency} {getServiceRate(item.product, item.service).toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-right min-w-[70px]">
                      <p className="font-medium">{settings.currency} {item.subtotal.toFixed(2)}</p>
                      {item.discount > 0 && (
                        <p className="text-xs text-muted-foreground line-through">
                          {settings.currency} {(item.quantity * getServiceRate(item.product, item.service)).toFixed(2)}
                        </p>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => onRemoveItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator className="my-2" />

          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{settings.currency} {totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount:</span>
              <span>- {settings.currency} {totals.discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax ({settings.taxRate}%):</span>
              <span>{settings.currency} {totals.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>{settings.currency} {totals.total.toFixed(2)}</span>
            </div>
          </div>

          <Separator className="my-2" />

          {cart.length > 0 && (
            <>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <Label>Cart Discount</Label>
                  <ToggleGroup 
                    type="single" 
                    value={discountType}
                    onValueChange={(value) => value && setDiscountType(value as 'flat' | 'percentage')}
                  >
                    <ToggleGroupItem value="percentage" aria-label="Percentage discount">
                      %
                    </ToggleGroupItem>
                    <ToggleGroupItem value="flat" aria-label="Flat discount">
                      {settings.currency}
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={tempDiscountValue}
                    onChange={(e) => setTempDiscountValue(e.target.value)}
                    placeholder={discountType === 'percentage' ? '0%' : `0${settings.currency}`}
                  />
                  <Button onClick={applyDiscount}>Apply</Button>
                </div>
              </div>

              <div className="mb-4">
                <Label className="mb-2 block">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as Order['paymentMethod'])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">
                      <div className="flex items-center gap-2">
                        <Banknote className="h-4 w-4" />
                        Cash
                      </div>
                    </SelectItem>
                    <SelectItem value="card">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
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

                <div className="grid grid-cols-3 gap-2 mt-2">
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
                  <Button onClick={handleCheckout} className="w-full" disabled={isProcessing}>
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Checkout
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    // Create a temporary order object for printing
                    const tempOrder: Order = {
                      id: 'TEMP-' + Date.now(),
                      items: cart.map(item => ({
                        ...item,
                        subtotal: item.quantity * getServiceRate(item.product, item.service)
                      })),
                      customer,
                      paymentMethod: paymentMethod,
                      subtotal: totals.subtotal,
                      discount: totals.discount,
                      tax: totals.tax,
                      total: totals.total,
                      status: 'completed',
                      createdAt: new Date(),
                      updatedAt: new Date()
                    };
                    printReceipt(tempOrder);
                  }} className="w-full">
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