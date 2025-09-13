import React, { useState } from 'react';
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
  onReturnOrder?: (order: Order) => void;
}

export function Reports({ orders, onReturnOrder }: ReportsProps) {
  const [activeReport, setActiveReport] = useState<
    'bill' | 'item' | 'daily' | 'delivery'
  >('bill');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  // Filter orders based on date range
  const filterOrdersByDate = (orders: Order[]): Order[] => {
    if (!fromDate && !toDate) return orders;
    
    return orders.filter(order => {
      // Handle invalid dates
      const orderDateObj = new Date(order.createdAt);
      if (!orderDateObj || isNaN(orderDateObj.getTime())) {
        console.warn('Invalid date for order:', order.id);
        return false; // Exclude orders with invalid dates
      }
      
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;
      
      // Set time to end of day for toDate comparison
      if (to) {
        to.setHours(23, 59, 59, 999);
      }
      
      return (
        (!from || orderDateObj >= from) &&
        (!to || orderDateObj <= to)
      );
    });
  };

  const filteredOrders = filterOrdersByDate(orders);

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
                        {order.createdAt && !isNaN(new Date(order.createdAt).getTime()) 
                          ? new Date(order.createdAt).toLocaleDateString() 
                          : 'Invalid Date'}
                      </td>
                      <td className="py-2">AED {order.total.toFixed(2)}</td>
                      <td className="py-2">
                        <Badge variant="secondary">
                          {order.paymentMethod}
                        </Badge>
                      </td>
                      <td className="py-2">
                        {order.paymentMethod === 'cash' ? 'AED ' + order.total.toFixed(2) : 'AED 0.00'}
                      </td>
                      <td className="py-2">
                        {order.paymentMethod === 'card' ? 'AED ' + order.total.toFixed(2) : 'AED 0.00'}
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
                            onClick={() => onReturnOrder && onReturnOrder(order)}
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
    // Aggregate items across filtered orders
    const itemSales: { [key: string]: { product: Product, quantity: number, revenue: number } } = {};
    
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
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
    });

    const items = Object.values(itemSales);

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
      // Handle invalid dates
      const orderDate = new Date(order.createdAt);
      if (!orderDate || isNaN(orderDate.getTime())) {
        console.warn('Invalid date for order:', order.id);
        return;
      }
      
      const date = orderDate.toLocaleDateString();
      if (dailySales[date]) {
        dailySales[date].orders += 1;
        dailySales[date].revenue += order.total;
      } else {
        dailySales[date] = {
          date,
          orders: 1,
          revenue: order.total
        };
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
                          {order.createdAt && !isNaN(new Date(order.createdAt).getTime()) 
                            ? new Date(order.createdAt).toLocaleDateString() 
                            : 'Invalid Date'}
                        </td>
                        <td className="py-2">{order.customer.name}</td>
                        <td className="py-2">{order.customer.address || 'N/A'}</td>
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