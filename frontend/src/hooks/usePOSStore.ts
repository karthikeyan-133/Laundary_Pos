import { useState, useEffect } from 'react';
import { Product, CartItem, Customer, Order, POSSettings } from '@/types/pos';
import { productsApi, customersApi, ordersApi, settingsApi } from '@/services/api';
import { returnsApi } from '@/services/returnsApi';

// Default settings
const defaultSettings: POSSettings = {
  taxRate: 5.0, // UAE VAT rate is 5%
  currency: 'AED',
  businessName: 'TallyPrime Café',
  businessAddress: 'Shop 123, Marina Mall, Dubai Marina, Dubai, UAE',
  businessPhone: '+971 4 123 4567',
  barcodeScannerEnabled: true // Add barcode scanner setting
};

// Sample customers data (will be replaced by API)
const sampleCustomers: Customer[] = [
  {
    id: 'default-walk-in',
    name: 'Walk-in Customer',
    code: 'WIC001',
    phone: '',
    email: '',
    place: '',
    emirate: ''
  }
];

// Helper function to convert product data types
const convertProductDataTypes = (product: any): Product => {
  console.log('Converting product:', product);
  const convertedProduct = {
    ...product,
    price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
    stock: typeof product.stock === 'string' ? parseInt(product.stock, 10) : product.stock
  };
  console.log('Converted product:', convertedProduct);
  return convertedProduct;
};

// Helper function to convert customer data types
const convertCustomerDataTypes = (customer: any): Customer => {
  return {
    ...customer
  };
};

// Helper function to convert settings data types
const convertSettingsDataTypes = (settings: any): POSSettings => {
  console.log('Raw settings from API:', settings);
  
  // Handle both Supabase field names and potential JS field names
  const taxRate = settings.tax_rate !== undefined ? settings.tax_rate : settings.taxRate;
  const businessName = settings.business_name !== undefined ? settings.business_name : settings.businessName;
  const businessAddress = settings.business_address !== undefined ? settings.business_address : settings.businessAddress;
  const businessPhone = settings.business_phone !== undefined ? settings.business_phone : settings.businessPhone;
  const barcodeScannerEnabled = settings.barcode_scanner_enabled !== undefined ? settings.barcode_scanner_enabled : settings.barcodeScannerEnabled;
  
  const convertedSettings = {
    taxRate: typeof taxRate === 'string' ? parseFloat(taxRate) : (taxRate || 5.0),
    currency: settings.currency || 'AED',
    businessName: businessName || 'TallyPrime Café',
    businessAddress: businessAddress || 'Shop 123, Marina Mall, Dubai Marina, Dubai, UAE',
    businessPhone: businessPhone || '+971 4 123 4567',
    barcodeScannerEnabled: !!barcodeScannerEnabled
  };
  
  console.log('Converted settings:', convertedSettings);
  return convertedSettings;
};

