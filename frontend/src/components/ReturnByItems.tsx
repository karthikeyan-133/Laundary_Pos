import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, RotateCcw, Filter } from 'lucide-react';
import { usePOSStore } from '@/hooks/usePOSStore';
import { Order, CartItem } from '@/types/pos';

interface ReturnByItemsProps {
  preselectedOrder?: Order | null;
  returnType?: 'complete' | 'partial' | null;
}

export function ReturnByItems({ preselectedOrder, returnType }: ReturnByItemsProps) {
  console.log('ReturnByItems rendered with preselectedOrder:', preselectedOrder, 'and returnType:', returnType);
  const { orders } = usePOSStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<Record<string, {item: CartItem, orderId: string, quantity: number}>>({});
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(preselectedOrder ? [preselectedOrder] : orders);
  const [preSelectionMessage, setPreSelectionMessage] = useState<string | null>(null);

  // Apply date range filter when dates change
  useEffect(() => {
    // If there's a preselected order, don't apply date filters
    if (preselectedOrder) {
      setFilteredOrders([preselectedOrder]);
      return;
    }
    
    let filtered = orders;
    
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
    
    setFilteredOrders(filtered);
  }, [fromDate, toDate, orders, preselectedOrder]);

  // Handle preselected order and return type
  useEffect(() => {
    console.log('useEffect triggered with preselectedOrder:', preselectedOrder, 'returnType:', returnType);
    if (preselectedOrder) {
      // Set the preselected order as the only filtered order
      setFilteredOrders([preselectedOrder]);
      setFromDate('');
      setToDate('');
      setSearchTerm('');
      setPreSelectionMessage(null);
      
      // If returnType is 'complete' or 'partial', pre-select items based on the return type
      if (returnType === 'complete' || returnType === 'partial') {
        console.log('Processing returnType:', returnType);
        const initialSelectedItems: Record<string, {item: CartItem, orderId: string, quantity: number}> = {};
        
        // Add safety check for preselectedOrder.items
        if (preselectedOrder.items && Array.isArray(preselectedOrder.items)) {
          preselectedOrder.items.forEach(item => {
            const key = `${preselectedOrder.id}-${item.id}`;
            const quantity = returnType === 'complete' ? item.quantity : Math.floor(item.quantity / 2);
            console.log(`Setting quantity for item ${item.id}:`, quantity);
            
            initialSelectedItems[key] = {
              item,
              orderId: preselectedOrder.id,
              quantity
            };
          });
        }
        
        setSelectedItems(initialSelectedItems);
        console.log('Selected items set:', initialSelectedItems);
        
        // Show a notification to the user about pre-selection
        const itemCount = Object.keys(initialSelectedItems).length;
        const returnTypeName = returnType === 'complete' ? 'Completely Return' : 'Partially Return';
        setPreSelectionMessage(`Pre-selected ${itemCount} items for ${returnTypeName}`);
        
        // Clear the message after 5 seconds
        setTimeout(() => {
          setPreSelectionMessage(null);
        }, 5000);
      }
    } else {
      // Reset to all orders when no preselected order
      setFilteredOrders(orders);
      setPreSelectionMessage(null);
    }
  }, [preselectedOrder, orders, returnType]); // Add returnType to dependency array

  // Flatten order items - if there's a preselected order, only show items from that order
  const allOrderItems: { item: CartItem; order: Order }[] = [];
  
  if (preselectedOrder) {
    // Only show items from the preselected order
    // Add safety check for preselectedOrder.items
    if (preselectedOrder.items && Array.isArray(preselectedOrder.items)) {
      preselectedOrder.items.forEach(item => {
        allOrderItems.push({ item, order: preselectedOrder });
      });
    }
  } else {
    // Show items from all filtered orders
    filteredOrders.forEach(order => {
      // Add safety check for order.items
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          allOrderItems.push({ item, order });
        });
      }
    });
  }

  const filteredItems = preselectedOrder 
    ? allOrderItems // No filtering when preselectedOrder is active
    : allOrderItems.filter(({ item, order }) => 
        item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
      );

  const handleSelectItem = (item: CartItem, orderId: string) => {
    const key = `${orderId}-${item.id}`;
    if (selectedItems[key]) {
      // Remove item if already selected
      const newSelectedItems = { ...selectedItems };
      delete newSelectedItems[key];
      setSelectedItems(newSelectedItems);
    } else {
      // Add item to selection
      setSelectedItems(prev => ({
        ...prev,
        [key]: {
          item,
          orderId,
          quantity: 1
        }
      }));
    }
  };

  const handleQuantityChange = (itemId: string, orderId: string, quantity: number) => {
    const key = `${orderId}-${itemId}`;
    const selectedItem = selectedItems[key];
    
    if (selectedItem && quantity >= 0 && quantity <= selectedItem.item.quantity) {
      setSelectedItems(prev => ({
        ...prev,
        [key]: {
          ...selectedItem,
          quantity
        }
      }));
    }
  };

  const calculateTotalReturn = () => {
    return Object.values(selectedItems).reduce((total, { item, quantity }) => {
      return total + (quantity * item.product.price * (1 - item.discount / 100));
    }, 0);
  };

  const handleProcessReturn = () => {
    if (Object.keys(selectedItems).length === 0) return;
    
    // Group items by order
    const itemsByOrder: Record<string, {item: CartItem, quantity: number}[]> = {};
    Object.entries(selectedItems).forEach(([key, { item, orderId, quantity }]) => {
      if (!itemsByOrder[orderId]) {
        itemsByOrder[orderId] = [];
      }
      itemsByOrder[orderId].push({ item, quantity });
    });
    
    // In a real application, this would process the return
    console.log('Processing return by items:', itemsByOrder);
    
    alert(`Return processed for ${Object.keys(selectedItems).length} items. Total refund: AED ${calculateTotalReturn().toFixed(2)}`);
    
    // Reset selection
    setSelectedItems({});
  };

  const isItemSelected = (itemId: string, orderId: string) => {
    return !!selectedItems[`${orderId}-${itemId}`];
  };

  return (
    <div className="space-y-6">
      {/* Date Range Filter - only show if no preselected order */}
      {!preselectedOrder && (
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
      )}

      {/* Show preselected order info */}
      {preselectedOrder && (
        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Returning Items from Order: {preselectedOrder.id.slice(-6)}</h3>
                <p className="text-muted-foreground">
                  Customer: {preselectedOrder.customer?.name || 'N/A'} | 
                  Date: {new Date(preselectedOrder.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                >
                  Back to Reports
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pre-selection message */}
      {preSelectionMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Success! </strong>
          <span className="block sm:inline">{preSelectionMessage}</span>
        </div>
      )}

      {/* Return mode message */}
      {preselectedOrder && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-blue-800">
            <strong>Return Mode:</strong> Only items from Order #{preselectedOrder.id.slice(-6)} are shown. 
            Select items to return and specify quantities.
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Return by Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search - only show if no preselected order */}
            {!preselectedOrder && (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    placeholder="Search by product name, SKU, or order ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  {!preselectedOrder && <TableHead>Order ID</TableHead>}
                  <TableHead>Date</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Return Qty</TableHead>
                  <TableHead>Select</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length > 0 ? (
                  filteredItems.map(({ item, order }) => (
                    <TableRow 
                      key={`${order.id}-${item.id}`} 
                      className={isItemSelected(item.id, order.id) ? "bg-muted" : ""}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.product.name}</div>
                          <div className="text-sm text-gray-500">{item.product.sku}</div>
                        </div>
                      </TableCell>
                      {!preselectedOrder && <TableCell className="font-medium">{order.id.slice(-6)}</TableCell>}
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>AED {item.product.price.toFixed(2)}</TableCell>
                      <TableCell>
                        {isItemSelected(item.id, order.id) ? (
                          <Input
                            type="number"
                            min="0"
                            max={item.quantity}
                            value={selectedItems[`${order.id}-${item.id}`]?.quantity || 0}
                            onChange={(e) => handleQuantityChange(item.id, order.id, parseInt(e.target.value) || 0)}
                            className="w-20"
                          />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant={isItemSelected(item.id, order.id) ? "default" : "outline"} 
                          size="sm"
                          onClick={() => handleSelectItem(item, order.id)}
                        >
                          {isItemSelected(item.id, order.id) ? "Selected" : "Select"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={preselectedOrder ? 6 : 7} className="text-center text-gray-500">
                      {preselectedOrder 
                        ? "No items found in this order" 
                        : "No items found for selected criteria"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            
            {Object.keys(selectedItems).length > 0 && (
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="text-lg font-semibold">Selected Items for Return</h3>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      {!preselectedOrder && <TableHead>Order ID</TableHead>}
                      <TableHead>Quantity</TableHead>
                      <TableHead>Return Qty</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(selectedItems).map(([key, { item, orderId, quantity }]) => {
                      const subtotal = quantity * item.product.price * (1 - item.discount / 100);
                      return (
                        <TableRow key={key}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.product.name}</div>
                              <div className="text-sm text-gray-500">{item.product.sku}</div>
                            </div>
                          </TableCell>
                          {!preselectedOrder && <TableCell>{orderId.slice(-6)}</TableCell>}
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{quantity}</TableCell>
                          <TableCell>AED {item.product.price.toFixed(2)}</TableCell>
                          <TableCell>AED {subtotal.toFixed(2)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                
                <div className="flex justify-between items-center border-t pt-4">
                  <div>
                    <p className="text-lg font-semibold">
                      Total Return: AED {calculateTotalReturn().toFixed(2)}
                    </p>
                  </div>
                  <Button onClick={handleProcessReturn}>
                    Process Return
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}