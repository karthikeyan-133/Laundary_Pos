import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, RotateCcw, Filter, Printer, Eye } from 'lucide-react';
import { usePOSStore } from '@/hooks/usePOSStore';
import { Order } from '@/types/pos';

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
const getServiceRate = (product: any, service: 'iron' | 'washAndIron' | 'dryClean') => {
  switch (service) {
    case 'iron': return product.ironRate || 0;
    case 'washAndIron': return product.washAndIronRate || 0;
    case 'dryClean': return product.dryCleanRate || 0;
    default: return 0;
  }
};

interface ReturnByBillsProps {
  onReturnProcessed?: (orderId: string, items: Record<string, number>, reason: string) => void;
  onViewReceipt?: (order: Order) => void;
  onPrintReceipt?: (order: Order) => void;
}

export function ReturnByBills({ onReturnProcessed, onViewReceipt, onPrintReceipt }: ReturnByBillsProps) {
  const { orders, processReturn, settings, fetchReturns, refreshData, reloadOrders } = usePOSStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [returnItems, setReturnItems] = useState<Record<string, number>>({});
  const [returnReason, setReturnReason] = useState<string>('');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [returnType, setReturnType] = useState<'complete' | 'partial' | null>(null);

  // Fetch returns when component mounts
  useEffect(() => {
    refreshData();
  }, []); // Only run once on mount

  // Set today's date as default
  useEffect(() => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    setFromDate(todayString);
    setToDate(todayString);
  }, []);

  // Filter orders based on search term and date range
  // Only show orders that are NOT returned
  useEffect(() => {
    console.log('Filtering orders with:', { searchTerm, fromDate, toDate, allOrders: orders });
    
    // Filter out orders that have been returned (have status 'returned')
    let filtered = orders.filter(order => {
      // Check if order status is explicitly NOT 'returned'
      const isNotReturned = order.status !== 'returned';
      console.log(`Order ${order.id} - Status: ${order.status}, IsNotReturned: ${isNotReturned}`);
      return isNotReturned;
    });
    
    // Apply search filter
    filtered = filtered.filter(order => 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer && order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    console.log('After search filter:', filtered.length);
    
    // Apply date range filter
    if (fromDate || toDate) {
      filtered = filtered.filter(order => {
        try {
          const orderDate = new Date(order.createdAt);
          const from = fromDate ? new Date(fromDate) : null;
          const to = toDate ? new Date(toDate) : null;
          
          // Set time to start of day for fromDate comparison
          if (from) {
            from.setHours(0, 0, 0, 0);
          }
          
          // Set time to end of day for toDate comparison
          if (to) {
            to.setHours(23, 59, 59, 999);
          }
          
          const result = (
            (!from || orderDate >= from) &&
            (!to || orderDate <= to)
          );
          
          console.log('Date filter for order', order.id, ':', orderDate, 'From:', from, 'To:', to, 'Result:', result);
          return result;
        } catch (err) {
          console.error('Error filtering order by date:', order.id, err);
          return false;
        }
      });
    }
    
    console.log('Final filtered orders:', filtered.length);
    setFilteredOrders(filtered);
  }, [searchTerm, fromDate, toDate, orders]);

  const handleSelectOrder = (order: Order) => {
    console.log('Selecting order:', order);
    setSelectedOrder(order);
    // Initialize return quantities to 0 for all items
    const initialReturnItems: Record<string, number> = {};
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        initialReturnItems[item.id] = 0;
      });
    }
    setReturnItems(initialReturnItems);
    setReturnType(null);
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
    
    if (!selectedOrder.items || !Array.isArray(selectedOrder.items)) return 0;
    
    return selectedOrder.items.reduce((total, item) => {
      const returnQuantity = returnItems[item.id] || 0;
      // Use ironRate as default price for returns
      const itemTotal = (returnQuantity * item.product.ironRate * (1 - item.discount / 100));
      return total + itemTotal;
    }, 0);
  };

  const handleProcessReturn = async () => {
    if (!selectedOrder) {
      console.log('No order selected');
      return;
    }
    
    console.log('Processing return for order:', selectedOrder.id);
    
    // Prepare items for return
    const itemsToReturn = selectedOrder.items
      .filter(item => (returnItems[item.id] || 0) > 0)
      .map(item => ({
        product: {
          ...item.product,
          // Ensure required fields are present
          id: item.product.id || `unknown-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: item.product.name || 'Unknown Product',
          ironRate: item.product.ironRate || 0,
          washAndIronRate: item.product.washAndIronRate || 0,
          dryCleanRate: item.product.dryCleanRate || 0,
          barcode: item.product.barcode || '',
          category: item.product.category || 'Unknown',
          description: item.product.description || ''
        },
        quantity: returnItems[item.id] || 0,
        discount: item.discount,
        service: item.service || 'iron' // Add service field
      }));
    
    console.log('Items to return:', itemsToReturn);
    
    if (itemsToReturn.length === 0) {
      alert('Please select at least one item to return');
      return;
    }
    
    // Process the return
    const result = await processReturn(selectedOrder.id, itemsToReturn, returnReason);
    
    if (result) {
      // Refresh returns data
      await fetchReturns();
      
      // Refresh orders data to update the UI
      await reloadOrders();
      
      // Show success message
      alert('Return processed successfully!');
      
      // Call the callback if provided (but don't navigate to receipt view)
      if (onReturnProcessed) {
        // Pass empty string as the order ID to indicate we don't want to show the receipt
        onReturnProcessed('', returnItems, returnReason);
      }
      
      // Reset selection
      setSelectedOrder(null);
      setReturnItems({});
      setReturnReason('');
      setReturnType(null);
    } else {
      // The error message is now handled in the processReturn function
      // Just reset the selection
      setSelectedOrder(null);
      setReturnItems({});
      setReturnReason('');
      setReturnType(null);
    }
  };

  // Format date and time
  const formatDateTime = (date: Date | string) => {
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) {
        return { dateStr: 'Invalid Date', timeStr: 'Invalid Time' };
      }
      // Adjust for Dubai time (UTC+4)
      const dubaiTime = new Date(d.getTime() + (4 * 60 * 60 * 1000));
      const dateStr = dubaiTime.toLocaleDateString('en-US', { 
        timeZone: 'Asia/Dubai',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      const timeStr = dubaiTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true,
        timeZone: 'Asia/Dubai'
      });
      return { dateStr, timeStr };
    } catch (err) {
      console.error('Error formatting date:', date, err);
      return { dateStr: 'Invalid Date', timeStr: 'Invalid Time' };
    }
  };

  // Handle return type selection
  const handleReturnTypeSelect = (type: 'complete' | 'partial') => {
    setReturnType(type);
    
    if (type === 'complete' && selectedOrder) {
      // For complete return, set all items to their full quantity
      const completeReturnItems: Record<string, number> = {};
      if (selectedOrder.items && Array.isArray(selectedOrder.items)) {
        selectedOrder.items.forEach(item => {
          completeReturnItems[item.id] = item.quantity;
        });
      }
      setReturnItems(completeReturnItems);
      
      // For complete return, directly process the return without showing item selection
      setReturnReason('Complete Return');
      // Automatically process the complete return
      setTimeout(() => {
        handleProcessReturn();
      }, 100);
    }
    // For partial return, we'll show the item selection screen
    // The UI will automatically update based on the returnType state
  };

  // Generate receipt for return
  const generateReturnReceipt = (order: Order) => {
    if (!settings) {
      console.error('Settings not available for receipt generation');
      return;
    }

    const receiptContent = `
      <html>
        <head>
          <title>Return Receipt - ${order.id}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 10px;
              width: 4in;
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
              max-width: 120px;
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
            <div><strong>RETURN RECEIPT</strong></div>
          </div>
          
          <div class="receipt-info">
            <div>Order ID: ${order.id}</div>
            <div>Date: ${new Date(order.createdAt).toLocaleString()}</div>
            <div>Customer: ${order.customer?.name || 'Walk-in Customer'}</div>
          </div>
          
          <div style="border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 5px;">
            <strong>Returned Items:</strong>
          </div>
          
          <div>
            ${order.items
              .filter(item => (returnItems[item.id] || 0) > 0)
              .map(item => {
                const returnQuantity = returnItems[item.id] || 0;
                const serviceRate = getServiceRate(item.product, item.service);
                const returnSubtotal = returnQuantity * serviceRate * (1 - item.discount / 100);

                return `
                  <div class="item-row">
                    <div class="item-details">
                      <div class="item-name">${item.product.name || 'Unknown Product'}</div>
                      <div>${returnQuantity} × ${settings.currency}${Number(serviceRate).toFixed(2)}</div>
                    </div>
                    <div class="item-amount">${settings.currency}${Number(returnSubtotal).toFixed(2)}</div>
                  </div>
                `;
              }).join('')}
          </div>
          
          <div class="divider"></div>
          
          <div>
            <div class="item-row" style="font-weight: bold; font-size: 14px;">
              <div>Total Refund:</div>
              <div>${settings.currency}${calculateReturnTotal().toFixed(2)}</div>
            </div>
          </div>
          
          <div class="text-center mt-10" style="font-size: 12px;">
            <p>Thank you!</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
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
                  const today = new Date();
                  const todayString = today.toISOString().split('T')[0];
                  setFromDate(todayString);
                  setToDate(todayString);
                  setSearchTerm('');
                }}
              >
                Today
              </Button>
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
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => { fetchReturns(); }}
              className="ml-auto"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
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
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Item Count</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map(order => {
                      const { dateStr, timeStr } = formatDateTime(order.createdAt);
                      const itemCount = order.items ? order.items.length : 0;
                      return (
                        <TableRow key={order.id}>
                          <TableCell>{dateStr}</TableCell>
                          <TableCell>{timeStr}</TableCell>
                          <TableCell>{order.id}</TableCell>
                          <TableCell>{itemCount}</TableCell>
                          <TableCell>{order.status}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleSelectOrder(order)}
                              >
                                Select
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500">
                        No orders found for selected criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : returnType === null ? (
            // Return type selection
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Order Details: {selectedOrder.id}</h3>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedOrder(null);
                    setReturnType(null);
                  }}
                >
                  Back to Orders
                </Button>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Customer Information</h4>
                <p>{selectedOrder.customer?.name || 'N/A'}</p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Return Options</h4>
                <p className="mb-4">Select return type for Order #{selectedOrder.id.slice(-6)}</p>
                <div className="flex flex-col gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => handleReturnTypeSelect('complete')}
                  >
                    Completely Return
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleReturnTypeSelect('partial')}
                  >
                    Partially Return
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedOrder(null);
                      setReturnType(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
                {returnType === 'complete' && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-blue-800">
                      <strong>Note:</strong> All items have been selected for return. 
                      Please click "Process Return" button below to complete the return process.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Return item selection
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Order Details: {selectedOrder.id}</h3>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedOrder(null);
                    setReturnType(null);
                    setReturnItems({});
                  }}
                >
                  Back to Orders
                </Button>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Customer Information</h4>
                <p>{selectedOrder.customer?.name || 'N/A'}</p>
              </div>
              
              {/* Return reason input */}
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="return-reason">Return Reason</Label>
                    <Input
                      id="return-reason"
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      placeholder="Enter reason for return (optional)"
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Item ID</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Return Qty</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedOrder.items && Array.isArray(selectedOrder.items) ? (
                    selectedOrder.items.map(item => {
                      const { dateStr, timeStr } = formatDateTime(selectedOrder.createdAt);
                      return (
                        <TableRow key={item.id}>
                          <TableCell>{dateStr}</TableCell>
                          <TableCell>{timeStr}</TableCell>
                          <TableCell>{selectedOrder.id}</TableCell>
                          <TableCell>{item.id}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.product.name}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max={item.quantity}
                              value={returnItems[item.id] || 0}
                              onChange={(e) => handleReturnQuantityChange(item.id, parseInt(e.target.value) || 0)}
                              className="w-20"
                              disabled={returnType === 'complete'}
                            />
                          </TableCell>
                          <TableCell>{settings?.currency} {Number(item.product.ironRate).toFixed(2)}</TableCell>
                          <TableCell>Return Request Initiated</TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-gray-500">
                        No items found for this order
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              
              <div className="flex justify-between items-center border-t pt-4">
                <div>
                  <p className="text-lg font-semibold">
                    Return Total: {settings?.currency} {calculateReturnTotal().toFixed(2)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => generateReturnReceipt(selectedOrder)}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print Receipt
                  </Button>
                  <Button onClick={handleProcessReturn}>
                    Process Return
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}