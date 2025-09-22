import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Printer, Eye, Filter } from 'lucide-react';
import { Order } from '@/types/pos';
import { usePOSStore } from '@/hooks/usePOSStore';

interface ReturnRecord {
  id: string;
  order_id: string;
  reason?: string;
  refund_amount: number;
  created_at: string;
  return_items: Array<{
    id: string;
    return_id: string;
    product_id: string;
    quantity: number;
    refund_amount: number;
    product_name?: string;
    barcode?: string;
    ironRate?: number;
    washAndIronRate?: number;
    dryCleanRate?: number;
  }>;
  orders?: {
    id: string;
    customer_name?: string;
  };
}

interface ReturnRecordsProps {
  returns: ReturnRecord[];
  onViewReceipt: (order: Order) => void;
  onPrintReceipt: (order: Order) => void;
}

export function ReturnRecords({ returns, onViewReceipt, onPrintReceipt }: ReturnRecordsProps) {
  const { settings } = usePOSStore();
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  // Set today's date as default
  React.useEffect(() => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    setFromDate(todayString);
    setToDate(todayString);
  }, []);

  // Format date and time
  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return { dateStr: 'Invalid Date', timeStr: 'Invalid Time' };
      }
      // Adjust for Dubai time (UTC+4)
      const dubaiTime = new Date(date.getTime() + (4 * 60 * 60 * 1000));
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
      console.error('Error formatting date:', dateString, err);
      return { dateStr: 'Invalid Date', timeStr: 'Invalid Time' };
    }
  };

  // First, deduplicate the returns by order ID to avoid showing multiple records for the same order
  const uniqueReturns = returns.filter((returnRecord, index, self) => 
    index === self.findIndex(r => r.order_id === returnRecord.order_id)
  );

  // Format return records for display
  const formattedReturns = uniqueReturns.map(returnRecord => {
    const { dateStr, timeStr } = formatDateTime(returnRecord.created_at);
    
    // Process return items
    const items = returnRecord.return_items || [];
    
    // Calculate totals
    let totalQuantity = 0;
    let totalRefund = 0;
    let itemDetails: string[] = [];
    
    items.forEach((item: any) => {
      const quantity = item.quantity || 0;
      // Use refund_amount directly from the item, with proper fallback
      const refund = item.refund_amount !== undefined && item.refund_amount !== null ? 
        (typeof item.refund_amount === 'string' ? parseFloat(item.refund_amount) : item.refund_amount) : 0;
      
      totalQuantity += quantity;
      totalRefund += refund;
      
      // Get product name with fallbacks
      const productName = item.product_name || item.barcode || 'Unknown Product';
      itemDetails.push(`${productName} (${quantity})`);
    });
    
    // Calculate average price
    const avgPrice = totalQuantity > 0 ? totalRefund / totalQuantity : 0;
    
    return {
      id: returnRecord.id,
      date: dateStr,
      time: timeStr,
      orderId: returnRecord.order_id.slice(-6),
      productName: itemDetails.join(', '),
      quantity: totalQuantity,
      price: avgPrice,
      subtotal: totalRefund,
      status: 'completed',
      orderIdFull: returnRecord.order_id,
      returnRecord: returnRecord // Keep reference to original return record for printing
    };
  });

  // Apply date filtering to return records
  const filteredReturns = (() => {
    if (fromDate || toDate) {
      return formattedReturns.filter(record => {
        try {
          const recordDate = new Date(`${record.date.split('-')[2]}-${record.date.split('-')[1]}-${record.date.split('-')[0]}`);
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
            (!from || recordDate >= from) &&
            (!to || recordDate <= to)
          );
          
          return result;
        } catch (err) {
          console.error('Error filtering return record by date:', record, err);
          return false;
        }
      });
    }
    
    return formattedReturns;
  })();

  // Generate and print return receipt
  const handlePrintReceipt = (returnRecord: any) => {
    if (!settings) {
      console.error('Settings not available for receipt generation');
      return;
    }

    const { dateStr, timeStr } = formatDateTime(returnRecord.returnRecord.created_at);
    
    // Get customer name if available
    const customerName = returnRecord.returnRecord.orders?.customer_name || 'Walk-in Customer';
    
    // Format items for receipt
    const returnItems = returnRecord.returnRecord.return_items || [];
    
    const receiptContent = `
      <html>
        <head>
          <title>Return Receipt - ${returnRecord.orderIdFull}</title>
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
            <div>Return ID: ${returnRecord.id}</div>
            <div>Order ID: ${returnRecord.orderIdFull}</div>
            <div>Date: ${dateStr} ${timeStr}</div>
            <div>Customer: ${customerName}</div>
          </div>
          
          <div style="border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 5px;">
            <strong>Returned Items:</strong>
          </div>
          
          <div>
            ${returnItems.map((item: any) => {
              const productName = item.product_name || item.barcode || 'Unknown Product';
              const quantity = item.quantity || 0;
              const refundAmount = item.refund_amount !== undefined && item.refund_amount !== null ? 
                (typeof item.refund_amount === 'string' ? parseFloat(item.refund_amount) : item.refund_amount) : 0;
              
              return `
                <div class="item-row">
                  <div class="item-details">
                    <div class="item-name">${productName}</div>
                    <div>${quantity} × ${settings.currency}${Number(quantity > 0 ? refundAmount / quantity : 0).toFixed(2)}</div>
                  </div>
                  <div class="item-amount">${settings.currency}${Number(refundAmount).toFixed(2)}</div>
                </div>
              `;
            }).join('')}
          </div>
          
          <div class="divider"></div>
          
          <div>
            <div class="item-row" style="font-weight: bold; font-size: 14px;">
              <div>Total Refund:</div>
              <div>${settings.currency}${Number(returnRecord.subtotal).toFixed(2)}</div>
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
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground flex items-center justify-between">
          <span>Return Records</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="from-date-filter" className="text-sm">From:</Label>
              <Input
                id="from-date-filter"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-32"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="to-date-filter" className="text-sm">To:</Label>
              <Input
                id="to-date-filter"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-32"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const today = new Date();
                const todayString = today.toISOString().split('T')[0];
                setFromDate(todayString);
                setToDate(todayString);
              }}
            >
              Today
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setFromDate('');
                setToDate('');
              }}
            >
              Clear
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filteredReturns.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No return records found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Date</th>
                  <th className="text-left py-2 px-2">Time</th>
                  <th className="text-left py-2 px-2">Order ID</th>
                  <th className="text-left py-2 px-2">Items</th>
                  <th className="text-left py-2 px-2">Quantity</th>
                  <th className="text-left py-2 px-2">Avg Price</th>
                  <th className="text-left py-2 px-2">Total</th>
                  <th className="text-left py-2 px-2">Status</th>
                  <th className="text-left py-2 px-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredReturns.map((record, index) => (
                  <tr key={record.id} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2">{record.date}</td>
                    <td className="py-2 px-2">{record.time}</td>
                    <td className="py-2 px-2">{record.orderId}</td>
                    <td className="py-2 px-2">{record.productName}</td>
                    <td className="py-2 px-2">{record.quantity}</td>
                    <td className="py-2 px-2">AED {Number(record.price).toFixed(2)}</td>
                    <td className="py-2 px-2">AED {Number(record.subtotal).toFixed(2)}</td>
                    <td className="py-2 px-2">
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        {record.status}
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex gap-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handlePrintReceipt(record)}
                          className="h-8 w-8 p-0"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            // Find the order in the returns data
                            const order = returns.find(r => r.order_id === record.orderIdFull)?.orders;
                            if (order) {
                              onViewReceipt(order as any);
                            }
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}