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
import { Order, Product } from '@/types/pos';

interface ReportsProps {
  orders: Order[];
  onReturnOrder?: (order: Order, type: 'complete' | 'partial' | null) => void;
}

export function Reports({ orders, onReturnOrder }: ReportsProps) {
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
    
    return dateObj.toLocaleDateString();
  };

  // Filter orders based on date range
  const filterOrdersByDate = (orders: Order[]): Order[] => {
    console.log('filterOrdersByDate called with:', { orders, fromDate, toDate });
    if (!fromDate && !toDate) {
      console.log('No date filters applied, returning all orders');
      return orders;
    }
    
    const filtered = orders.filter(order => {
      // Use safe date conversion for order createdAt
      let orderDate: Date;
      if (order.createdAt instanceof Date) {
        orderDate = order.createdAt;
      } else {
        orderDate = new Date(order.createdAt);
      }
      
      // Check if orderDate is valid
      if (isNaN(orderDate.getTime())) {
        console.log('Invalid date for order:', order.id);
        return false; // Skip invalid dates
      }
      
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;
      
      // Set time to end of day for toDate comparison
      if (to) {
        to.setHours(23, 59, 59, 999);
      }
      
      const result = (
        (!from || orderDate >= from) &&
        (!to || orderDate <= to)
      );
      
      console.log('Order date filter result for order', order.id, ':', result);
      return result;
    });
    
    console.log('Filtered orders:', filtered);
    return filtered;
  };

  const filteredOrders = filterOrdersByDate(orders);

  // Debugging: Log orders to see the data structure
  useEffect(() => {
    console.log('Orders data:', orders);
    if (orders.length > 0) {
      console.log('First order:', orders[0]);
      console.log('First order createdAt:', orders[0].createdAt);
      console.log('Type of createdAt:', typeof orders[0].createdAt);
      console.log('Is createdAt a Date?', orders[0].createdAt instanceof Date);
      if (typeof orders[0].createdAt === 'string') {
        console.log('Parsed date:', new Date(orders[0].createdAt));
        console.log('Is parsed date valid?', !isNaN(new Date(orders[0].createdAt).getTime()));
      }
    }
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
    setShowReturnOptions(false);
  };

  // Close return options dialog
  const closeReturnOptions = () => {
    setShowReturnOptions(false);
    setSelectedOrder(null);
    setReturnType(null);
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
                          <Button variant="outline" size="sm">
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
    console.log('ReportByItem rendered with filteredOrders:', filteredOrders);
    // Aggregate items across filtered orders
    const itemSales: { [key: string]: { product: Product, quantity: number, revenue: number } } = {};
    
    filteredOrders.forEach((order, orderIndex) => {
      console.log(`Processing order ${orderIndex}:`, order);
      // Add safety check for order.items
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item, itemIndex) => {
          console.log(`Processing item ${itemIndex} in order ${orderIndex}:`, item);
          if (itemSales[item.product.id]) {
            itemSales[item.product.id].quantity += item.quantity;
            itemSales[item.product.id].revenue += item.subtotal;
          } else {
            itemSales[item.product.id] = {
              product: item.product,
              quantity: item.quantity,
              revenue: item.subtotal
            };
          }
        });
      } else {
        console.log(`Order ${orderIndex} has no valid items array`);
      }
    });

    const items = Object.values(itemSales);
    console.log('Aggregated items:', items);

    // Calculate totals for the report
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalRevenue = items.reduce((sum, item) => sum + item.revenue, 0);

    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Package className="h-5 w-5" />
            Report by Item
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No items sold for selected date range</p>
          ) : (
            <div className="space-y-4">
              {/* Summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Total Items</p>
                    <p className="text-2xl font-bold">{items.length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Total Quantity Sold</p>
                    <p className="text-2xl font-bold">{totalQuantity}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">AED {totalRevenue.toFixed(2)}</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Item Name</th>
                      <th className="text-left py-2">Category</th>
                      <th className="text-left py-2">Quantity Sold</th>
                      <th className="text-left py-2">Revenue</th>
                      <th className="text-left py-2">Avg. Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.product.id} className="border-b">
                        <td className="py-2">{item.product.name}</td>
                        <td className="py-2">{item.product.category}</td>
                        <td className="py-2">{item.quantity}</td>
                        <td className="py-2">AED {item.revenue.toFixed(2)}</td>
                        <td className="py-2">AED {(item.revenue / item.quantity).toFixed(2)}</td>
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
                        <td className="py-2">{order.customer?.address || 'N/A'}</td>
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