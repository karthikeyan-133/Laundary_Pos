import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  FileText, 
  Package, 
  Calendar, 
  Home,
  TrendingUp,
  Filter,
  Download,
  Printer,
  RotateCcw
} from 'lucide-react';
import { Order, Product, POSSettings } from '@/types/pos';

interface ReportsProps {
  orders: Order[];
  onReturnOrder?: (order: Order, type: 'complete' | 'partial' | null) => void;
  settings?: POSSettings; // Add settings prop for business info
}

export function Reports({ orders, onReturnOrder, settings }: ReportsProps) {
  const [activeReport, setActiveReport] = useState<
    'bill' | 'item' | 'daily' | 'delivery'
  >('bill');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [showReturnOptions, setShowReturnOptions] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [returnType, setReturnType] = useState<'complete' | 'partial' | null>(null);

  // Safe date formatting function
  const formatDate = (date: Date | string | undefined | null): string => {
    // Handle undefined, null, or empty values
    if (!date) {
      return 'Invalid Date';
    }
    
    // If it's already a Date object, use it directly
    let dateObj: Date;
    if (date instanceof Date) {
      dateObj = date;
    } else {
      // If it's a string, try to parse it
      dateObj = new Date(date);
    }
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    // Adjust for Dubai time (UTC+4)
    const dubaiTime = new Date(dateObj.getTime() + (4 * 60 * 60 * 1000));
    
    return dubaiTime.toLocaleString('en-US', { 
      timeZone: 'Asia/Dubai',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter orders based on date range and return status
  const filterOrdersByDate = (orders: Order[]): Order[] => {
    console.log('filterOrdersByDate called with:', { orders, fromDate, toDate });
    console.log('Filter dates - From:', fromDate, 'To:', toDate);
    
    // First, filter out returned orders
    const nonReturnedOrders = orders.filter(order => order.status !== 'returned');
    console.log('After filtering out returned orders:', nonReturnedOrders.length, 'out of', orders.length);
    
    // If no date filters are set, return all non-returned orders
    if ((!fromDate || fromDate === '') && (!toDate || toDate === '')) {
      console.log('No date filters applied, returning all non-returned orders');
      return nonReturnedOrders;
    }
    
    const filtered = nonReturnedOrders.filter(order => {
      try {
        // Convert order createdAt to Date object if it's not already
        let orderDate: Date;
        if (order.createdAt instanceof Date) {
          orderDate = order.createdAt;
        } else if (typeof order.createdAt === 'string') {
          orderDate = new Date(order.createdAt);
        } else {
          console.log('Invalid date type for order:', order.id, typeof order.createdAt);
          return false;
        }
        
        // Check if orderDate is valid
        if (isNaN(orderDate.getTime())) {
          console.log('Invalid date for order:', order.id, order.createdAt);
          return false;
        }
        
        console.log('Order date for', order.id, ':', orderDate);
        
        // Parse filter dates
        const from = fromDate ? new Date(fromDate) : null;
        const to = toDate ? new Date(toDate) : null;
        
        console.log('Filter dates - From:', from, 'To:', to);
        
        // Set time to end of day for toDate comparison
        if (to) {
          to.setHours(23, 59, 59, 999);
        }
        
        // Check if order date is within the filter range
        const isAfterFrom = !from || orderDate >= from;
        const isBeforeTo = !to || orderDate <= to;
        
        console.log(`Order ${order.id} - Date: ${orderDate}, From: ${from}, To: ${to}, AfterFrom: ${isAfterFrom}, BeforeTo: ${isBeforeTo}`);
        
        return isAfterFrom && isBeforeTo;
      } catch (error) {
        console.error('Error filtering order:', order.id, error);
        return false;
      }
    });
    
    console.log('Filtering complete. Original count:', orders.length, 'Filtered count:', filtered.length);
    return filtered;
  };

  const filteredOrders = filterOrdersByDate(orders);
  console.log('Filtered orders length:', filteredOrders.length);
  console.log('Original orders length:', orders.length);
  
  // Add a check to see if all orders are being filtered out
  if (filteredOrders.length === 0 && orders.length > 0) {
    console.log('WARNING: All orders filtered out. Check date filtering logic.');
  }
  
  // Check if we have any orders at all
  if (orders.length === 0) {
    console.log('No orders available in the system');
  }
  
  // Debug orders data structure
  if (orders.length > 0) {
    console.log('First order structure:', {
      id: orders[0].id,
      hasItems: orders[0].hasOwnProperty('items'),
      itemsType: typeof orders[0].items,
      isArray: Array.isArray(orders[0].items),
      itemsLength: orders[0].items ? orders[0].items.length : 0,
      firstItem: orders[0].items && orders[0].items.length > 0 ? orders[0].items[0] : null
    });
  }

  // Debugging: Log orders to see the data structure
  useEffect(() => {
    console.log('Orders data:', orders);
    if (orders.length > 0) {
      console.log('First order:', orders[0]);
      console.log('First order createdAt:', orders[0].createdAt);
      console.log('First order items:', orders[0].items);
      console.log('First order items type:', typeof orders[0].items);
      console.log('First order items is array:', Array.isArray(orders[0].items));
      
      if (orders[0].items && Array.isArray(orders[0].items) && orders[0].items.length > 0) {
        console.log('First item in first order:', orders[0].items[0]);
        console.log('First item product:', orders[0].items[0].product);
        console.log('First item product id:', orders[0].items[0].product?.id);
      }
      
      console.log('Type of createdAt:', typeof orders[0].createdAt);
      console.log('Is createdAt a Date?', orders[0].createdAt instanceof Date);
      if (typeof orders[0].createdAt === 'string') {
        const parsedDate = new Date(orders[0].createdAt);
        console.log('Parsed date:', parsedDate);
        console.log('Is parsed date valid?', !isNaN(parsedDate.getTime()));
      }
    }
    
    // Log all order dates for debugging
    orders.forEach((order, index) => {
      const orderDate = order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt);
      console.log(`Order ${index + 1} (${order.id}) date:`, orderDate, 'Valid:', !isNaN(orderDate.getTime()));
    });
  }, [orders]);

  // Handle return button click
  const handleReturnClick = (order: Order) => {
    setSelectedOrder(order);
    setShowReturnOptions(true);
    setReturnType(null);
  };

  // Handle return option selection
  const handleReturnOptionSelect = (type: 'complete' | 'partial') => {
    setReturnType(type);
    
    // If onReturnOrder is defined, call it with the order and return type
    if (onReturnOrder && selectedOrder) {
      console.log('Calling onReturnOrder with order:', selectedOrder, 'and type:', type);
      onReturnOrder(selectedOrder, type);
    }
    
    // Close the return options dialog
    closeReturnOptions();
  };

  // Close return options dialog
  const closeReturnOptions = () => {
    setShowReturnOptions(false);
    setSelectedOrder(null);
    setReturnType(null);
  };

  // Add generateReceipt function for printing
  const generateReceipt = (order: Order) => {
    if (!settings) {
      console.error('Settings not provided for receipt generation');
      return;
    }

    const receiptContent = `
      <html>
        <head>
          <title>Receipt - ${order.id}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 10px;
              width: 4in; /* 4 inch width */
              max-width: 4in;
            }
            .receipt-header { 
              text-align: center; 
              margin-bottom: 10px; 
            }
            .receipt-title { 
              font-size: 18px; 
              font-weight: bold; 
              margin-bottom: 5px;
            }
            .receipt-info { 
              margin-bottom: 10px; 
              font-size: 12px;
            }
            .receipt-items { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 10px; 
              font-size: 12px;
            }
            .receipt-items th, .receipt-items td { 
              padding: 4px 2px; 
              text-align: left; 
            }
            .receipt-items th { 
              border-bottom: 1px solid #000;
              font-size: 12px;
            }
            .receipt-totals { 
              width: 100%; 
              border-collapse: collapse; 
              font-size: 12px;
            }
            .receipt-totals td { 
              padding: 2px; 
              text-align: right; 
            }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .mb-5 { margin-bottom: 5px; }
            .mt-10 { margin-top: 10px; }
            .divider { 
              border-top: 1px dashed #000; 
              margin: 5px 0; 
            }
            .item-name {
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              max-width: 80px;
            }
            .item-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 3px;
            }
            .item-details {
              flex: 1;
            }
            .item-amount {
              text-align: right;
            }
          </style>
        </head>
        <body>
          <div class="receipt-header">
            <div class="receipt-title">${settings.businessName}</div>
            <div style="font-size: 12px;">${settings.businessAddress}</div>
            <div style="font-size: 12px;">Phone: ${settings.businessPhone}</div>
            <div class="divider"></div>
            <div><strong>RECEIPT</strong></div>
          </div>
          
          <div class="receipt-info">
            <div>Order ID: ${order.id}</div>
            <div>Date: ${new Date(order.createdAt).toLocaleString('en-US', { 
              timeZone: 'Asia/Dubai',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</div>
            <div>Customer: ${order.customer?.name || 'N/A'}</div>
            <div>Payment: ${order.paymentMethod}</div>
          </div>
          
          <div style="border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 5px;">
            <strong>Items:</strong>
          </div>
          
          <div>
            ${order.items.map(item => `
              <div class="item-row">
                <div class="item-details">
                  <div class="item-name">${item.product.name}</div>
                  <div>${item.quantity} × ${settings.currency}${item.product.price.toFixed(2)}</div>
                </div>
                <div class="item-amount">${settings.currency}${item.subtotal.toFixed(2)}</div>
              </div>
            `).join('')}
          </div>
          
          <div class="divider"></div>
          
          <div>
            <div class="item-row">
              <div>Subtotal:</div>
              <div>${settings.currency}${order.subtotal.toFixed(2)}</div>
            </div>
            ${order.discount > 0 ? `
            <div class="item-row">
              <div>Discount:</div>
              <div>-${settings.currency}${order.discount.toFixed(2)}</div>
            </div>
            ` : ''}
            <div class="item-row">
              <div>Tax (${settings.taxRate}%):</div>
              <div>${settings.currency}${order.tax.toFixed(2)}</div>
            </div>
            <div class="divider"></div>
            <div class="item-row" style="font-weight: bold; font-size: 14px;">
              <div>Total:</div>
              <div>${settings.currency}${order.total.toFixed(2)}</div>
            </div>
          </div>
          
          <div class="text-center mt-10" style="font-size: 12px;">
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
    
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (printWindow) {
      printWindow.document.write(receiptContent);
      printWindow.document.close();
    }
  };

  // Report by Bill
  const ReportByBill = () => (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <FileText className="h-5 w-5" />
          Report by Bill
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filteredOrders.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No orders found for selected date range</p>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Trans No</th>
                    <th className="text-left py-2">Trans Date</th>
                    <th className="text-left py-2">Total</th>
                    <th className="text-left py-2">Payment Method</th>
                    <th className="text-left py-2">Cash</th>
                    <th className="text-left py-2">Card</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b">
                      <td className="py-2">#{order.id.slice(-6)}</td>
                      <td className="py-2">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-2">AED {order.total.toFixed(2)}</td>
                      <td className="py-2">
                        <Badge variant="secondary">
                          {order.paymentMethod}
                        </Badge>
                      </td>
                      <td className="py-2">
                        {order.paymentMethod === 'both' && order.cashAmount ? `AED ${order.cashAmount.toFixed(2)}` : 
                         order.paymentMethod === 'cash' ? `AED ${order.total.toFixed(2)}` : 'AED 0.00'}
                      </td>
                      <td className="py-2">
                        {order.paymentMethod === 'both' && order.cardAmount ? `AED ${order.cardAmount.toFixed(2)}` : 
                         order.paymentMethod === 'card' ? `AED ${order.total.toFixed(2)}` : 'AED 0.00'}
                      </td>
                      <td className="py-2">
                        <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="py-2">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => generateReceipt(order)}
                          >
                            <Printer className="h-4 w-4 mr-1" />
                            Print
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleReturnClick(order)}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Return
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Report by Item
  const ReportByItem = () => {
    // Use filtered orders for consistency with other reports
    const ordersToProcess = filteredOrders;
    
    console.log('ReportByItem processing orders:', ordersToProcess.length);
    console.log('Original orders:', orders.length);
    console.log('Filtered orders:', filteredOrders.length);
    
    // Create a list of individual item details from all orders
    const itemDetails: { 
      orderDate: string;
      orderId: string;
      productName: string;
      categoryName: string;
      quantity: number;
      price: number;
      subtotal: number;
      customerName: string;
      paymentMethod: string;
      status: string;
    }[] = [];

    ordersToProcess.forEach((order, orderIndex) => {
      console.log(`Processing order ${orderIndex + 1}:`, order.id);
      
      // Check if order has items property
      if (!order.hasOwnProperty('items')) {
        console.log('Order has no items property');
        return;
      }
      
      // Check if items is an array
      if (!Array.isArray(order.items)) {
        console.log('Order items is not an array:', typeof order.items);
        console.log('Order items value:', order.items);
        return;
      }
      
      console.log('Order items count:', order.items.length);
      
      if (order.items.length === 0) {
        console.log('Order has no items');
        return;
      }
      
      order.items.forEach((item, itemIndex) => {
        console.log(`Processing item ${itemIndex + 1}:`, item);
        
        // Check if item exists
        if (!item) {
          console.log('Item is null or undefined');
          return;
        }
        
        // Check if item has product property (could be 'product' or 'products')
        let product = item.product;
        // Handle case where backend returns 'products' instead of 'product'
        if (!product && (item as any).products) {
          product = (item as any).products;
        }
        
        // Check if product exists
        if (!product) {
          console.log('Item has no product property');
          console.log('Item keys:', Object.keys(item));
          return;
        }
        
        // Convert string values to numbers if needed
        const quantity = typeof item.quantity === 'string' ? parseFloat(item.quantity) : item.quantity;
        const subtotal = typeof item.subtotal === 'string' ? parseFloat(item.subtotal) : item.subtotal;
        const price = product.price || 0;
        
        // Format order date
        let orderDate = '';
        try {
          if (order.createdAt instanceof Date) {
            orderDate = order.createdAt.toLocaleString();
          } else if (typeof order.createdAt === 'string') {
            const dateObj = new Date(order.createdAt);
            if (!isNaN(dateObj.getTime())) {
              orderDate = dateObj.toLocaleString();
            }
          }
        } catch (error) {
          console.error('Error formatting order date:', error);
        }
        
        // Add item details to the list
        itemDetails.push({
          orderDate: orderDate,
          orderId: order.id,
          productName: product.name || '',
          categoryName: product.category || '',
          quantity: quantity,
          price: price,
          subtotal: subtotal,
          customerName: order.customer?.name || 'N/A',
          paymentMethod: order.paymentMethod || '',
          status: order.status || ''
        });
      });
    });

    console.log('Item details count:', itemDetails.length);
    if (itemDetails.length > 0) {
      console.log('First item detail:', itemDetails[0]);
    }

    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Package className="h-5 w-5" />
            Report by Item
          </CardTitle>
        </CardHeader>
        <CardContent>
          {itemDetails.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No items sold yet
            </p>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Order ID</th>
                      <th className="text-left py-2">Date</th>
                      <th className="text-left py-2">Item Name</th>
                      <th className="text-left py-2">Category</th>
                      <th className="text-left py-2">Quantity</th>
                      <th className="text-left py-2">Price</th>
                      <th className="text-left py-2">Subtotal</th>
                      <th className="text-left py-2">Customer</th>
                      <th className="text-left py-2">Payment</th>
                      <th className="text-left py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemDetails.map((item, index) => (
                      <tr key={`${item.orderId}-${index}`} className="border-b">
                        <td className="py-2">#{item.orderId.slice(-6)}</td>
                        <td className="py-2">{item.orderDate}</td>
                        <td className="py-2">{item.productName}</td>
                        <td className="py-2">{item.categoryName}</td>
                        <td className="py-2">{item.quantity}</td>
                        <td className="py-2">AED {item.price.toFixed(2)}</td>
                        <td className="py-2">AED {item.subtotal.toFixed(2)}</td>
                        <td className="py-2">{item.customerName}</td>
                        <td className="py-2">{item.paymentMethod}</td>
                        <td className="py-2">{item.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Report by Per Day
  const ReportByDaily = () => {
    // Group filtered orders by date
    const dailySales: { [key: string]: { date: string, orders: number, revenue: number } } = {};
    
    filteredOrders.forEach(order => {
      const dateStr = formatDate(order.createdAt);
      // Skip invalid dates
      if (dateStr !== 'Invalid Date') {
        if (dailySales[dateStr]) {
          dailySales[dateStr].orders += 1;
          dailySales[dateStr].revenue += order.total;
        } else {
          dailySales[dateStr] = {
            date: dateStr,
            orders: 1,
            revenue: order.total
          };
        }
      }
    });

    const dailyData = Object.values(dailySales);

    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Calendar className="h-5 w-5" />
            Report by Per Day
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dailyData.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No daily sales data for selected date range</p>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Date</th>
                      <th className="text-left py-2">Orders</th>
                      <th className="text-left py-2">Revenue</th>
                      <th className="text-left py-2">Avg. Order Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyData.map((day, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{day.date}</td>
                        <td className="py-2">{day.orders}</td>
                        <td className="py-2">AED {day.revenue.toFixed(2)}</td>
                        <td className="py-2">AED {(day.revenue / day.orders).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Report by Home Delivery
  const ReportByDelivery = () => {
    // Filter orders by COD (Cash on Delivery) as a proxy for home delivery
    const deliveryOrders = filteredOrders.filter(order => order.paymentMethod === 'cod');
    
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Home className="h-5 w-5" />
            Report by Home Delivery
          </CardTitle>
        </CardHeader>
        <CardContent>
          {deliveryOrders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No home delivery orders found for selected date range</p>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Order No</th>
                      <th className="text-left py-2">Date</th>
                      <th className="text-left py-2">Customer</th>
                      <th className="text-left py-2">Address</th>
                      <th className="text-left py-2">Amount</th>
                      <th className="text-left py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveryOrders.map((order) => (
                      <tr key={order.id} className="border-b">
                        <td className="py-2">#{order.id.slice(-6)}</td>
                        <td className="py-2">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="py-2">{order.customer?.name || 'Unknown Customer'}</td>
                        <td className="py-2">{[order.customer?.place, order.customer?.emirate].filter(Boolean).join(', ') || 'N/A'}</td>
                        <td className="py-2">AED {order.total.toFixed(2)}</td>
                        <td className="py-2">
                          <Badge variant="secondary">
                            {order.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Return Options Dialog */}
      {showReturnOptions && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Return Options</h3>
            <p className="mb-4">Select return type for Order #{selectedOrder.id.slice(-6)}</p>
            <div className="flex flex-col gap-3">
              <Button 
                variant={returnType === 'complete' ? 'default' : 'outline'} 
                onClick={() => handleReturnOptionSelect('complete')}
              >
                Completely Return
              </Button>
              <Button 
                variant={returnType === 'partial' ? 'default' : 'outline'} 
                onClick={() => handleReturnOptionSelect('partial')}
              >
                Partially Return
              </Button>
              <Button variant="outline" onClick={closeReturnOptions}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Date Range Filter */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Filter className="h-5 w-5" />
            Filter by Date Range
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from-date">From Date</Label>
              <Input
                id="from-date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to-date">To Date</Label>
              <Input
                id="to-date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setFromDate('');
                  setToDate('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Navigation */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeReport === 'bill' ? 'default' : 'outline'}
          className="flex items-center gap-2"
          onClick={() => setActiveReport('bill')}
        >
          <FileText className="h-4 w-4" />
          Report by Bill
        </Button>
        <Button
          variant={activeReport === 'item' ? 'default' : 'outline'}
          className="flex items-center gap-2"
          onClick={() => setActiveReport('item')}
        >
          <Package className="h-4 w-4" />
          Report by Item
        </Button>
        <Button
          variant={activeReport === 'daily' ? 'default' : 'outline'}
          className="flex items-center gap-2"
          onClick={() => setActiveReport('daily')}
        >
          <Calendar className="h-4 w-4" />
          Report by Per Day
        </Button>
        <Button
          variant={activeReport === 'delivery' ? 'default' : 'outline'}
          className="flex items-center gap-2"
          onClick={() => setActiveReport('delivery')}
        >
          <Home className="h-4 w-4" />
          Report by Home Delivery
        </Button>
        <Button variant="outline" className="flex items-center gap-2 ml-auto">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Report Content */}
      {activeReport === 'bill' && <ReportByBill />}
      {activeReport === 'item' && <ReportByItem />}
      {activeReport === 'daily' && <ReportByDaily />}
      {activeReport === 'delivery' && <ReportByDelivery />}
    </div>
  );
}