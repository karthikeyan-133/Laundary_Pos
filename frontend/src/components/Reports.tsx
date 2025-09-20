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
  RotateCcw,
  Eye
} from 'lucide-react';
import { Order, Product, POSSettings } from '@/types/pos';
import { BillingDetails } from './BillingDetails';
import jsPDF from 'jspdf';
// @ts-ignore
import autoTable from 'jspdf-autotable';

interface ReportsProps {
  orders: Order[];
  onReturnOrder?: (order: Order, type: 'complete' | 'partial' | null) => void;
  settings?: POSSettings; // Add settings prop for business info
}

export function Reports({ orders, onReturnOrder, settings }: ReportsProps) {
  const [activeReport, setActiveReport] = useState<
    'bill' | 'item' | 'daily' | 'delivery'
  >('bill');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null); // Add this state
  
  // Set today's date as default
  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
  const [showReturnOptions, setShowReturnOptions] = useState<boolean>(false);
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
    
    // For display purposes, we want to show the date in local time
    // But for filtering, we need to be consistent with how dates are stored
    
    return dateObj.toLocaleString('en-US', { 
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
    
    // Parse filter dates
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    
    // Set time boundaries
    if (from) {
      from.setHours(0, 0, 0, 0); // Start of from date
    }
    if (to) {
      to.setHours(23, 59, 59, 999); // End of to date
    }
    
    console.log('Parsed filter dates - From:', from, 'To:', to);
    
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
        
        // For comparison, we'll use the same date normalization
        const orderTime = orderDate.getTime();
        const fromTime = from ? from.getTime() : null;
        const toTime = to ? to.getTime() : null;
        
        // Check if order date is within the filter range
        const isAfterFrom = !fromTime || orderTime >= fromTime;
        const isBeforeTo = !toTime || orderTime <= toTime;
        
        console.log(`Order ${order.id} - OrderTime: ${orderTime}, FromTime: ${fromTime}, ToTime: ${toTime}, AfterFrom: ${isAfterFrom}, BeforeTo: ${isBeforeTo}`);
        
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
    console.log('=== ORDERS DEBUG INFO ===');
    console.log('Total orders:', orders.length);
    console.log('First order:', orders[0]);
    console.log('First order JSON:', JSON.stringify(orders[0], null, 2));
    
    // Look for the specific order mentioned in the issue
    const problematicOrder = orders.find(order => 
      order.items && 
      order.items.some(item => 
        item.product && 
        (!item.product.name || item.product.name === 'Unknown Product')
      )
    );
    
    if (problematicOrder) {
      console.log('Found order with Unknown Product:', problematicOrder);
      console.log('Problematic order JSON:', JSON.stringify(problematicOrder, null, 2));
    }
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

  // Process complete return directly
  const processCompleteReturn = async (order: Order) => {
    if (!order.items || !Array.isArray(order.items)) {
      alert('No items found in this order');
      return;
    }
    
    // Prepare items for complete return (all items with full quantity)
    const itemsToReturn = order.items.map(item => ({
      product: {
        ...item.product,
        id: item.product.id || `unknown-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: item.product.name || 'Unknown Product',
        ironRate: item.product.ironRate || 0,
        washAndIronRate: item.product.washAndIronRate || 0,
        dryCleanRate: item.product.dryCleanRate || 0,
        barcode: item.product.barcode || '',
        category: item.product.category || 'Unknown',
        description: item.product.description || ''
      },
      quantity: item.quantity,
      discount: item.discount,
      service: item.service || 'iron'
    }));
    
    // Since we don't have access to processReturn function directly in this component,
    // we'll pass the complete return data to the parent component
    if (onReturnOrder) {
      // We'll use a special return type to indicate complete return
      onReturnOrder(order, 'complete');
    }
  };

  // Handle return option selection
  const handleReturnOptionSelect = (type: 'complete' | 'partial') => {
    setReturnType(type);
    
    // If onReturnOrder is defined, call it with the order and return type
    if (onReturnOrder && selectedOrder) {
      console.log('Calling onReturnOrder with order:', selectedOrder, 'and type:', type);
      // For complete return, we process it directly
      // For partial return, we navigate to the return bills section
      if (type === 'complete') {
        // Process complete return directly
        processCompleteReturn(selectedOrder);
      } else {
        // Navigate to return bills section for partial return
        onReturnOrder(selectedOrder, type);
      }
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
            <div>Customer: ${order.customer?.name || 'Walk-in Customer'}</div>
            <div>Payment: ${order.paymentMethod}</div>
          </div>
          
          <div style="border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 5px;">
            <strong>Items:</strong>
          </div>
          
          <div>
            ${order.items.map(item => {
              // Debugging: Log item and product data in receipt generation
              console.log('Generating receipt for item:', item);
              console.log('Receipt item product:', item.product);
              console.log('Receipt item product name:', item.product?.name);
              console.log('Receipt item product type:', typeof item.product);
              console.log('Receipt item product keys:', item.product ? Object.keys(item.product) : 'No product');
              
              // Robust product name and price extraction with multiple fallbacks
              let productName = 'Unknown Product';
              let price = 0;
              
              try {
                // Check multiple possible product data structures
                if (item.product && typeof item.product === 'object') {
                  // Extract product name with validation
                  if (typeof item.product.name === 'string' && item.product.name.trim() !== '') {
                    productName = item.product.name;
                  } else if (item.product.name && typeof item.product.name === 'string') {
                    productName = item.product.name;
                  }
                  
                  // Remove any "(X items)" text that might be part of the product name
                  if (productName && typeof productName === 'string') {
                    productName = productName.replace(/\(\d+\s+items?\)/gi, '').trim();
                  }
                  
                  // Get the correct price based on service
                  if (item.service) {
                    switch (item.service) {
                      case 'iron':
                        price = typeof item.product.ironRate === 'number' ? item.product.ironRate : 0;
                        break;
                      case 'washAndIron':
                        price = typeof item.product.washAndIronRate === 'number' ? item.product.washAndIronRate : 0;
                        break;
                      case 'dryClean':
                        price = typeof item.product.dryCleanRate === 'number' ? item.product.dryCleanRate : 0;
                        break;
                      default:
                        price = typeof item.product.ironRate === 'number' ? item.product.ironRate : 0;
                    }
                  } else {
                    // Default to ironRate if no service specified
                    price = typeof item.product.ironRate === 'number' ? item.product.ironRate : 0;
                  }
                }
                
                // Alternative structure check
                if (productName === 'Unknown Product' && typeof item === 'object' && item !== null) {
                  if (typeof (item as any).name === 'string' && (item as any).name.trim() !== '') {
                    productName = (item as any).name;
                  } else if ((item as any).product_name && typeof (item as any).product_name === 'string') {
                    productName = (item as any).product_name;
                  }
                  
                  // Remove any "(X items)" text that might be part of the product name
                  if (productName && typeof productName === 'string') {
                    productName = productName.replace(/\(\d+\s+items?\)/gi, '').trim();
                  }
                }
                
                // Last resort: check for products property (plural) using type assertion
                if (productName === 'Unknown Product' && (item as any).products && typeof (item as any).products === 'object') {
                  if (typeof (item as any).products.name === 'string' && (item as any).products.name.trim() !== '') {
                    productName = (item as any).products.name;
                  }
                  
                  // Remove any "(X items)" text that might be part of the product name
                  if (productName && typeof productName === 'string') {
                    productName = productName.replace(/\(\d+\s+items?\)/gi, '').trim();
                  }
                }
              } catch (error) {
                console.error('Error extracting product data for receipt generation:', error);
              }
              
              console.log('Final receipt product name result:', productName);
              console.log('Final receipt price result:', price);
              
              return `
                <div class="item-row">
                  <div class="item-details">
                    <div class="item-name">${productName}</div>
                    <div>${item.quantity} × ${settings.currency}${price.toFixed(2)}</div>
                  </div>
                  <div class="item-amount">${settings.currency}${item.subtotal.toFixed(2)}</div>
                </div>
              `;
            }).join('')}
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

  // Add export to PDF function
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Set document title
    doc.setFontSize(18);
    doc.text('Daily Sales Report', 14, 20);
    
    // Add business information if available
    if (settings) {
      doc.setFontSize(12);
      doc.text(settings.businessName, 14, 30);
      doc.text(settings.businessAddress, 14, 37);
      doc.text(`Phone: ${settings.businessPhone}`, 14, 44);
    }
    
    // Add date range information
    doc.setFontSize(12);
    const dateInfo = `Date Range: ${fromDate || 'All'} to ${toDate || 'All'}`;
    doc.text(dateInfo, 14, 54);
    
    // Filter orders by date range for the report
    const filteredOrdersForExport = filterOrdersByDate(orders);
    
    // Generate report based on active report type
    if (activeReport === 'daily') {
      // Group filtered orders by date
      const dailySales: { [key: string]: { date: string, orders: number, revenue: number } } = {};
      
      filteredOrdersForExport.forEach(order => {
        // Convert order date to a normalized date string for grouping
        let orderDate: Date;
        if (order.createdAt instanceof Date) {
          orderDate = order.createdAt;
        } else if (typeof order.createdAt === 'string') {
          orderDate = new Date(order.createdAt);
        } else {
          return; // Skip invalid dates
        }
        
        // Check if orderDate is valid
        if (isNaN(orderDate.getTime())) {
          return; // Skip invalid dates
        }
        
        // Normalize to date only (without time) for grouping
        const dateKey = orderDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        const displayDate = orderDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
        
        if (dailySales[dateKey]) {
          dailySales[dateKey].orders += 1;
          dailySales[dateKey].revenue += order.total;
        } else {
          dailySales[dateKey] = {
            date: displayDate,
            orders: 1,
            revenue: order.total
          };
        }
      });

      const dailyData = Object.values(dailySales);
      
      // Add table to PDF
      autoTable(doc, {
        startY: 60,
        head: [['Date', 'Orders', 'Revenue (AED)', 'Avg. Order Value (AED)']],
        body: dailyData.map(day => [
          day.date,
          day.orders,
          day.revenue.toFixed(2),
          (day.revenue / day.orders).toFixed(2)
        ]),
        theme: 'grid',
        styles: {
          fontSize: 10
        },
        headStyles: {
          fillColor: [22, 160, 133]
        }
      });
      
      // Add summary
      const totalRevenue = dailyData.reduce((sum, day) => sum + day.revenue, 0);
      const totalOrders = dailyData.reduce((sum, day) => sum + day.orders, 0);
      
      doc.setFontSize(12);
      doc.text(`Total Revenue: AED ${totalRevenue.toFixed(2)}`, 14, (doc as any).lastAutoTable.finalY + 10);
      doc.text(`Total Orders: ${totalOrders}`, 14, (doc as any).lastAutoTable.finalY + 17);
      doc.text(`Average Order Value: AED ${(totalRevenue / totalOrders).toFixed(2)}`, 14, (doc as any).lastAutoTable.finalY + 24);
    } else if (activeReport === 'bill') {
      // Export Report by Bill
      // Create a list of items for each order for the PDF export
      const billDetails: { 
        transNo: string;
        transDate: string;
        customer: string;
        items: string;
        total: string;
        paymentMethod: string;
        cash: string;
        card: string;
        status: string;
      }[] = [];

      filteredOrdersForExport.forEach(order => {
        // Calculate total items in the order
        const totalItems = order.items ? order.items.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;
        
        // Get product items with service types
        const productItems = order.items ? order.items.map((item) => {
          // Enhanced product data extraction with multiple fallbacks
          let productName = 'Unknown Product';
          let serviceType = item.service || 'unknown';
          
          try {
            // Check multiple possible product data structures
            if (item.product && typeof item.product === 'object') {
              // Extract product name with validation
              if (typeof item.product.name === 'string' && item.product.name.trim() !== '') {
                productName = item.product.name;
              } else if (item.product.name && typeof item.product.name === 'string') {
                productName = item.product.name;
              }
              
              // Remove any "(X items)" text that might be part of the product name
              if (productName && typeof productName === 'string') {
                productName = productName.replace(/\(\d+\s+items?\)/gi, '').trim();
              }
            }
            
            // Alternative structure check
            if (productName === 'Unknown Product' && typeof item === 'object' && item !== null) {
              if (typeof (item as any).name === 'string' && (item as any).name.trim() !== '') {
                productName = (item as any).name;
              } else if ((item as any).product_name && typeof (item as any).product_name === 'string') {
                productName = (item as any).product_name;
              }
              
              // Remove any "(X items)" text that might be part of the product name
              if (productName && typeof productName === 'string') {
                productName = productName.replace(/\(\d+\s+items?\)/gi, '').trim();
              }
            }
            
            // Last resort: check for products property (plural) using type assertion
            if (productName === 'Unknown Product' && (item as any).products && typeof (item as any).products === 'object') {
              if (typeof (item as any).products.name === 'string' && (item as any).products.name.trim() !== '') {
                productName = (item as any).products.name;
              }
              
              // Remove any "(X items)" text that might be part of the product name
              if (productName && typeof productName === 'string') {
                productName = productName.replace(/\(\d+\s+items?\)/gi, '').trim();
              }
            }
          } catch (error) {
            console.error('Error extracting product data for PDF export:', error);
          }
          
          // Format service type for display
          let serviceDisplay = '';
          switch (serviceType) {
            case 'iron':
              serviceDisplay = '(iron)';
              break;
            case 'washAndIron':
              serviceDisplay = '(wash & iron)';
              break;
            case 'dryClean':
              serviceDisplay = '(dry clean)';
              break;
            default:
              serviceDisplay = `(service: ${serviceType})`;
          }
          
          // Return product name with service type
          if (productName && typeof productName === 'string' && productName.trim() !== '' && productName !== 'Unknown Product') {
            return `${productName} ${serviceDisplay}`;
          }
          
          // Fallback to Unknown Product with service type
          return `Unknown Product ${serviceDisplay}`;
        }) : [];

        // Get unique product items (name + service combinations)
        const uniqueProductItems = Array.from(new Set(productItems)).slice(0, 3); // Limit to first 3 for display

        const itemsDisplay = uniqueProductItems.join(', ') + (uniqueProductItems.length < (order.items?.length || 0) ? '...' : '');
        
        // Special handling for display - if all products are "Unknown Product", show a different message
        const displayText = uniqueProductItems.length > 0 && uniqueProductItems.every(item => item.startsWith('Unknown Product')) 
          ? `Unknown Product` 
          : `${itemsDisplay}`;
        
        billDetails.push({
          transNo: `#${order.id.slice(-6)}`,
          transDate: formatDate(order.createdAt),
          customer: order.customer?.name || 'Walk-in Customer',
          items: displayText,
          total: `${settings?.currency} ${order.total.toFixed(2)}`,
          paymentMethod: order.paymentMethod,
          cash: order.paymentMethod === 'both' && order.cashAmount ? `${settings?.currency} ${order.cashAmount.toFixed(2)}` : 
                order.paymentMethod === 'cash' ? `${settings?.currency} ${order.total.toFixed(2)}` : `${settings?.currency} 0.00`,
          card: order.paymentMethod === 'both' && order.cardAmount ? `${settings?.currency} ${order.cardAmount.toFixed(2)}` : 
                order.paymentMethod === 'card' ? `${settings?.currency} ${order.total.toFixed(2)}` : `${settings?.currency} 0.00`,
          status: order.status
        });
      });

      autoTable(doc, {
        startY: 60,
        head: [['Trans No', 'Trans Date', 'Customer', 'Items', 'Total', 'Payment Method', 'Cash', 'Card', 'Status']],
        body: billDetails.map(bill => [
          bill.transNo,
          bill.transDate,
          bill.customer,
          bill.items,
          bill.total,
          bill.paymentMethod,
          bill.cash,
          bill.card,
          bill.status
        ]),
        theme: 'grid',
        styles: {
          fontSize: 8
        },
        headStyles: {
          fillColor: [22, 160, 133]
        }
      });
    } else if (activeReport === 'item') {
      // Export Report by Item
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

      filteredOrdersForExport.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
            console.log('PDF export - Processing item:', item);
            console.log('PDF export - Item product:', item.product);
            console.log('PDF export - Item product name:', item.product?.name);
            console.log('PDF export - Item service:', item.service);
            
            // Robust product data extraction with multiple fallbacks
            let productName = 'Unknown Product';
            let productCategory = '';
            let price = 0;
            let serviceType = item.service || 'unknown';
            
            try {
              // Check multiple possible product data structures
              if (item.product && typeof item.product === 'object') {
                // Extract product name with validation
                if (typeof item.product.name === 'string' && item.product.name.trim() !== '') {
                  productName = item.product.name;
                } else if (item.product.name && typeof item.product.name === 'string') {
                  productName = item.product.name;
                }
                
                // Remove any "(X items)" text that might be part of the product name
                if (productName && typeof productName === 'string') {
                  productName = productName.replace(/\(\d+\s+items?\)/gi, '').trim();
                }
                
                // Extract category
                productCategory = typeof item.product.category === 'string' ? item.product.category : '';
                
                // Get the correct price based on service
                if (item.service) {
                  switch (item.service) {
                    case 'iron':
                      price = typeof item.product.ironRate === 'number' ? item.product.ironRate : 0;
                      break;
                    case 'washAndIron':
                      price = typeof item.product.washAndIronRate === 'number' ? item.product.washAndIronRate : 0;
                      break;
                    case 'dryClean':
                      price = typeof item.product.dryCleanRate === 'number' ? item.product.dryCleanRate : 0;
                      break;
                    default:
                      price = typeof item.product.ironRate === 'number' ? item.product.ironRate : 0;
                  }
                } else {
                  // Default to ironRate if no service specified
                  price = typeof item.product.ironRate === 'number' ? item.product.ironRate : 0;
                }
              }
              
              // Alternative structure check
              if (productName === 'Unknown Product' && typeof item === 'object' && item !== null) {
                if (typeof (item as any).name === 'string' && (item as any).name.trim() !== '') {
                  productName = (item as any).name;
                } else if ((item as any).product_name && typeof (item as any).product_name === 'string') {
                  productName = (item as any).product_name;
                }
                
                // Remove any "(X items)" text that might be part of the product name
                if (productName && typeof productName === 'string') {
                  productName = productName.replace(/\(\d+\s+items?\)/gi, '').trim();
                }
                
                // Extract category from alternative structure
                if (!(item as any).category && (item as any).product_category) {
                  productCategory = typeof (item as any).product_category === 'string' ? (item as any).product_category : '';
                }
              }
              
              // Last resort: check for products property (plural) using type assertion
              if (productName === 'Unknown Product' && (item as any).products && typeof (item as any).products === 'object') {
                if (typeof (item as any).products.name === 'string' && (item as any).products.name.trim() !== '') {
                  productName = (item as any).products.name;
                }
                
                // Remove any "(X items)" text that might be part of the product name
                if (productName && typeof productName === 'string') {
                  productName = productName.replace(/\(\d+\s+items?\)/gi, '').trim();
                }
                
                // Extract category from products property
                if (!(item as any).products.category && (item as any).products.product_category) {
                  productCategory = typeof (item as any).products.product_category === 'string' ? (item as any).products.product_category : '';
                }
              }
            } catch (error) {
              console.error('Error extracting product data for PDF export:', error);
            }
            
            console.log('Final PDF export product name result:', productName);
            console.log('Final PDF export price result:', price);
            console.log('Final PDF export service type:', serviceType);
            
            // Format service type for display
            let serviceDisplay = '';
            switch (serviceType) {
              case 'iron':
                serviceDisplay = '(iron)';
                break;
              case 'washAndIron':
                serviceDisplay = '(wash & iron)';
                break;
              case 'dryClean':
                serviceDisplay = '(dry clean)';
                break;
              default:
                serviceDisplay = `(service: ${serviceType})`;
            }
            
            // Create display name with service type
            const displayProductName = productName !== 'Unknown Product' 
              ? `${productName} ${serviceDisplay}` 
              : productName;
            
            const quantity = typeof item.quantity === 'string' ? parseFloat(item.quantity) : item.quantity;
            const subtotal = typeof item.subtotal === 'string' ? parseFloat(item.subtotal) : item.subtotal;
          
            // Format order date
            let orderDate = '';
            try {
              if (order.createdAt instanceof Date) {
                orderDate = order.createdAt.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                });
              } else if (typeof order.createdAt === 'string') {
                const dateObj = new Date(order.createdAt);
                if (!isNaN(dateObj.getTime())) {
                  orderDate = dateObj.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  });
                }
              }
            } catch (error) {
              console.error('Error formatting order date for PDF export:', error);
            }
            
            itemDetails.push({
              orderDate: orderDate,
              orderId: order.id,
              productName: displayProductName, // Use the display name with service type
              categoryName: productCategory,
              quantity: quantity,
              price: price,
              subtotal: subtotal,
              customerName: order.customer?.name || 'Walk-in Customer',
              paymentMethod: order.paymentMethod || '',
              status: order.status || ''
            });
          });
        }
      });
      
      autoTable(doc, {
        startY: 60,
        head: [['Order ID', 'Date', 'Item Name (Service)', 'Category', 'Quantity', 'Price (AED)', 'Subtotal (AED)']],
        body: itemDetails.map(item => [
          `#${item.orderId.slice(-6)}`,
          item.orderDate,
          item.productName,
          item.categoryName,
          item.quantity,
          item.price.toFixed(2),
          item.subtotal.toFixed(2)
        ]),
        theme: 'grid',
        styles: {
          fontSize: 8
        },
        headStyles: {
          fillColor: [22, 160, 133]
        }
      });
    } else if (activeReport === 'delivery') {
      // Export Report by Home Delivery
      const deliveryOrders = filteredOrdersForExport.filter(order => order.paymentMethod === 'cod');
      
      autoTable(doc, {
        startY: 60,
        head: [['Order No', 'Date', 'Customer', 'Address', 'Amount (AED)', 'Status']],
        body: deliveryOrders.map(order => [
          `#${order.id.slice(-6)}`,
          formatDate(order.createdAt),
          order.customer?.name || 'Walk-in Customer',
          [order.customer?.place, order.customer?.emirate].filter(Boolean).join(', ') || 'N/A',
          order.total.toFixed(2),
          order.status
        ]),
        theme: 'grid',
        styles: {
          fontSize: 10
        },
        headStyles: {
          fillColor: [22, 160, 133]
        }
      });
    }
    
    // Save the PDF
    doc.save(`report-${activeReport}-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // Add this function to handle order selection
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
  };

  // Add this function to close order details
  const handleCloseOrderDetails = () => {
    setSelectedOrder(null);
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
                    <th className="text-left py-2">Customer</th>
                    <th className="text-left py-2">Items</th>
                    <th className="text-left py-2">Total</th>
                    <th className="text-left py-2">Payment Method</th>
                    <th className="text-left py-2">Cash</th>
                    <th className="text-left py-2">Card</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    // Debugging: Log order data
                    console.log('=== PROCESSING ORDER ===');
                    console.log('Order ID:', order.id);
                    console.log('Order data:', JSON.stringify(order, null, 2));
                    console.log('Order items:', order.items);
                    console.log('Order items type:', typeof order.items);
                    console.log('Order items length:', order.items ? order.items.length : 'No items');
                    console.log('Order customer:', order.customer);
                    console.log('Order customer name:', order.customer?.name);
                    
                    // Calculate total items in the order
                    const totalItems = order.items ? order.items.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;
                    
                    // Get unique product names with service types
                    const productItems = order.items ? order.items.map((item, itemIndex) => {
                      console.log(`--- Processing item ${itemIndex} ---`);
                      console.log('Raw item data:', JSON.stringify(item, null, 2));
                      console.log('Item product:', item.product);
                      console.log('Item product type:', typeof item.product);
                      console.log('Item service:', item.service);
                      
                      // Enhanced product data extraction with multiple fallbacks
                      let productName = 'Unknown Product';
                      let serviceType = item.service || 'unknown';
                      
                      try {
                        // Check multiple possible product data structures
                        if (item.product && typeof item.product === 'object') {
                          // Extract product name with validation
                          if (typeof item.product.name === 'string' && item.product.name.trim() !== '') {
                            productName = item.product.name;
                          } else if (item.product.name && typeof item.product.name === 'string') {
                            productName = item.product.name;
                          }
                          
                          // Remove any "(X items)" text that might be part of the product name
                          if (productName && typeof productName === 'string') {
                            productName = productName.replace(/\(\d+\s+items?\)/gi, '').trim();
                          }
                        }
                        
                        // Alternative structure check
                        if (productName === 'Unknown Product' && typeof item === 'object' && item !== null) {
                          if (typeof (item as any).name === 'string' && (item as any).name.trim() !== '') {
                            productName = (item as any).name;
                          } else if ((item as any).product_name && typeof (item as any).product_name === 'string') {
                            productName = (item as any).product_name;
                          }
                          
                          // Remove any "(X items)" text that might be part of the product name
                          if (productName && typeof productName === 'string') {
                            productName = productName.replace(/\(\d+\s+items?\)/gi, '').trim();
                          }
                        }
                        
                        // Last resort: check for products property (plural) using type assertion
                        if (productName === 'Unknown Product' && (item as any).products && typeof (item as any).products === 'object') {
                          if (typeof (item as any).products.name === 'string' && (item as any).products.name.trim() !== '') {
                            productName = (item as any).products.name;
                          }
                          
                          // Remove any "(X items)" text that might be part of the product name
                          if (productName && typeof productName === 'string') {
                            productName = productName.replace(/\(\d+\s+items?\)/gi, '').trim();
                          }
                        }
                      } catch (error) {
                        console.error('Error extracting product data:', error);
                      }
                      
                      console.log('Extracted product name:', productName);
                      console.log('Item service type:', serviceType);
                      
                      // Format service type for display
                      let serviceDisplay = '';
                      switch (serviceType) {
                        case 'iron':
                          serviceDisplay = '(iron)';
                          break;
                        case 'washAndIron':
                          serviceDisplay = '(wash & iron)';
                          break;
                        case 'dryClean':
                          serviceDisplay = '(dry clean)';
                          break;
                        default:
                          serviceDisplay = `(service: ${serviceType})`;
                      }
                      
                      // If we found a valid product name, return it with service type
                      if (productName && typeof productName === 'string' && productName.trim() !== '' && productName !== 'Unknown Product') {
                        console.log('Using extracted product name with service:', `${productName} ${serviceDisplay}`);
                        return `${productName} ${serviceDisplay}`;
                      }
                      
                      // Fallback to Unknown Product with service type
                      console.log('Using fallback product name with service:', `Unknown Product ${serviceDisplay}`);
                      return `Unknown Product ${serviceDisplay}`;
                    }) : [];

                    // Get unique product items (name + service combinations)
                    const uniqueProductItems = Array.from(new Set(productItems)).slice(0, 3); // Limit to first 3 for display

                    console.log('Product items array:', productItems);
                    console.log('Unique product items array:', uniqueProductItems);
                    const itemsDisplay = uniqueProductItems.join(', ') + (uniqueProductItems.length < (order.items?.length || 0) ? '...' : '');
                    console.log('Items display string:', itemsDisplay);

                    // Special handling for display - if all products are "Unknown Product", show a different message
                    const displayText = uniqueProductItems.length > 0 && uniqueProductItems.every(item => item.startsWith('Unknown Product')) 
                      ? `Unknown Product` 
                      : `${itemsDisplay}`;
                    
                    return (
                      <tr key={order.id} className="border-b hover:bg-muted/50">
                        <td className="py-2">#{order.id.slice(-6)}</td>
                        <td className="py-2">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="py-2">
                          {order.customer?.name || 'Walk-in Customer'}
                        </td>
                        <td className="py-2 min-w-[200px]">
                          {displayText}
                        </td>
                        <td className="py-2 font-medium">{settings?.currency} {order.total.toFixed(2)}</td>
                        <td className="py-2">
                          <Badge variant="secondary">
                            {order.paymentMethod}
                          </Badge>
                        </td>
                        <td className="py-2">
                          {order.paymentMethod === 'both' && order.cashAmount ? `${settings?.currency} ${order.cashAmount.toFixed(2)}` : 
                           order.paymentMethod === 'cash' ? `${settings?.currency} ${order.total.toFixed(2)}` : `${settings?.currency} 0.00`}
                        </td>
                        <td className="py-2">
                          {order.paymentMethod === 'both' && order.cardAmount ? `${settings?.currency} ${order.cardAmount.toFixed(2)}` : 
                           order.paymentMethod === 'card' ? `${settings?.currency} ${order.total.toFixed(2)}` : `${settings?.currency} 0.00`}
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
                              onClick={() => handleViewOrder(order)} // Change this to view order details
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
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
                    );
                  })}
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
        console.log('Report by Item - Item product:', item.product);
        console.log('Report by Item - Item product name:', item.product?.name);
        console.log('Report by Item - Item product type:', typeof item.product);
        console.log('Report by Item - Item product keys:', item.product ? Object.keys(item.product) : 'No product');
        console.log('Report by Item - Item service:', item.service);
        
        // Enhanced product data extraction with multiple fallbacks
        let productName = 'Unknown Product';
        let productCategory = '';
        let price = 0;
        let serviceType = item.service || 'unknown';
        
        try {
          // Check multiple possible product data structures
          if (item.product && typeof item.product === 'object') {
            // Extract product name with validation
            if (typeof item.product.name === 'string' && item.product.name.trim() !== '') {
              productName = item.product.name;
            } else if (item.product.name && typeof item.product.name === 'string') {
              productName = item.product.name;
            }
            
            // Extract category
            productCategory = typeof item.product.category === 'string' ? item.product.category : '';
            
            // Get the correct price based on service
            if (item.service) {
              switch (item.service) {
                case 'iron':
                  price = typeof item.product.ironRate === 'number' ? item.product.ironRate : 0;
                  break;
                case 'washAndIron':
                  price = typeof item.product.washAndIronRate === 'number' ? item.product.washAndIronRate : 0;
                  break;
                case 'dryClean':
                  price = typeof item.product.dryCleanRate === 'number' ? item.product.dryCleanRate : 0;
                  break;
                default:
                  price = typeof item.product.ironRate === 'number' ? item.product.ironRate : 0;
              }
            } else {
              // Default to ironRate if no service specified
              price = typeof item.product.ironRate === 'number' ? item.product.ironRate : 0;
            }
          }
          
          // Alternative structure check
          if (productName === 'Unknown Product' && typeof item === 'object' && item !== null) {
            if (typeof (item as any).name === 'string' && (item as any).name.trim() !== '') {
              productName = (item as any).name;
            } else if ((item as any).product_name && typeof (item as any).product_name === 'string') {
              productName = (item as any).product_name;
            }
            
            // Extract category from alternative structure
            if (!(item as any).category && (item as any).product_category) {
              productCategory = typeof (item as any).product_category === 'string' ? (item as any).product_category : '';
            }
          }
          
          // Last resort: check for products property (plural) using type assertion
          if (productName === 'Unknown Product' && (item as any).products && typeof (item as any).products === 'object') {
            if (typeof (item as any).products.name === 'string' && (item as any).products.name.trim() !== '') {
              productName = (item as any).products.name;
            }
            
            // Extract category from products property
            if (!(item as any).products.category && (item as any).products.product_category) {
              productCategory = typeof (item as any).products.product_category === 'string' ? (item as any).products.product_category : '';
            }
          }
        } catch (error) {
          console.error('Error extracting product data:', error);
        }
        
        console.log('Final Report by Item product name result:', productName);
        console.log('Final Report by Item price result:', price);
        console.log('Final Report by Item service type:', serviceType);
        
        // Format service type for display
        let serviceDisplay = '';
        switch (serviceType) {
          case 'iron':
            serviceDisplay = '(iron)';
            break;
          case 'washAndIron':
            serviceDisplay = '(wash & iron)';
            break;
          case 'dryClean':
            serviceDisplay = '(dry clean)';
            break;
          default:
            serviceDisplay = `(service: ${serviceType})`;
        }
        
        // Create display name with service type
        const displayProductName = productName !== 'Unknown Product' 
          ? `${productName} ${serviceDisplay}` 
          : productName;
        
        // Convert string values to numbers if needed
        const quantity = typeof item.quantity === 'string' ? parseFloat(item.quantity) : item.quantity;
        const subtotal = typeof item.subtotal === 'string' ? parseFloat(item.subtotal) : item.subtotal;

        // Format order date
        let orderDate = '';
        try {
          if (order.createdAt instanceof Date) {
            orderDate = order.createdAt.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
          } else if (typeof order.createdAt === 'string') {
            const dateObj = new Date(order.createdAt);
            if (!isNaN(dateObj.getTime())) {
              orderDate = dateObj.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });
            }
          }
        } catch (error) {
          console.error('Error formatting order date:', error);
        }
        
        itemDetails.push({
          orderDate: orderDate,
          orderId: order.id,
          productName: displayProductName, // Use the display name with service type
          categoryName: productCategory,
          quantity: quantity,
          price: price,
          subtotal: subtotal,
          customerName: order.customer?.name || 'Walk-in Customer',
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
                      <th className="text-left py-2">Item Name (Service)</th>
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
      // Convert order date to a normalized date string for grouping
      let orderDate: Date;
      if (order.createdAt instanceof Date) {
        orderDate = order.createdAt;
      } else if (typeof order.createdAt === 'string') {
        orderDate = new Date(order.createdAt);
      } else {
        return; // Skip invalid dates
      }
      
      // Check if orderDate is valid
      if (isNaN(orderDate.getTime())) {
        return; // Skip invalid dates
      }
      
      // Normalize to date only (without time) for grouping
      const dateKey = orderDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      const displayDate = orderDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      if (dailySales[dateKey]) {
        dailySales[dateKey].orders += 1;
        dailySales[dateKey].revenue += order.total;
      } else {
        dailySales[dateKey] = {
          date: displayDate,
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
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="py-2">{order.customer?.name || 'Walk-in Customer'}</td>
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
      {/* Add this to show order details when selected */}
      {selectedOrder && settings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <BillingDetails 
              order={selectedOrder} 
              onPrint={generateReceipt} 
              settings={{
                currency: settings.currency,
                businessName: settings.businessName,
                businessAddress: settings.businessAddress,
                businessPhone: settings.businessPhone,
                taxRate: settings.taxRate
              }} 
            />
            <div className="p-4 border-t flex justify-end">
              <Button onClick={handleCloseOrderDetails}>Close</Button>
            </div>
          </div>
        </div>
      )}

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
            <div className="flex items-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setFromDate(today);
                  setToDate(today);
                }}
              >
                Reset to Today
              </Button>
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
        <Button 
          variant="outline" 
          className="flex items-center gap-2 ml-auto"
          onClick={exportToPDF}
        >
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