// Helper function to convert order data types
const convertOrderDataTypes = (order: any): Order => {
  console.log('Converting order:', order.id, 'Raw order data:', order);
  
  // Helper function to safely convert date strings to Date objects
  const safeDateConversion = (dateValue: string | Date | undefined | null): Date => {
    if (!dateValue) {
      return new Date(); // Return current date as fallback
    }
    
    if (dateValue instanceof Date) {
      return dateValue;
    }
    
    // Try to parse the string date
    const parsedDate = new Date(dateValue);
    
    // Check if the parsed date is valid
    if (isNaN(parsedDate.getTime())) {
      return new Date(); // Return current date as fallback for invalid dates
    }
    
    return parsedDate;
  };
  
  // Map snake_case field names from backend to camelCase expected by frontend
  const createdAt = order.created_at !== undefined ? order.created_at : order.createdAt;
  const updatedAt = order.updated_at !== undefined ? order.updated_at : order.updatedAt;
  const paymentMethod = order.payment_method !== undefined ? order.payment_method : order.paymentMethod;
  const cashAmount = order.cash_amount !== undefined ? order.cash_amount : order.cashAmount;
  const cardAmount = order.card_amount !== undefined ? order.card_amount : order.cardAmount;
  const deliveryStatus = order.delivery_status !== undefined ? order.delivery_status : order.deliveryStatus;
  const paymentStatus = order.payment_status !== undefined ? order.payment_status : order.paymentStatus;
  
  // Extract customer data from nested 'customers' property
  let customer: Customer;
  if (order.customers) {
    customer = {
      id: order.customer_id,
      ...order.customers
    };
  } else {
    customer = order.customer;
  }
  
  // Process items
  const items = order.items && Array.isArray(order.items) ? order.items.map((item: any) => {
    console.log('Processing item:', item);
    const processedItem = {
      ...item,
      product: convertProductDataTypes(item.product),
      subtotal: typeof item.subtotal === 'string' ? parseFloat(item.subtotal) : item.subtotal,
      discount: typeof item.discount === 'string' ? parseFloat(item.discount) : item.discount
    };
    console.log('Processed item:', processedItem);
    return processedItem;
  }) : [];
  
  console.log('Processed items for order:', order.id, 'Items count:', items.length, 'Items:', items);
  
  return {
    ...order,
    customer, // Use the properly extracted customer data
    paymentMethod, // Ensure correct field mapping
    cashAmount, // Ensure correct field mapping
    cardAmount, // Ensure correct field mapping
    deliveryStatus, // Ensure correct field mapping
    paymentStatus, // Ensure correct field mapping
    subtotal: typeof order.subtotal === 'string' ? parseFloat(order.subtotal) : order.subtotal,
    discount: typeof order.discount === 'string' ? parseFloat(order.discount) : order.discount,
    tax: typeof order.tax === 'string' ? parseFloat(order.tax) : order.tax,
    total: typeof order.total === 'string' ? parseFloat(order.total) : order.total,
    createdAt: safeDateConversion(createdAt),
    updatedAt: safeDateConversion(updatedAt),
    // Ensure items array exists and convert item data types
    items
  };
};

