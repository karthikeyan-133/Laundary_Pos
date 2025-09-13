import { useState, useEffect } from 'react';
import { Product, CartItem, Customer, Order, POSSettings } from '@/types/pos';
import { productsApi, customersApi, ordersApi, settingsApi } from '@/services/api';

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
    id: '1',
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
  return {
    ...product,
    price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
    stock: typeof product.stock === 'string' ? parseInt(product.stock, 10) : product.stock
  };
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
  return {
    ...order,
    // Map database field names to frontend field names
    createdAt: order.createdAt || order.created_at || new Date(),
    updatedAt: order.updatedAt || order.updated_at || new Date(),
    subtotal: typeof order.subtotal === 'string' ? parseFloat(order.subtotal) : order.subtotal,
    discount: typeof order.discount === 'string' ? parseFloat(order.discount) : order.discount,
    tax: typeof order.tax === 'string' ? parseFloat(order.tax) : order.tax,
    total: typeof order.total === 'string' ? parseFloat(order.total) : order.total,
    items: order.items ? order.items.map((item: any) => ({
      ...item,
      product: convertProductDataTypes(item.product),
      subtotal: typeof item.subtotal === 'string' ? parseFloat(item.subtotal) : item.subtotal,
      discount: typeof item.discount === 'string' ? parseFloat(item.discount) : item.discount
    })) : order.items
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
        
        // Load orders
        const fetchedOrders = await ordersApi.getAll();
        // Convert data types for orders
        const convertedOrders = fetchedOrders.map(convertOrderDataTypes);
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
          localStorage.setItem('pos-last-login-date', today);
        }
        
        // Load held carts from localStorage (these are temporary and don't need to be in DB)
        const savedHeldCarts = localStorage.getItem('pos-held-carts');
        if (savedHeldCarts) {
          setHeldCarts(JSON.parse(savedHeldCarts));
        }
        
        setError(null);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load data from server');
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
    setCustomer(sampleCustomers[0]); // Reset to default customer
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

  const createOrder = async (paymentMethod: Order['paymentMethod'] = 'cash') => {
    if (cart.length === 0) return null;

    try {
      const { subtotal, discount, tax, total } = calculateTotals();
      
      // Prepare order data
      const newOrderData = {
        customer_id: customer.id,
        subtotal,
        discount,
        tax,
        total,
        payment_method: paymentMethod,
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
      
      // Update local state
      setOrders(prev => [createdOrder, ...prev]);
      clearCart();
      
      return createdOrder;
    } catch (err) {
      console.error('Failed to create order:', err);
      setError('Failed to create order');
      return null;
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
    const uniqueCustomers = new Set(todayOrders.map(order => order.customer.name));
    return uniqueCustomers.size;
  };

  const getTodayProducts = (orderList: Order[] = orders) => {
    const todayOrders = getTodayOrders(orderList);
    const productSet = new Set<string>();
    
    todayOrders.forEach(order => {
      order.items.forEach(item => {
        productSet.add(item.product.id);
      });
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
      // In a real implementation, you would call an API endpoint to update the order
      // For now, we'll just update the local state
      setOrders(prev => prev.map(order => {
        if (order.id === orderId) {
          const updatedOrder = {
            ...order,
            paymentStatus,
            updatedAt: new Date()
          };
          
          // If payment method is provided, update it
          if (paymentMethod) {
            updatedOrder.paymentMethod = paymentMethod;
          }
          
          // If payment is made, update order status to completed
          if (paymentStatus === 'paid') {
            updatedOrder.status = 'completed';
          }
          
          return updatedOrder;
        }
        return order;
      }));
    } catch (err) {
      console.error('Failed to update order payment status:', err);
      setError('Failed to update order payment status');
    }
  };

  // Update order delivery status
  const updateOrderDeliveryStatus = async (orderId: string, deliveryStatus: 'pending' | 'in-transit' | 'delivered') => {
    try {
      // In a real implementation, you would call an API endpoint to update the order
      // For now, we'll just update the local state
      setOrders(prev => prev.map(order => {
        if (order.id === orderId) {
          return {
            ...order,
            deliveryStatus,
            updatedAt: new Date()
          };
        }
        return order;
      }));
    } catch (err) {
      console.error('Failed to update order delivery status:', err);
      setError('Failed to update order delivery status');
    }
  };

  // Get COD orders
  const getCODOrders = () => {
    return orders.filter(order => order.paymentMethod === 'cod');
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

    // Dashboard data
    getTodayOrders,
    getTodaySales,
    getTodayCustomers,
    getTodayProducts,
    getClosingBalance
  };
}