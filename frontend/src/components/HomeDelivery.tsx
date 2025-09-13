import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  CreditCard, 
  Banknote, 
  Wallet,
  Edit,
  RotateCw
} from 'lucide-react';
import { Order } from '@/types/pos';
import { PaymentMethodSelector } from './PaymentMethodSelector';

interface HomeDeliveryProps {
  orders: Order[];
  onUpdateOrderPaymentStatus: (orderId: string, paymentStatus: 'paid' | 'unpaid', paymentMethod?: Order['paymentMethod']) => Promise<void>;
  onUpdateOrderDeliveryStatus: (orderId: string, deliveryStatus: 'pending' | 'in-transit' | 'delivered') => Promise<void>;
  currency: string;
  onReturnOrder: (order: Order) => void;
  onReloadOrders: () => Promise<void>; // Add this prop to reload orders
}

export function HomeDelivery({ 
  orders, 
  onUpdateOrderPaymentStatus, 
  onUpdateOrderDeliveryStatus,
  currency,
  onReturnOrder,
  onReloadOrders // Destructure the new prop
}: HomeDeliveryProps) {
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<Order['paymentMethod']>('cash');

  const handleEditOrder = (orderId: string) => {
    setEditingOrderId(orderId);
  };

  const handlePaymentSubmit = async (orderId: string) => {
    try {
      await onUpdateOrderPaymentStatus(orderId, 'paid', selectedPaymentMethod);
      setEditingOrderId(null);
      // Reload orders after payment update to reflect changes
      await onReloadOrders();
    } catch (error) {
      console.error('Failed to update payment status:', error);
    }
  };

  const handleDeliveryStatusChange = async (orderId: string, status: 'pending' | 'in-transit' | 'delivered') => {
    try {
      await onUpdateOrderDeliveryStatus(orderId, status);
      // Reload orders after delivery status update to reflect changes
      await onReloadOrders();
    } catch (error) {
      console.error('Failed to update delivery status:', error);
    }
  };

  // Filter COD orders
  const codOrders = orders.filter(order => order.paymentMethod === 'cod');

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Home Delivery Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {codOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No home delivery orders found</p>
              <p className="text-sm">COD orders will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {codOrders.map(order => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">Order #{order.id.slice(-6)}</h3>
                        <Badge variant={
                          order.paymentStatus === 'paid' ? 'default' : 'destructive'
                        }>
                          {order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                        </Badge>
                        <Badge variant="outline">
                          {order.deliveryStatus || 'Pending'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {order.customer?.name || 'Unknown Customer'} • {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onReturnOrder(order)}
                      >
                        <RotateCw className="h-4 w-4 mr-1" />
                        Return
                      </Button>
                      {order.paymentStatus === 'unpaid' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditOrder(order.id)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Items</p>
                      <p className="font-medium">{order.items && Array.isArray(order.items) ? order.items.length : 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="font-medium">{currency} {order.total.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Delivery Status</p>
                      <div className="flex gap-2 mt-1">
                        <Button
                          size="sm"
                          variant={order.deliveryStatus === 'pending' ? 'default' : 'outline'}
                          onClick={() => handleDeliveryStatusChange(order.id, 'pending')}
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Button>
                        <Button
                          size="sm"
                          variant={order.deliveryStatus === 'in-transit' ? 'default' : 'outline'}
                          onClick={() => handleDeliveryStatusChange(order.id, 'in-transit')}
                        >
                          <Truck className="h-3 w-3 mr-1" />
                          In Transit
                        </Button>
                        <Button
                          size="sm"
                          variant={order.deliveryStatus === 'delivered' ? 'default' : 'outline'}
                          onClick={() => handleDeliveryStatusChange(order.id, 'delivered')}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Delivered
                        </Button>
                      </div>
                    </div>
                  </div>

                  {editingOrderId === order.id && (
                    <div className="mt-4 p-4 border rounded-lg bg-muted">
                      <h4 className="font-medium mb-3">Process Payment</h4>
                      <PaymentMethodSelector 
                        selectedMethod={selectedPaymentMethod}
                        onMethodChange={setSelectedPaymentMethod}
                        onConfirm={() => handlePaymentSubmit(order.id)}
                        totalAmount={order.total}
                        currency={currency}
                      />
                      <div className="flex justify-end gap-2 mt-3">
                        <Button 
                          variant="outline" 
                          onClick={() => setEditingOrderId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}