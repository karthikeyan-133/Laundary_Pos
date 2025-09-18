import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Printer, Eye, Filter } from 'lucide-react';
import { Order } from '@/types/pos';

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
    products?: {
      name: string;
      sku: string;
    };
  }>;
  orders?: {
    id: string;
    customers?: {
      name: string;
    };
  };
}

interface ReturnRecordsProps {
  returns: ReturnRecord[];
  onViewReceipt: (order: Order) => void;
  onPrintReceipt: (order: Order) => void;
}

export function ReturnRecords({ returns, onViewReceipt, onPrintReceipt }: ReturnRecordsProps) {
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
      const product = item.products || {};
      const quantity = item.quantity || 0;
      const refund = item.refund_amount || 0;
      
      totalQuantity += quantity;
      totalRefund += refund;
      itemDetails.push(`${product.name || product.sku || 'Unknown Product'} (${quantity})`);
    });
    
    return {
      id: returnRecord.id,
      date: dateStr,
      time: timeStr,
      orderId: returnRecord.order_id.slice(-6),
      productName: itemDetails.join(', '),
      quantity: totalQuantity,
      price: totalQuantity > 0 ? totalRefund / totalQuantity : 0,
      subtotal: totalRefund,
      status: 'completed',
      orderIdFull: returnRecord.order_id
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
                    <td className="py-2 px-2">AED {record.price.toFixed(2)}</td>
                    <td className="py-2 px-2">AED {record.subtotal.toFixed(2)}</td>
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