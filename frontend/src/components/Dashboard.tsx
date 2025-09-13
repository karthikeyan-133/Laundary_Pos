import React, { useEffect } from 'react';
import { TrendingUp, Users, DollarSign, ShoppingBag, Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Order, Product } from '@/types/pos';
import { usePOSStore } from '@/hooks/usePOSStore';

interface DashboardProps {
  orders: Order[];
}

export function Dashboard({ orders }: DashboardProps) {
  // Debugging: Log orders to see the data structure
  useEffect(() => {
    console.log('Dashboard Orders data:', orders);
    if (orders.length > 0) {
      console.log('Dashboard First order:', orders[0]);
      console.log('Dashboard First order createdAt:', orders[0].createdAt);
      console.log('Dashboard Type of createdAt:', typeof orders[0].createdAt);
      console.log('Dashboard Is createdAt a Date?', orders[0].createdAt instanceof Date);
      if (typeof orders[0].createdAt === 'string') {
        console.log('Dashboard Parsed date:', new Date(orders[0].createdAt));
        console.log('Dashboard Is parsed date valid?', !isNaN(new Date(orders[0].createdAt).getTime()));
      }
    }
  }, [orders]);

  const { 
    openingCash, 
    getTodayOrders, 
    getTodaySales, 
    getTodayCustomers, 
    getTodayProducts,
    getClosingBalance
  } = usePOSStore();

  // Calculate dashboard metrics using the orders prop
  const todayOrders = getTodayOrders();
  const todaySales = getTodaySales();
  const totalOrders = orders.length;
  const averageOrderValue = orders.length > 0 ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0;
  
  const recentOrders = orders.slice(0, 5);

  // Calculate top products
  const productSales: { [key: string]: { product: Product, quantity: number, revenue: number } } = {};
  
  orders.forEach(order => {
    // Add safety check for order.items
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        if (productSales[item.product.id]) {
          productSales[item.product.id].quantity += item.quantity;
          productSales[item.product.id].revenue += item.subtotal;
        } else {
          productSales[item.product.id] = {
            product: item.product,
            quantity: item.quantity,
            revenue: item.subtotal
          };
        }
      });
    }
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const formatDate = (date: Date | string | undefined | null) => {
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
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  };

  const getStatusBadgeVariant = (status: Order['status']) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Opening Cash
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AED {openingCash.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Today's opening balance
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's Collection
            </CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">AED {todaySales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {todayOrders.length} {todayOrders.length === 1 ? 'order' : 'orders'} today
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Closing Balance
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">AED {getClosingBalance().toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Opening + Today's sales
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's Products
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{getTodayProducts()}</div>
            <p className="text-xs text-muted-foreground">
              Unique products sold
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's Customers
            </CardTitle>
            <Users className="h-4 w-4 text-accent-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-foreground">{getTodayCustomers()}</div>
            <p className="text-xs text-muted-foreground">
              Unique customers
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Clock className="h-5 w-5" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div 
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-card-foreground">
                          {order.id}
                        </span>
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.customer?.name || 'Unknown Customer'} • {formatDate(new Date(order.createdAt))}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.items && Array.isArray(order.items) ? order.items.length : 0} {order.items && Array.isArray(order.items) && order.items.length === 1 ? 'item' : 'items'} • {order.paymentMethod}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">AED {order.total.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <TrendingUp className="h-5 w-5" />
              Top Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No sales data yet</p>
            ) : (
              <div className="space-y-4">
                {topProducts.map((item, index) => (
                  <div 
                    key={item.product.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-card-foreground">
                          {item.product.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} sold • {item.product.category}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-success">AED {item.revenue.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">revenue</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}