export function usePOSStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>(sampleCustomers);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<Customer>(sampleCustomers[0]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<POSSettings>(defaultSettings);
  const [openingCash, setOpeningCash] = useState<number>(0);
  const [showOpeningCashPopup, setShowOpeningCashPopup] = useState<boolean>(false);
  const [cartDiscount, setCartDiscountState] = useState<{ type: 'flat' | 'percentage'; value: number }>({ type: 'percentage', value: 0 });
  const [heldCarts, setHeldCarts] = useState<{[key: string]: {cart: CartItem[], customer: Customer, timestamp: Date}}>({});
  const [isCartHeld, setIsCartHeld] = useState<boolean>(false);
  const [currentHoldId, setCurrentHoldId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from API on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load products
        const fetchedProducts = await productsApi.getAll();
        // Convert data types for products
        const convertedProducts = fetchedProducts.map(convertProductDataTypes);
        setProducts(convertedProducts);
        
        // Load customers
        const fetchedCustomers = await customersApi.getAll();
        // Convert data types for customers
        const convertedCustomers = fetchedCustomers.map(convertCustomerDataTypes);
        setCustomers(convertedCustomers);
        
        // If we have customers, set the first one as the default customer
        if (convertedCustomers.length > 0) {
          setCustomer(convertedCustomers[0]);
        }
        
        // Load orders
        console.log('Fetching orders from API...');
        const fetchedOrders = await ordersApi.getAll();
        console.log('Raw orders from API:', fetchedOrders);
        
        // Convert data types for orders
        const convertedOrders = fetchedOrders.map(convertOrderDataTypes);
        console.log('Converted orders:', convertedOrders);
        
        setOrders(convertedOrders);
        
        // Load settings
        try {
          const fetchedSettings = await settingsApi.get();
          console.log('Raw settings from API:', fetchedSettings);
          // Convert data types for settings
          const convertedSettings = convertSettingsDataTypes(fetchedSettings);
          console.log('Converted settings:', convertedSettings);
          setSettings(convertedSettings);
        } catch (settingsError) {
          // If settings don't exist, use defaults
          console.warn('Settings not found, using defaults');
          setSettings(defaultSettings);
        }
        
        // Check if it's a new day for opening cash popup
        const lastLoginDate = localStorage.getItem('pos-last-login-date');
        const today = new Date().toDateString();
        
        if (!lastLoginDate || lastLoginDate !== today) {
          setShowOpeningCashPopup(true);
        }
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Save held carts to localStorage (temporary storage)
  useEffect(() => {
    localStorage.setItem('pos-held-carts', JSON.stringify(heldCarts));
  }, [heldCarts]);

  const addToCart = (product: Product, quantity: number = 1) => {
    // Ensure product has correct data types before adding to cart
    const convertedProduct = convertProductDataTypes(product);
    
    setCart(prev => {
      const existingItem = prev.find(item => item.product.id === convertedProduct.id);
      
      if (existingItem) {
        return prev.map(item =>
          item.product.id === convertedProduct.id
            ? {
                ...item,
                product: convertedProduct,
                quantity: item.quantity + quantity,
                subtotal: (item.quantity + quantity) * convertedProduct.price * (1 - item.discount / 100)
              }
            : item
        );
      }

      return [...prev, {
        id: `cart-${Date.now()}-${convertedProduct.id}`,
        product: convertedProduct,
        quantity,
        discount: 0,
        subtotal: quantity * convertedProduct.price
      }];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const updateCartItemQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    setCart(prev => prev.map(item =>
      item.id === cartItemId
        ? {
            ...item,
            quantity,
            subtotal: quantity * item.product.price * (1 - item.discount / 100)
          }
        : item
    ));
  };

  const updateCartItemDiscount = (cartItemId: string, discount: number) => {
    setCart(prev => prev.map(item =>
      item.id === cartItemId
        ? {
            ...item,
            discount,
            subtotal: item.quantity * item.product.price * (1 - discount / 100)
          }
        : item
    ));
  };

  const clearCart = () => {
    setCart([]);
    // Reset to default customer (first customer from the list or sample customer if list is empty)
    setCustomer(customers.length > 0 ? customers[0] : sampleCustomers[0]);
    setCartDiscountState({ type: 'percentage', value: 0 }); // Reset cart discount
    setIsCartHeld(false);
    setCurrentHoldId(null);
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    
    // Calculate cart discount
    let discountAmount = 0;
    if (cartDiscount.type === 'percentage') {
      discountAmount = subtotal * (cartDiscount.value / 100);
    } else {
      discountAmount = cartDiscount.value;
    }
    
    // Ensure discount doesn't exceed subtotal
    discountAmount = Math.min(discountAmount, subtotal);
    
    const discountedSubtotal = subtotal - discountAmount;
    console.log('Calculating totals:', { 
      subtotal, 
      discountAmount, 
      discountedSubtotal, 
      taxRate: settings.taxRate,
      taxRateType: typeof settings.taxRate
    });
    
    // Ensure taxRate is a number
    const taxRate = typeof settings.taxRate === 'string' ? parseFloat(settings.taxRate) : settings.taxRate;
    const tax = discountedSubtotal * (taxRate / 100);
    const total = discountedSubtotal + tax;
    
    console.log('Calculated totals:', { subtotal, discount: discountAmount, tax, total });

    return { subtotal, discount: discountAmount, tax, total };
  };

  const createOrder = async (paymentMethod: Order['paymentMethod'] = 'cash', cashAmount?: number, cardAmount?: number) => {
    if (cart.length === 0) return null;

    try {
      const { subtotal, discount, tax, total } = calculateTotals();
      
      // Prepare order data
      const newOrderData: any = {
        customer_id: customer.id,
        subtotal,
        discount,
        tax,
        total,
        payment_method: paymentMethod,
        cash_amount: cashAmount, // Add cash amount for split payments
        card_amount: cardAmount, // Add card amount for split payments
        status: 'completed' as const,
        delivery_status: undefined,
        payment_status: undefined,
        items: cart.map(item => ({
          id: `item-${Date.now()}-${item.id}`,
          product_id: item.product.id,
          quantity: item.quantity,
          discount: item.discount,
          subtotal: item.subtotal
        }))
      };

      // For COD orders, set initial delivery and payment status
      if (paymentMethod === 'cod') {
        newOrderData.status = 'pending';
        newOrderData.delivery_status = 'pending';
        newOrderData.payment_status = 'unpaid';
      }

      // Send to API
      const createdOrder = await ordersApi.create(newOrderData);
      
      // Update product stock levels
      const updatedProducts = [...products];
      for (const cartItem of cart) {
        const productIndex = updatedProducts.findIndex(p => p.id === cartItem.product.id);
        if (productIndex !== -1) {
          updatedProducts[productIndex] = {
            ...updatedProducts[productIndex],
            stock: updatedProducts[productIndex].stock - cartItem.quantity
          };
          // Update product in database
          await productsApi.update(cartItem.product.id, {
            stock: updatedProducts[productIndex].stock
          });
        }
      }
      setProducts(updatedProducts);
      
      // Reload orders to ensure we have the latest data
      await reloadOrders();
      clearCart();
      
      return createdOrder;
    } catch (err) {
      console.error('Failed to create order:', err);
      setError('Failed to create order');
      return null;
    }
  };

  // Add a function to reload orders data
  const reloadOrders = async () => {
    try {
      const fetchedOrders = await ordersApi.getAll();
      // Convert data types for orders
      const convertedOrders = fetchedOrders.map(convertOrderDataTypes);
      setOrders(convertedOrders);
    } catch (err) {
      console.error('Failed to reload orders:', err);
      setError('Failed to reload orders');
    }
  };

  // Update the searchProducts function to search by barcode
  const searchProducts = (query: string) => {
    if (!query.trim()) return products;
    
    const lowercaseQuery = query.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.category.toLowerCase().includes(lowercaseQuery) ||
      product.sku.toLowerCase().includes(lowercaseQuery) ||
      product.barcode.toLowerCase().includes(lowercaseQuery) || // Add barcode search
      product.id.includes(query) // Direct ID match for barcode scanning
    );
  };

  const setOpeningCashAmount = (amount: number) => {
    setOpeningCash(amount);
    setShowOpeningCashPopup(false);
  };

  const getTodayOrders = (orderList: Order[] = orders) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return orderList.filter(order => {
      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });
  };

  const getTodaySales = (orderList: Order[] = orders) => {
    const todayOrders = getTodayOrders(orderList);
    return todayOrders.reduce((sum, order) => sum + order.total, 0);
  };

  const getTodayCustomers = (orderList: Order[] = orders) => {
    const todayOrders = getTodayOrders(orderList);
    const uniqueCustomers = new Set(todayOrders.map(order => order.customer?.name || 'Unknown Customer'));
    return uniqueCustomers.size;
  };

  const getTodayProducts = (orderList: Order[] = orders) => {
    const todayOrders = getTodayOrders(orderList);
    const productSet = new Set<string>();
    
    todayOrders.forEach(order => {
      // Add safety check for order.items
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          productSet.add(item.product.id);
        });
      }
    });
    
    return productSet.size;
  };

  const getClosingBalance = (orderList: Order[] = orders) => {
    return openingCash + getTodaySales(orderList);
  };

  const addCustomer = async (newCustomer: Omit<Customer, 'id'>) => {
    try {
      const customerWithId = await customersApi.create(newCustomer);
      setCustomers(prev => [...prev, customerWithId]);
      return customerWithId;
    } catch (err) {
      console.error('Failed to add customer:', err);
      setError('Failed to add customer');
      // Return a temporary customer if API fails
      const tempCustomer = { ...newCustomer, id: `CUST-${Date.now()}` } as Customer;
      setCustomers(prev => [...prev, tempCustomer]);
      return tempCustomer;
    }
  };

  const updateCartDiscount = (type: 'flat' | 'percentage', value: number) => {
    setCartDiscountState({ type, value });
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      // Convert price and stock to proper types before sending to API
      const productWithCorrectTypes = {
        ...product,
        price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
        stock: typeof product.stock === 'string' ? parseInt(product.stock, 10) : product.stock
      };
      
      const newProduct = await productsApi.create(productWithCorrectTypes);
      // Convert data types for the returned product
      const convertedProduct = convertProductDataTypes(newProduct);
      setProducts(prev => [...prev, convertedProduct]);
      return convertedProduct;
    } catch (err) {
      console.error('Failed to add product:', err);
      setError('Failed to add product');
      // Return a temporary product if API fails
      const tempProduct = { 
        ...product, 
        id: `PROD-${Date.now()}`,
        price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
        stock: typeof product.stock === 'string' ? parseInt(product.stock, 10) : product.stock
      } as Product;
      setProducts(prev => [...prev, tempProduct]);
      return tempProduct;
    }
  };

  const editProduct = async (updatedProduct: Product) => {
    try {
      // Convert price and stock to proper types before sending to API
      const productWithCorrectTypes = {
        ...updatedProduct,
        price: typeof updatedProduct.price === 'string' ? parseFloat(updatedProduct.price) : updatedProduct.price,
        stock: typeof updatedProduct.stock === 'string' ? parseInt(updatedProduct.stock, 10) : updatedProduct.stock
      };
      
      const product = await productsApi.update(updatedProduct.id, productWithCorrectTypes);
      // Convert data types for the returned product
      const convertedProduct = convertProductDataTypes(product);
      setProducts(prev => 
        prev.map(p => 
          p.id === updatedProduct.id ? convertedProduct : p
        )
      );
      // Also update in cart if present
      setCart(prev => 
        prev.map(item => 
          item.product.id === updatedProduct.id 
            ? { ...item, product: convertedProduct } 
            : item
        )
      );
      return convertedProduct;
    } catch (err) {
      console.error('Failed to update product:', err);
      setError('Failed to update product');
      // Ensure we return a product with correct data types even on error
      const convertedProduct = convertProductDataTypes(updatedProduct);
      return convertedProduct;
    }
  };

  const removeProduct = async (productId: string) => {
    try {
      await productsApi.delete(productId);
      setProducts(prev => prev.filter(product => product.id !== productId));
      // Also remove from cart if present
      setCart(prev => prev.filter(item => item.product.id !== productId));
    } catch (err) {
      console.error('Failed to remove product:', err);
      setError('Failed to remove product');
      // Still remove from local state even if API fails
      setProducts(prev => prev.filter(product => product.id !== productId));
      setCart(prev => prev.filter(item => item.product.id !== productId));
    }
  };

  // Hold cart functionality
  const holdCart = () => {
    if (cart.length === 0) return null;
    
    const holdId = `hold-${Date.now()}`;
    const holdData = {
      cart: [...cart],
      customer: { ...customer },
      timestamp: new Date()
    };
    
    setHeldCarts(prev => ({
      ...prev,
      [holdId]: holdData
    }));
    
    setIsCartHeld(true);
    setCurrentHoldId(holdId);
    
    // Clear current cart but keep customer
    setCart([]);
    setCartDiscountState({ type: 'percentage', value: 0 });
    
    return holdId;
  };

  // Unhold cart functionality
  const unholdCart = (holdId: string) => {
    const heldCart = heldCarts[holdId];
    if (!heldCart) return false;
    
    setCart(heldCart.cart);
    setCustomer(heldCart.customer);
    setCartDiscountState({ type: 'percentage', value: 0 }); // Reset discount when unholding
    
    // Remove from held carts
    setHeldCarts(prev => {
      const newHeldCarts = { ...prev };
      delete newHeldCarts[holdId];
      return newHeldCarts;
    });
    
    setIsCartHeld(false);
    setCurrentHoldId(null);
    
    return true;
  };

  // Get list of held carts for display
  const getHeldCartsList = () => {
    return Object.entries(heldCarts).map(([id, data]) => ({
      id,
      timestamp: data.timestamp,
      itemCount: data.cart.length,
      customerName: data.customer.name
    }));
  };

  // Update order payment status (for COD orders)
  const updateOrderPaymentStatus = async (orderId: string, paymentStatus: 'paid' | 'unpaid', paymentMethod?: Order['paymentMethod']) => {
    try {
      // Prepare the update data
      const updateData: any = {
        payment_status: paymentStatus,
        updated_at: new Date()
      };
      
      // If payment method is provided, update it
      if (paymentMethod) {
        updateData.payment_method = paymentMethod;
      }
      
      // If payment is made, update order status to completed
      if (paymentStatus === 'paid') {
        updateData.status = 'completed';
      }
      
      // Call API to update the order
      const updatedOrder = await ordersApi.update(orderId, updateData);
      
      // Convert data types for the returned order
      const convertedOrder = convertOrderDataTypes(updatedOrder);
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId ? convertedOrder : order
      ));
      
      // Reload orders to ensure all components have updated data
      await reloadOrders();
    } catch (err) {
      console.error('Failed to update order payment status:', err);
      setError('Failed to update order payment status');
    }
  };

  // Update order delivery status
  const updateOrderDeliveryStatus = async (orderId: string, deliveryStatus: 'pending' | 'in-transit' | 'delivered') => {
    try {
      // Prepare the update data
      const updateData: any = {
        delivery_status: deliveryStatus,
        updated_at: new Date()
      };
      
      // Call API to update the order
      const updatedOrder = await ordersApi.update(orderId, updateData);
      
      // Convert data types for the returned order
      const convertedOrder = convertOrderDataTypes(updatedOrder);
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId ? convertedOrder : order
      ));
      
      // Reload orders to ensure all components have updated data
      await reloadOrders();
    } catch (err) {
      console.error('Failed to update order delivery status:', err);
      setError('Failed to update order delivery status');
    }
  };

  // Get COD orders
  const getCODOrders = () => {
    return orders.filter(order => order.paymentMethod === 'cod');
  };
  
  // Add returns state
  const [returns, setReturns] = useState<any[]>([]);
  
  // Add function to process returns
  const processReturn = async (orderId: string, items: any[], reason?: string) => {
    try {
      // Calculate total refund amount
      const refundAmount = items.reduce((total, item) => {
        return total + (item.quantity * item.product.price * (1 - item.discount / 100));
      }, 0);
      
      // Prepare return data
      const returnData = {
        order_id: orderId,
        reason,
        refund_amount: refundAmount,
        items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          refund_amount: item.quantity * item.product.price * (1 - item.discount / 100)
        }))
      };
      
      // Send to API
      const createdReturn = await returnsApi.create(returnData);
      
      // Update product stock levels
      const updatedProducts = [...products];
      for (const item of items) {
        const productIndex = updatedProducts.findIndex(p => p.id === item.product.id);
        if (productIndex !== -1) {
          updatedProducts[productIndex] = {
            ...updatedProducts[productIndex],
            stock: updatedProducts[productIndex].stock + item.quantity
          };
          // Update product in database
          await productsApi.update(item.product.id, {
            stock: updatedProducts[productIndex].stock
          });
        }
      }
      setProducts(updatedProducts);
      
      // Add to returns list
      setReturns(prev => [...prev, createdReturn]);
      
      return createdReturn;
    } catch (err) {
      console.error('Failed to process return:', err);
      setError('Failed to process return');
      return null;
    }
  };

  return {
    // State
    products,
    customers,
    cart,
    customer,
    orders,
    settings,
    openingCash,
    showOpeningCashPopup,
    cartDiscount,
    heldCarts,
    isCartHeld,
    currentHoldId,
    loading,
    error,

    // Actions
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    updateCartItemDiscount,
    clearCart,
    setCustomer,
    createOrder,
    searchProducts,
    calculateTotals,
    setOpeningCashAmount,
    setShowOpeningCashPopup,
    addCustomer,
    setCartDiscount: updateCartDiscount,
    addProduct,
    editProduct,
    removeProduct,
    holdCart,
    unholdCart,
    getHeldCartsList,
    updateOrderPaymentStatus,
    updateOrderDeliveryStatus,
    getCODOrders,
    processReturn,
    returns,
    reloadOrders, // Export the reloadOrders function

    // Dashboard data
    getTodayOrders,
    getTodaySales,
    getTodayCustomers,
    getTodayProducts,
    getClosingBalance
  };
}