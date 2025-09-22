import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductList } from '@/components/ProductList';
import { Receipt } from '@/components/Receipt';
import { ReturnReceipt } from '@/components/ReturnReceipt'; // Import ReturnReceipt
import { ReturnRecords } from '@/components/ReturnRecords'; // Import ReturnRecords
import { Dashboard } from '@/components/Dashboard';
import { Reports } from '@/components/Reports';
import { POSInvoice } from '@/components/POSInvoice';
import { ReturnByBills } from '@/components/ReturnByBills';
import { OpeningCashPopup } from '@/components/OpeningCashPopup';
import { HomeDelivery } from '@/components/HomeDelivery'; // Add HomeDelivery component
import { usePOSStore } from '@/hooks/usePOSStore';
import { 
  ShoppingCart, 
  Package, 
  Receipt as ReceiptIcon, 
  BarChart3, 
  FileText, 
  User, 
  LogOut,
  TrendingUp,
  RotateCcw,
  PlusSquare,
  Truck,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Order, CartItem, Product } from '@/types/pos';
import { ProductManagement } from '@/components/ProductManagement';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const [activeView, setActiveView] = useState<'pos' | 'receipt' | 'dashboard' | 'reports' | 'products' | 'return-bills' | 'product-management' | 'home-delivery' | 'return-records'>('pos');
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState<Order | null>(null);
  const [returnType, setReturnType] = useState<'complete' | 'partial' | null>(null);
  const [processedOrderId, setProcessedOrderId] = useState<string | null>(null); // Track processed order ID
  const [returnItems, setReturnItems] = useState<Record<string, number>>({}); // Track return items
  const [returnReason, setReturnReason] = useState<string>(''); // Track return reason
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const {
    products,
    customers,
    cart,
    customer,
    orders,
    settings,
    showOpeningCashPopup,
    setOpeningCashAmount,
    setShowOpeningCashPopup,
    cartDiscount,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    updateCartItemDiscount,
    clearCart,
    setCustomer,
    addCustomer,
    createOrder,
    searchProducts,
    calculateTotals,
    setCartDiscount,
    addProduct,
    editProduct,
    removeProduct,
    holdCart,
    unholdCart,
    isCartHeld,
    currentHoldId,
    updateOrderPaymentStatus,
    updateOrderDeliveryStatus,
    getCODOrders,
    loading,
    error,
    reloadOrders, // Add reloadOrders function
    returns, // Add returns data
    clearReturns, // Add clearReturns function
    processReturn // Add processReturn function
  } = usePOSStore();

  const totals = calculateTotals();
  const lastOrder = orders[0] || null;
  console.log('Index.tsx - orders data:', orders);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error Loading Data</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p className="text-sm text-muted-foreground mb-6">
            Please make sure the backend server is running and database is configured correctly.
          </p>
          {error && (error.includes('schema mismatch') || error.includes('sku')) ? (
            <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
              <p className="font-bold">Database Schema Issue Detected</p>
              <p className="text-sm">Please restart your Supabase project or wait for the schema cache to refresh automatically.</p>
            </div>
          ) : null}
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    console.log('User logged out');
    navigate('/login');
  };

  const handleReturnOrder = (order: Order, type: 'complete' | 'partial' | null = null) => {
    console.log('handleReturnOrder called with order:', order, 'and type:', type);
    
    // For complete return, process it directly
    if (type === 'complete') {
      processCompleteReturn(order);
      return;
    }
    
    // For partial return or null, navigate to return bills section
    setSelectedOrderForReturn(order);
    setReturnType(type);
    setActiveView('return-bills');
    console.log('State updated: selectedOrderForReturn set and activeView set to return-bills');
  };

  // Process complete return directly
  const processCompleteReturn = async (order: Order) => {
    if (!order.items || !Array.isArray(order.items)) {
      alert('No items found in this order');
      return;
    }
    
    // Prepare items for complete return (all items with full quantity)
    const itemsToReturn = order.items.map(item => ({
      product: item.product, // Use the actual product from the order item
      quantity: item.quantity,
      discount: item.discount,
      service: item.service || 'iron'
    }));
    
    // Process the return using the store function
    const result = await processReturn(order.id, itemsToReturn, 'Complete Return');
    
    if (result) {
      // Show success message
      alert('Complete return processed successfully!');
      
      // Refresh data
      await reloadOrders();
    } else {
      // Error handling is done in processReturn function
      console.log('Failed to process complete return');
    }
  };

  // Callback function for when a return is processed successfully
  const handleReturnProcessed = (orderId: string, items: Record<string, number>, reason: string) => {
    console.log('Return processed for order:', orderId, 'Items:', items, 'Reason:', reason);
    
    // If orderId is empty string, it means we don't want to show the receipt view
    if (orderId === '' || !orderId) {
      // Just stay on the current view and refresh the data
      // The components will automatically refresh their data
      return;
    }
    
    setProcessedOrderId(orderId);
    setReturnItems(items);
    setReturnReason(reason);
    
    // Navigate to the receipt view to show the processed return
    setActiveView('receipt');
  };

  // Function to handle viewing a receipt
  const handleViewReceipt = (order: Order) => {
    setProcessedOrderId(order.id);
    // For now, we'll just show the regular receipt
    setActiveView('receipt');
  };

  // Function to handle printing a receipt
  const handlePrintReceipt = (order: Order) => {
    // Find the return record for this order
    const returnRecord = returns.find(r => r.order_id === order.id);
    
    if (!returnRecord) {
      alert(`No return record found for order ${order.id}`);
      return;
    }
    
    if (!settings) {
      alert('Settings not available for receipt generation');
      return;
    }
    
    // Format date and time
    const formatDate = (dateString: string) => {
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
    
    const { dateStr, timeStr } = formatDate(returnRecord.created_at);
    
    // Get customer name if available
    const customerName = returnRecord.orders?.customer_name || 'Walk-in Customer';
    
    // Format items for receipt
    const returnItems = returnRecord.return_items || [];
    
    const receiptContent = `
      <html>
        <head>
          <title>Return Receipt - ${returnRecord.order_id}</title>
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
            <div>Order ID: ${returnRecord.order_id}</div>
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
              
              // Calculate price per item
              const pricePerItem = quantity > 0 ? refundAmount / quantity : 0;
              
              return `
                <div class="item-row">
                  <div class="item-details">
                    <div class="item-name">${productName}</div>
                    <div>${quantity} × ${settings.currency}${Number(pricePerItem).toFixed(2)}</div>
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
              <div>${settings.currency}${Number(returnRecord.refund_amount).toFixed(2)}</div>
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

  // Wrapper functions to handle async operations
  const handleAddCustomer = async (customer: any) => {
    return await addCustomer(customer);
  };

  const handleCheckout = async (paymentMethod: any, cashAmount?: number, cardAmount?: number) => {
    return await createOrder(paymentMethod, cashAmount, cardAmount);
  };

  const handleAddProduct = async (product: Omit<Product, 'id'>) => {
    try {
      await addProduct(product);
    } catch (error: any) {
      console.error('Error adding product:', error);
      // Provide more detailed error information
      const errorMessage = error.message || "Failed to add product. Please try again.";
      const errorDetails = error.details ? `Details: ${error.details}` : '';
      const errorHint = error.hint ? `Hint: ${error.hint}` : '';
      
      alert(`${errorMessage} ${errorDetails} ${errorHint}`);
    }
  };

  const handleEditProduct = async (product: Product) => {
    try {
      await editProduct(product);
    } catch (error: any) {
      console.error('Error editing product:', error);
      alert(error.message || "Failed to edit product. Please try again.");
    }
  };

  const handleRemoveProduct = async (productId: string) => {
    try {
      await removeProduct(productId);
    } catch (error: any) {
      console.error('Error removing product:', error);
      // Provide more specific error handling for deletion issues
      if (error.message && error.message.includes('referenced in existing')) {
        alert('Cannot delete this product because it is referenced in existing orders or returns. To remove this product, you would need to first delete all related orders and returns.');
      } else {
        alert(error.message || "Failed to remove product. Please try again.");
      }
    }
  };

  // Filter out returned orders for display in reports and other components
  const nonReturnedOrders = orders.filter(order => order.status !== 'returned');
  console.log('Index.tsx - Non-returned orders count:', nonReturnedOrders.length, 'Total orders:', orders.length);

  return (
    <div className="min-h-screen bg-background">
      <OpeningCashPopup 
        isOpen={showOpeningCashPopup} 
        onSubmit={setOpeningCashAmount} 
      />

      <div className="border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-6">
              <h2 className="text-xl font-bold text-foreground">TallyPrime POS</h2>
              <nav className="flex space-x-4">
                <Button 
                  variant={activeView === 'dashboard' ? "default" : "ghost"} 
                  className="flex items-center gap-2"
                  onClick={() => setActiveView('dashboard')}
                >
                  <BarChart3 className="h-4 w-4" />
                  Dashboard
                </Button>
                <Button 
                  variant={activeView === 'pos' ? "default" : "ghost"} 
                  className="flex items-center gap-2"
                  onClick={() => setActiveView('pos')}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Sales
                </Button>
                <Button 
                  variant={activeView === 'reports' ? "default" : "ghost"} 
                  className="flex items-center gap-2"
                  onClick={() => setActiveView('reports')}
                >
                  <TrendingUp className="h-4 w-4" />
                  Report
                </Button>
                <Button 
                  variant={activeView === 'home-delivery' ? "default" : "ghost"} 
                  className="flex items-center gap-2"
                  onClick={() => setActiveView('home-delivery')}
                >
                  <Truck className="h-4 w-4" />
                  Home Delivery
                </Button>
                <Button 
                  variant={activeView === 'return-bills' ? "default" : "ghost"} // Simplified condition
                  className="flex items-center gap-2"
                  onClick={() => {
                    // Only allow access to return-bills view through Reports section
                    // This button should not directly navigate to return-bills
                    console.log('Return button clicked - should only navigate through Reports section');
                  }}
                  disabled={true} // Disable direct access to return-bills view
                >
                  <RotateCcw className="h-4 w-4" />
                  Return
                </Button>
                <Button 
                  variant={activeView === 'return-records' ? "default" : "ghost"} 
                  className="flex items-center gap-2"
                  onClick={() => setActiveView('return-records')}
                >
                  <RotateCcw className="h-4 w-4" />
                  Return Records
                </Button>
              </nav>
            </div>
            <Button 
              variant="ghost" 
              className="flex items-center gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4">
        {activeView === 'pos' && (
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
            <div className="lg:col-span-7">
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Product Selection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ProductList
                    products={products}
                    onAddToCart={(product, service, quantity) => addToCart(product, service, quantity)}
                    onSearch={searchProducts}
                    onAddProduct={() => setActiveView('product-management')}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3">
              <POSInvoice
                cart={cart}
                customer={customer}
                customers={customers}
                totals={totals}
                settings={settings}
                cartDiscount={cartDiscount}
                onUpdateQuantity={updateCartItemQuantity}
                onUpdateDiscount={updateCartItemDiscount}
                onRemoveItem={removeFromCart}
                onCustomerChange={setCustomer}
                onAddCustomer={addCustomer}
                onCheckout={createOrder}
                onClearCart={clearCart}
                onSetCartDiscount={setCartDiscount}
                onHoldCart={holdCart}
                onUnholdCart={unholdCart}
                isCartHeld={isCartHeld}
                currentHoldId={currentHoldId}
                onAddToCart={(product, quantity = 1) => {
                  // For backward compatibility, we'll add with default service (iron)
                  // In a real app, you might want to show a service selection popup here too
                  addToCart(product, 'iron', quantity);
                }}
                products={products}
              />
            </div>
          </div>
        )}

        {activeView === 'dashboard' && (
          <div className="mt-6">
            <Dashboard orders={orders} />
          </div>
        )}

        {activeView === 'reports' && (
          <div className="mt-6">
            <Reports orders={nonReturnedOrders} settings={settings} onReturnOrder={(order, type) => handleReturnOrder(order, type)} />
          </div>
        )}

        {activeView === 'home-delivery' && (
          <div className="mt-6">
            <HomeDelivery 
              orders={nonReturnedOrders}
              onUpdateOrderPaymentStatus={updateOrderPaymentStatus}
              onUpdateOrderDeliveryStatus={updateOrderDeliveryStatus}
              currency={settings.currency}
              onReturnOrder={(order, type) => handleReturnOrder(order, type)} // Pass the type parameter
              onReloadOrders={reloadOrders}
            />
          </div>
        )}

        {activeView === 'return-bills' && (
          <div className="mt-6">
            <ReturnByBills onReturnProcessed={handleReturnProcessed} onViewReceipt={handleViewReceipt} onPrintReceipt={handlePrintReceipt} />
          </div>
        )}

        {activeView === 'receipt' && (
          <div className="mt-6">
            {processedOrderId ? (
              // Show the return receipt for the processed return
              <ReturnReceipt 
                order={orders.find(o => o.id === processedOrderId) || null} 
                settings={settings} 
                returnItems={returnItems}
                returnReason={returnReason}
              />
            ) : lastOrder ? (
              // Show the last order receipt
              <Receipt order={lastOrder} settings={settings} />
            ) : (
              // Fallback message if no order is available
              <Card>
                <CardContent className="p-6 text-center">
                  <p>No receipt available</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeView === 'return-records' && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Return Records</h2>
              <Button 
                variant="destructive" 
                onClick={async () => {
                  if (window.confirm('Are you sure you want to clear all return records? This action cannot be undone.')) {
                    try {
                      await clearReturns();
                      alert('All return records have been cleared successfully.');
                    } catch (error) {
                      alert('Failed to clear return records: ' + (error as Error).message);
                    }
                  }
                }}
              >
                Clear All Returns
              </Button>
            </div>
            <ReturnRecords 
              returns={returns} 
              onViewReceipt={handleViewReceipt}
              onPrintReceipt={handlePrintReceipt}
            />
          </div>
        )}

        {activeView === 'products' && (
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Management</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductList
                  products={products}
                  onAddToCart={(product, service, quantity) => addToCart(product, service, quantity)}
                  onSearch={searchProducts}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {activeView === 'product-management' && (
          <div className="mt-6">
            <ProductManagement 
              products={products}
              onAddProduct={addProduct}
              onEditProduct={editProduct}
              onRemoveProduct={removeProduct}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;