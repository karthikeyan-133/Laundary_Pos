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
import { ReturnByItems } from '@/components/ReturnByItems';
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
import { Order, CartItem } from '@/types/pos';
import { ProductManagement } from '@/components/ProductManagement';

const Index = () => {
  const [activeView, setActiveView] = useState<'pos' | 'receipt' | 'dashboard' | 'reports' | 'products' | 'return-bills' | 'return-items' | 'product-management' | 'home-delivery' | 'return-records'>('pos');
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState<Order | null>(null);
  const [returnType, setReturnType] = useState<'complete' | 'partial' | null>(null);
  const [processedOrderId, setProcessedOrderId] = useState<string | null>(null); // Track processed order ID
  const [returnItems, setReturnItems] = useState<Record<string, number>>({}); // Track return items
  const [returnReason, setReturnReason] = useState<string>(''); // Track return reason
  const navigate = useNavigate();
  
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
    clearReturns // Add clearReturns function
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
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    console.log('User logged out');
    navigate('/');
  };

  const handleReturnOrder = (order: Order, type: 'complete' | 'partial' | null = null) => {
    console.log('handleReturnOrder called with order:', order, 'and type:', type);
    setSelectedOrderForReturn(order);
    setReturnType(type);
    setActiveView('return-items');
    console.log('State updated: selectedOrderForReturn set and activeView set to return-items');
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
    // This would typically generate and print a receipt
    alert(`Printing receipt for order ${order.id}`);
  };

  // Wrapper functions to handle async operations
  const handleAddCustomer = async (customer: any) => {
    return await addCustomer(customer);
  };

  const handleCheckout = async (paymentMethod: any, cashAmount?: number, cardAmount?: number) => {
    return await createOrder(paymentMethod, cashAmount, cardAmount);
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
                  variant={activeView === 'return-bills' || activeView === 'return-items' ? "default" : "ghost"} 
                  className="flex items-center gap-2"
                  onClick={() => setActiveView('return-bills')}
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
                    onAddToCart={addToCart}
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
                onAddToCart={addToCart}
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
              onReturnOrder={handleReturnOrder}
              onReloadOrders={reloadOrders}
            />
          </div>
        )}

        {(activeView === 'return-bills' || activeView === 'return-items') && (
          <div className="mt-6">
            <div className="flex gap-4 mb-4">
              <Button 
                variant={activeView === 'return-bills' ? "default" : "outline"}
                onClick={() => setActiveView('return-bills')}
              >
                Return by Bills
              </Button>
              <Button 
                variant={activeView === 'return-items' ? "default" : "outline"}
                onClick={() => setActiveView('return-items')}
              >
                Return by Items
              </Button>
            </div>
            {activeView === 'return-bills' ? 
              <ReturnByBills onReturnProcessed={handleReturnProcessed} onViewReceipt={handleViewReceipt} onPrintReceipt={handlePrintReceipt} /> : 
              <ReturnByItems 
                key={`${selectedOrderForReturn?.id}-${returnType}`} 
                preselectedOrder={selectedOrderForReturn} 
                returnType={returnType} 
                onReturnProcessed={handleReturnProcessed}
                onViewReceipt={handleViewReceipt}
                onPrintReceipt={handlePrintReceipt}
              />
            }
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
                  onAddToCart={addToCart}
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