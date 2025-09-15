import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, RotateCcw, Filter, Printer, Eye } from 'lucide-react';
import { usePOSStore } from '@/hooks/usePOSStore';
import { Order, CartItem } from '@/types/pos';

interface ReturnRecord {
  date: string;
  time: string;
  orderId: string;
  productCode: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
  status: string;
}

interface ReturnByItemsProps {
  returns?: any[];
  preselectedOrder?: Order | null;
  returnType?: 'complete' | 'partial' | null;
  onReturnProcessed?: (orderId: string, items: Record<string, number>, reason: string) => void;
  onViewReceipt?: (order: Order) => void;
  onPrintReceipt?: (order: Order) => void;
}

export function ReturnByItems({ preselectedOrder, returnType: initialReturnType, onReturnProcessed, onViewReceipt, onPrintReceipt }: ReturnByItemsProps) {
  console.log('ReturnByItems rendered with preselectedOrder:', preselectedOrder, 'and returnType:', initialReturnType);
  const { orders, processReturn, settings, returns, fetchReturns, refreshData, reloadOrders } = usePOSStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<Record<string, {item: CartItem, orderId: string, quantity: number}>>({});
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(preselectedOrder ? [preselectedOrder] : []);
  const [preSelectionMessage, setPreSelectionMessage] = useState<string | null>(null);
  const [returnReason, setReturnReason] = useState<string>('');
  const [returnType, setReturnType] = useState<'complete' | 'partial' | null>(initialReturnType || null);

  // Fetch returns when component mounts
  useEffect(() => {
    refreshData();
  }, []); // Only run once on mount

  // Filter orders based on search term, date range, and return status
  useEffect(() => {
    console.log('useEffect triggered with:', { preselectedOrder, fromDate, toDate, allOrders: orders });
    
    // If there's a preselected order, don't apply date filters
    if (preselectedOrder) {
      setFilteredOrders([preselectedOrder]);
      return;
    }
    
    // Filter out orders that have been returned (have status 'returned')
    let filtered = orders.filter(order => order.status !== 'returned');
    
    console.log('Initial filtered orders:', filtered.length);
    
    if (fromDate || toDate) {
      filtered = filtered.filter(order => {
        try {
          const orderDate = new Date(order.createdAt);
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
          
          console.log('Date filter for order', order.id, ':', orderDate, 'From:', from, 'To:', to, 'Result:', result);
          return result;
        } catch (err) {
          console.error('Error filtering order by date:', order.id, err);
          return false;
        }
      });
      
      console.log('After date filter:', filtered.length);
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(order => {
        // Add safety check for order.items
        if (!order.items || !Array.isArray(order.items)) return false;
        
        return order.items.some(item => 
          item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.product.sku.toLowerCase().includes(searchTerm.toLowerCase())
        ) || order.id.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }
    
    setFilteredOrders(filtered);
  }, [fromDate, toDate, orders, preselectedOrder, searchTerm]);

  // Handle preselected order and return type
  useEffect(() => {
    console.log('Preselected order effect triggered with:', { preselectedOrder, initialReturnType });
    if (preselectedOrder) {
      // Set the preselected order as the only filtered order
      setFilteredOrders([preselectedOrder]);
      setFromDate('');
      setToDate('');
      setSearchTerm('');
      setPreSelectionMessage(null);
      setReturnType(initialReturnType || null);
      
      // If returnType is 'complete' or 'partial', pre-select items based on the return type
      if (initialReturnType === 'complete' || initialReturnType === 'partial') {
        console.log('Processing returnType:', initialReturnType);
        const initialSelectedItems: Record<string, {item: CartItem, orderId: string, quantity: number}> = {};
        
        // Add safety check for preselectedOrder.items
        if (preselectedOrder.items && Array.isArray(preselectedOrder.items)) {
          preselectedOrder.items.forEach(item => {
            const key = `${preselectedOrder.id}-${item.id}`;
            const quantity = initialReturnType === 'complete' ? item.quantity : Math.floor(item.quantity / 2);
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
        const returnTypeName = initialReturnType === 'complete' ? 'Completely Return' : 'Partially Return';
        setPreSelectionMessage(`Pre-selected ${itemCount} items for ${returnTypeName}`);
        
        // For complete return, directly process the return without showing item selection
        if (initialReturnType === 'complete') {
          setReturnReason('Complete Return');
          // Process the return immediately after a short delay to allow state to update
          setTimeout(() => {
            handleProcessReturn();
          }, 100);
        }
        
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
  }, [preselectedOrder, orders, initialReturnType]);

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

  // Filter out items that have already been returned
  const filteredItems = (() => {
    if (preselectedOrder) {
      // For preselected orders, don't apply return filtering
      return allOrderItems.filter(({ item, order }) => 
        item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      // For general view, filter out items that have been returned
      return allOrderItems.filter(({ item, order }) => {
        // Check if this item has been returned
        const isReturned = returns.some(returnRecord => {
          // Check if this return record is for the same order
          if (returnRecord.order_id !== order.id) return false;
          
          // Check if this specific item was returned
          const returnItems = returnRecord.return_items || [];
          return returnItems.some((returnItem: any) => {
            // Match by product ID or SKU
            const returnProduct = returnItem.products || {};
            const itemProduct = item.product;
            
            // Check if product IDs match or SKUs match
            return (returnProduct.id && returnProduct.id === itemProduct.id) || 
                   (returnProduct.sku && returnProduct.sku === itemProduct.sku);
          });
        });
        
        // Include items that haven't been returned and match search criteria
        return !isReturned && (
          item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }
  })();

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
      const itemTotal = (quantity * item.product.price * (1 - item.discount / 100));
      console.log('Calculating item total for return:', { quantity, price: item.product.price, discount: item.discount, itemTotal });
      return total + itemTotal;
    }, 0);
  };

  const handleProcessReturn = async () => {
    console.log('Processing return with selected items:', selectedItems);
    
    if (Object.keys(selectedItems).length === 0) {
      alert('Please select at least one item to return');
      return;
    }
    
    // Group items by order
    const itemsByOrder: Record<string, {item: CartItem, quantity: number}[]> = {};
    Object.entries(selectedItems).forEach(([key, { item, orderId, quantity }]) => {
      if (!itemsByOrder[orderId]) {
        itemsByOrder[orderId] = [];
      }
      itemsByOrder[orderId].push({ item, quantity });
    });
    
    console.log('Items grouped by order:', itemsByOrder);
    
    // Process return for each order
    let allSuccessful = true;
    let processedOrderId = '';
    for (const [orderId, items] of Object.entries(itemsByOrder)) {
      // Transform items to match the expected format for processReturn
      const transformedItems = items.map(({ item, quantity }) => ({
        product: item.product,
        quantity,
        discount: item.discount
      }));
      
      console.log('Processing return for order:', orderId, 'Items:', transformedItems);
      const result = await processReturn(orderId, transformedItems, returnReason);
      if (result) {
        processedOrderId = orderId; // Store the processed order ID
      } else {
        allSuccessful = false;
        // Break early if one fails
        break;
      }
    }
    
    if (allSuccessful) {
      // Refresh returns data
      await fetchReturns();
      
      // Refresh orders data to update the UI
      await reloadOrders();
      
      // Convert selectedItems to returnItems format for the callback
      const returnItems: Record<string, number> = {};
      Object.entries(selectedItems).forEach(([key, { item, quantity }]) => {
        returnItems[item.id] = quantity;
      });
      
      // Call the callback to navigate to receipt view
      if (onReturnProcessed && processedOrderId) {
        onReturnProcessed(processedOrderId, returnItems, returnReason);
      } else {
        // Show print option only after successful return processing
        generateReturnReceipt();
      }
      
      // Reset selection
      setSelectedItems({});
      setReturnReason('');
    } else {
      // The error message is now handled in the processReturn function
      // Just reset the selection
      setSelectedItems({});
      setReturnReason('');
    }
  };

  // Generate receipt for return
  const generateReturnReceipt = () => {
    if (!settings) {
      console.error('Settings not available for receipt generation');
      return;
    }

    // Get selected items for receipt
    const selectedItemsArray = Object.values(selectedItems);
    
    if (selectedItemsArray.length === 0) {
      alert('No items selected for return');
      return;
    }

    // Get order information (assuming all items are from the same order for simplicity)
    const firstOrder = orders.find(o => o.id === selectedItemsArray[0].orderId);
    
    const receiptContent = `
      <html>
        <head>
          <title>Return Receipt</title>
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
            <div><strong>RETURN RECEIPT</strong></div>
          </div>
          
          <div class="receipt-info">
            <div>Order ID: ${firstOrder?.id || 'N/A'}</div>
            <div>Date: ${new Date().toLocaleString()}</div>
            <div>Customer: ${firstOrder?.customer?.name || 'N/A'}</div>
          </div>
          
          <div style="border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 5px;">
            <strong>Returned Items:</strong>
          </div>
          
          <div>
            ${selectedItemsArray.map(({ item, quantity }) => {
              const returnSubtotal = quantity * item.product.price * (1 - item.discount / 100);
              return `
                <div class="item-row">
                  <div class="item-details">
                    <div class="item-name">${item.product.name}</div>
                    <div>${quantity} × ${settings.currency}${item.product.price.toFixed(2)}</div>
                  </div>
                  <div class="item-amount">${settings.currency}${returnSubtotal.toFixed(2)}</div>
                </div>
              `;
            }).join('')}
          </div>
          
          <div class="divider"></div>
          
          <div>
            <div class="item-row" style="font-weight: bold; font-size: 14px;">
              <div>Total Refund:</div>
              <div>${settings.currency}${calculateTotalReturn().toFixed(2)}</div>
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

  const isItemSelected = (itemId: string, orderId: string) => {
    return !!selectedItems[`${orderId}-${itemId}`];
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

  // Format return records from backend data
  const formatReturnRecords = () => {
    // First, deduplicate the returns by ID
    const uniqueReturns = returns.filter((returnRecord, index, self) => 
      index === self.findIndex(r => r.id === returnRecord.id)
    );
    
    const formattedRecords: any[] = [];
    
    // Group return items by order ID to avoid duplication
    const returnsByOrder: Record<string, any[]> = {};
    
    uniqueReturns.forEach(returnRecord => {
      const orderId = returnRecord.order_id;
      if (!returnsByOrder[orderId]) {
        returnsByOrder[orderId] = [];
      }
      returnsByOrder[orderId].push(returnRecord);
    });
    
    // Process each order's returns
    Object.entries(returnsByOrder).forEach(([orderId, orderReturns]) => {
      // Use the most recent return record for this order
      const latestReturn = orderReturns.reduce((latest, current) => {
        return new Date(current.created_at) > new Date(latest.created_at) ? current : latest;
      });
      
      // Get the order for this return
      const order = orders.find(o => o.id === orderId);
      
      // Format date and time
      const createdAt = new Date(latestReturn.created_at);
      // Adjust for Dubai time (UTC+4)
      const dubaiTime = new Date(createdAt.getTime() + (4 * 60 * 60 * 1000));
      const dateStr = `${dubaiTime.getDate().toString().padStart(2, '0')}-${(dubaiTime.getMonth() + 1).toString().padStart(2, '0')}-${dubaiTime.getFullYear()}`;
      const timeStr = dubaiTime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true,
        timeZone: 'Asia/Dubai'
      });
      
      // Process return items and group them by order
      const items = latestReturn.return_items || [];
      
      // Calculate totals for the entire return
      let totalQuantity = 0;
      let totalRefund = 0;
      let itemDetails: string[] = [];
      
      items.forEach((item: any) => {
        const product = item.products || {};
        const quantity = item.quantity || 0;
        const refund = item.refund_amount || 0;
        
        totalQuantity += quantity;
        totalRefund += refund;
        itemDetails.push(`${product.name || 'Unknown Product'} (${quantity})`);
      });
      
      // Calculate average price
      const avgPrice = totalQuantity > 0 ? totalRefund / totalQuantity : 0;
      
      // Create a single record per order
      formattedRecords.push({
        id: latestReturn.id,
        date: dateStr,
        time: timeStr,
        orderId: orderId.slice(-6),
        productName: itemDetails.join(', '),
        quantity: totalQuantity,
        price: avgPrice,
        subtotal: totalRefund,
        status: 'completed',
        returnId: latestReturn.id,
        orderIdFull: orderId
      });
    });
    
    return formattedRecords;
  };

  const returnRecords = formatReturnRecords();

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

      {/* Return reason input */}
      {Object.keys(selectedItems).length > 0 && (
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
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Return by Items
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchReturns}
              className="ml-auto"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
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
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Item ID</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Product Code</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Return Qty</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Select</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length > 0 ? (
                  filteredItems.map(({ item, order }) => {
                    const { dateStr, timeStr } = formatDateTime(order.createdAt);
                    return (
                      <TableRow 
                        key={`${order.id}-${item.id}`} 
                        className={isItemSelected(item.id, order.id) ? "bg-muted" : ""}
                      >
                        <TableCell>{dateStr}</TableCell>
                        <TableCell>{timeStr}</TableCell>
                        <TableCell>{order.id}</TableCell>
                        <TableCell>{item.id}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.product.sku}</TableCell>
                        <TableCell>{item.product.name}</TableCell>
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
                        <TableCell>{settings?.currency} {item.product.price.toFixed(2)}</TableCell>
                        <TableCell>Return Request Initiated</TableCell>
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
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={preselectedOrder ? 11 : 11} className="text-center text-gray-500">
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
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Item ID</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Product Code</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Return Qty</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(selectedItems).map(([key, { item, orderId, quantity }]) => {
                      const order = orders.find(o => o.id === orderId);
                      const { dateStr, timeStr } = order ? formatDateTime(order.createdAt) : { dateStr: '', timeStr: '' };
                      const subtotal = quantity * item.product.price * (1 - item.discount / 100);
                      return (
                        <TableRow key={key}>
                          <TableCell>{dateStr}</TableCell>
                          <TableCell>{timeStr}</TableCell>
                          <TableCell>{orderId}</TableCell>
                          <TableCell>{item.id}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.product.sku}</TableCell>
                          <TableCell>{item.product.name}</TableCell>
                          <TableCell>{quantity}</TableCell>
                          <TableCell>{settings?.currency} {item.product.price.toFixed(2)}</TableCell>
                          <TableCell>Return Request Initiated</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                
                <div className="flex justify-between items-center border-t pt-4">
                  <div>
                    <p className="text-lg font-semibold">
                      Total Return: {settings?.currency} {calculateTotalReturn().toFixed(2)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={generateReturnReceipt}
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
          </div>
        </CardContent>
      </Card>

      {/* Return Records Section */}
      {returnRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Return Records
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchReturns}
                className="ml-auto"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Avg Price</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {returnRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{record.time}</TableCell>
                    <TableCell>{record.orderId}</TableCell>
                    <TableCell>{record.productName}</TableCell>
                    <TableCell>{record.quantity}</TableCell>
                    <TableCell>{settings?.currency} {record.price.toFixed(2)}</TableCell>
                    <TableCell>{settings?.currency} {record.subtotal.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        {record.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const order = orders.find(o => o.id === record.orderIdFull);
                            if (order && onPrintReceipt) {
                              onPrintReceipt(order);
                            }
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const order = orders.find(o => o.id === record.orderIdFull);
                            if (order && onViewReceipt) {
                              onViewReceipt(order);
                            }
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}