import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, RotateCcw, Filter } from 'lucide-react';
import { usePOSStore } from '@/hooks/usePOSStore';
import { Order } from '@/types/pos';

export function ReturnByBills() {
  const { orders } = usePOSStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [returnItems, setReturnItems] = useState<Record<string, number>>({});

  // Filter orders based on search term and date range
  const filterOrders = () => {
    let filtered = orders.filter(order => 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Apply date range filter
    if (fromDate || toDate) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        const from = fromDate ? new Date(fromDate) : null;
        const to = toDate ? new Date(toDate) : null;
        
        // Set time to end of day for toDate comparison
        if (to) {
          to.setHours(23, 59, 59, 999);
        }
        
        return (
          (!from || orderDate >= from) &&
          (!to || orderDate <= to)
        );
      });
    }
    
    return filtered;
  };

  const filteredOrders = filterOrders();

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    // Initialize return quantities to 0 for all items
    const initialReturnItems: Record<string, number> = {};
    order.items.forEach(item => {
      initialReturnItems[item.id] = 0;
    });
    setReturnItems(initialReturnItems);
  };

  const handleReturnQuantityChange = (itemId: string, quantity: number) => {
    const item = selectedOrder?.items.find(i => i.id === itemId);
    if (item && quantity >= 0 && quantity <= item.quantity) {
      setReturnItems(prev => ({
        ...prev,
        [itemId]: quantity
      }));
    }
  };

  const calculateReturnTotal = () => {
    if (!selectedOrder) return 0;
    
    return selectedOrder.items.reduce((total, item) => {
      const returnQuantity = returnItems[item.id] || 0;
      return total + (returnQuantity * item.product.price * (1 - item.discount / 100));
    }, 0);
  };

  const handleProcessReturn = () => {
    if (!selectedOrder) return;
    
    // In a real application, this would process the return
    console.log('Processing return for order:', selectedOrder.id);
    console.log('Return items:', returnItems);
    
    alert(`Return processed for order ${selectedOrder.id}. Total refund: AED ${calculateReturnTotal().toFixed(2)}`);
    
    // Reset selection
    setSelectedOrder(null);
    setReturnItems({});
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
                  setSearchTerm('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Return by Bills
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedOrder ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    placeholder="Search by order ID or customer name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map(order => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.customer.name || 'N/A'}</TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>AED {order.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSelectOrder(order)}
                          >
                            Select
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500">
                        No orders found for selected criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Order Details: {selectedOrder.id}</h3>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedOrder(null)}
                >
                  Back to Orders
                </Button>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Customer Information</h4>
                <p>{selectedOrder.customer.name || 'N/A'}</p>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead>Return Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedOrder.items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.product.name}</div>
                          <div className="text-sm text-gray-500">{item.product.sku}</div>
                        </div>
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>AED {item.product.price.toFixed(2)}</TableCell>
                      <TableCell>{item.discount}%</TableCell>
                      <TableCell>AED {item.subtotal.toFixed(2)}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max={item.quantity}
                          value={returnItems[item.id] || 0}
                          onChange={(e) => handleReturnQuantityChange(item.id, parseInt(e.target.value) || 0)}
                          className="w-20"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="flex justify-between items-center border-t pt-4">
                <div>
                  <p className="text-lg font-semibold">
                    Return Total: AED {calculateReturnTotal().toFixed(2)}
                  </p>
                </div>
                <Button onClick={handleProcessReturn}>
                  Process Return
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}