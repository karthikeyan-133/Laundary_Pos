import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductList } from '@/components/ProductList';
import { Receipt } from '@/components/Receipt';
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
import { Order } from '@/types/pos';
import { ProductManagement } from '@/components/ProductManagement';

const Index = () => {
  const [activeView, setActiveView] = useState<'pos' | 'receipt' | 'dashboard' | 'reports' | 'products' | 'return-bills' | 'return-items' | 'product-management' | 'home-delivery'>('pos');
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState<Order | null>(null);
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
    error
  } = usePOSStore();

  const totals = calculateTotals();
  const lastOrder = orders[0] || null;

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

  const handleReturnOrder = (order: Order) => {
    setSelectedOrderForReturn(order);
    setActiveView('return-items');
  };

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
            <Reports orders={orders} onReturnOrder={handleReturnOrder} />
          </div>
        )}

        {activeView === 'home-delivery' && (
          <div className="mt-6">
            <HomeDelivery 
              orders={orders}
              onUpdateOrderPaymentStatus={updateOrderPaymentStatus}
              onUpdateOrderDeliveryStatus={updateOrderDeliveryStatus}
              currency={settings.currency}
              onReturnOrder={handleReturnOrder}
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
              <ReturnByBills /> : 
              <ReturnByItems preselectedOrder={selectedOrderForReturn} />
            }
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveView('pos')}>
            <CardContent className="p-4 text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">New Sale</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveView('receipt')}>
            <CardContent className="p-4 text-center">
              <ReceiptIcon className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">Last Receipt</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveView('dashboard')}>
            <CardContent className="p-4 text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">Reports</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveView('home-delivery')}>
            <CardContent className="p-4 text-center">
              <Truck className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">Home Delivery</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveView('return-bills')}>
            <CardContent className="p-4 text-center">
              <RotateCcw className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">Return</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveView('product-management')}>
            <CardContent className="p-4 text-center">
              <PlusSquare className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">Products</p>
            </CardContent>
          </Card>
        </div>

        {activeView === 'receipt' && lastOrder && (
          <div className="mt-6">
            <Receipt order={lastOrder} settings={settings} />
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