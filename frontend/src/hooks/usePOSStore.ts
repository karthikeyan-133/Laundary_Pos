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
    contactName: '',
    phone: '',
    email: '',
    place: '',
    emirate: ''
  }
];

// Helper function to convert product data types with better error handling
const convertProductDataTypes = (product: any): Product => {
  console.log('Converting product:', product);
  
  // Handle potential null/undefined values
  if (!product) {
    console.warn('Received null/undefined product data');
    return {
      id: '',
      name: 'Unknown Product',
      ironRate: 0,
      washAndIronRate: 0,
      dryCleanRate: 0,
      category: 'Unknown',
      barcode: '',
      description: ''
    };
  }
  
  // Handle both camelCase and snake_case field names from backend
  const ironRate = product.ironRate !== undefined ? product.ironRate : 
                  product.ironrate !== undefined ? product.ironrate : 0;
  const washAndIronRate = product.washAndIronRate !== undefined ? product.washAndIronRate : 
                         product.washandironrate !== undefined ? product.washandironrate : 0;
  const dryCleanRate = product.dryCleanRate !== undefined ? product.dryCleanRate : 
                      product.drycleanrate !== undefined ? product.drycleanrate : 0;
  
  // Ensure all values are proper numbers
  const safeIronRate = parseFloat(ironRate) || 0;
  const safeWashAndIronRate = parseFloat(washAndIronRate) || 0;
  const safeDryCleanRate = parseFloat(dryCleanRate) || 0;
  
  // Extract product name with multiple fallbacks
  let productName = 'Unknown Product';
  if (typeof product.name === 'string' && product.name.trim() !== '') {
    productName = product.name;
  } else if (product.product_name && typeof product.product_name === 'string' && product.product_name.trim() !== '') {
    productName = product.product_name;
  } else if (product.title && typeof product.title === 'string' && product.title.trim() !== '') {
    productName = product.title;
  }
  
  // Extract category with fallbacks
  let category = 'Unknown';
  if (typeof product.category === 'string' && product.category.trim() !== '') {
    category = product.category;
  } else if (product.product_category && typeof product.product_category === 'string' && product.product_category.trim() !== '') {
    category = product.product_category;
  }
  
  const convertedProduct: Product = {
    id: product.id || '',
    name: productName,
    ironRate: safeIronRate,
    washAndIronRate: safeWashAndIronRate,
    dryCleanRate: safeDryCleanRate,
    category: category,
    barcode: product.barcode || '',
    description: product.description || ''
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

// Helper function to get Dubai time
const getDubaiTime = (): Date => {
  // Create a new date object for current time
  const now = new Date();
  // Dubai is UTC+4
  const dubaiOffset = 4 * 60; // 4 hours in minutes
  const localOffset = now.getTimezoneOffset();
  const dubaiTime = new Date(now.getTime() + (localOffset + dubaiOffset) * 60000);
  return dubaiTime;
};

// Helper function to safely convert date strings to Date objects in Dubai time
const safeDateConversion = (dateValue: string | Date | undefined | null): Date => {
  if (!dateValue) {
    return getDubaiTime(); // Return current Dubai time as fallback
  }
  
  if (dateValue instanceof Date) {
    return dateValue;
  }
  
  // Try to parse the string date
  const parsedDate = new Date(dateValue);
  
  // Check if the parsed date is valid
  if (isNaN(parsedDate.getTime())) {
    return getDubaiTime(); // Return current Dubai time as fallback for invalid dates
  }
  
  // Convert to Dubai time
  const dubaiOffset = 4 * 60; // 4 hours in minutes
  const localOffset = parsedDate.getTimezoneOffset();
  const dubaiTime = new Date(parsedDate.getTime() + (localOffset + dubaiOffset) * 60000);
  
  return dubaiTime;
};

// Helper function to convert order data types
const convertOrderDataTypes = (order: any): Order => {
  console.log('=== CONVERTING ORDER ===');
  console.log('Raw order data:', JSON.stringify(order, null, 2));
  
  // Map snake_case field names from backend to camelCase expected by frontend
  const createdAt = order.created_at !== undefined ? order.created_at : order.createdAt;
  const updatedAt = order.updated_at !== undefined ? order.updated_at : order.updatedAt;
  const paymentMethod = order.payment_method !== undefined ? order.payment_method : order.paymentMethod;
  const cashAmount = order.cash_amount !== undefined ? order.cash_amount : order.cashAmount;
  const cardAmount = order.card_amount !== undefined ? order.card_amount : order.cardAmount;
  const deliveryStatus = order.delivery_status !== undefined ? order.delivery_status : order.deliveryStatus;
  const paymentStatus = order.payment_status !== undefined ? order.payment_status : order.paymentStatus;
  
  // Extract customer data with proper field mapping
  const customer = order.customers || order.customer || {};
  
  // Process items array with enhanced error handling
  const items = order.items ? order.items.map((item: any, index: number) => {
    console.log(`--- Converting item ${index} ---`);
    console.log('Raw item data:', JSON.stringify(item, null, 2));
    
    // Extract product data from the item fields (product info is embedded in order items)
    const productData = {
      id: item.product_id || '',
      name: item.product_name || item.name || 'Unknown Product',
      ironRate: typeof item.ironRate === 'string' ? parseFloat(item.ironRate) : item.ironRate || 0,
      washAndIronRate: typeof item.washAndIronRate === 'string' ? parseFloat(item.washAndIronRate) : item.washAndIronRate || 0,
      dryCleanRate: typeof item.dryCleanRate === 'string' ? parseFloat(item.dryCleanRate) : item.dryCleanRate || 0,
      category: item.category || 'Unknown',
      barcode: item.barcode || '',
      description: item.description || ''
    };
    
    console.log('Extracted product data:', JSON.stringify(productData, null, 2));
    
    const convertedProduct = convertProductDataTypes(productData);
    console.log('Converted product:', convertedProduct);
    
    // Ensure quantity and discount are proper numbers
    const quantity = typeof item.quantity === 'string' ? parseFloat(item.quantity) : item.quantity;
    const discount = typeof item.discount === 'string' ? parseFloat(item.discount) : item.discount;
    const subtotal = typeof item.subtotal === 'string' ? parseFloat(item.subtotal) : item.subtotal;
    
    const processedItem = {
      ...item,
      product: convertedProduct,
      quantity: quantity || 0,
      discount: discount || 0,
      subtotal: subtotal || 0
    };
    console.log('Processed item:', processedItem);
    return processedItem;
  }) : [];
  
  console.log('Processed items for order:', order.id, 'Items count:', items.length, 'Items:', items);
  
  const convertedOrder = {
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
  
  console.log('Final converted order:', convertedOrder);
  return convertedOrder;
};

export function usePOSStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>(sampleCustomers);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<Customer>(sampleCustomers[0]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<POSSettings>(defaultSettings);
  const [openingCash, setOpeningCash] = useState<number>(() => {
    // Load opening cash from localStorage if available
    const savedOpeningCash = localStorage.getItem('pos-opening-cash');
    return savedOpeningCash ? parseFloat(savedOpeningCash) : 0;
  });
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
        
        // Load all data in parallel to improve loading time
        const [fetchedProducts, fetchedCustomers, fetchedOrders, fetchedSettings] = await Promise.all([
          productsApi.getAll(),
          customersApi.getAll(),
          ordersApi.getAll(),
          settingsApi.get().catch(() => null) // Settings are optional, so we catch errors
        ]);
        
        console.log('Raw products from API:', fetchedProducts);
        
        // Convert data types for products
        const convertedProducts = fetchedProducts.map(convertProductDataTypes);
        console.log('Converted products:', convertedProducts);
        setProducts(convertedProducts);
        
        // Convert data types for customers
        const convertedCustomers = fetchedCustomers.map(convertCustomerDataTypes);
        
        // If we have no customers, create a default walk-in customer
        if (convertedCustomers.length === 0) {
          // Create default walk-in customer
          const defaultCustomer: Customer = {
            id: 'default-walk-in',
            name: 'Walk-in Customer',
            code: 'WIC001',
            contactName: '',
            phone: '',
            email: '',
            place: '',
            emirate: ''
          };
          
          // Try to add the default customer to the database
          try {
            const createdCustomer = await customersApi.create({
              name: defaultCustomer.name,
              code: defaultCustomer.code,
              contactName: defaultCustomer.contactName,
              phone: defaultCustomer.phone,
              email: defaultCustomer.email,
              place: defaultCustomer.place,
              emirate: defaultCustomer.emirate
            });
            
            // Use the customer returned from the API (with proper ID)
            setCustomers([createdCustomer]);
            setCustomer(createdCustomer);
          } catch (createError) {
            console.warn('Failed to create default customer in database, using local default:', createError);
            // If we can't create it in the database, use the local default
            setCustomers([defaultCustomer]);
            setCustomer(defaultCustomer);
          }
        } else {
          // If we have customers, set the first one as the default customer
          setCustomers(convertedCustomers);
          setCustomer(convertedCustomers[0]);
        }
        
        // Convert data types for orders
        console.log('Raw orders from API:', fetchedOrders);
        const convertedOrders = fetchedOrders.map(convertOrderDataTypes);
        console.log('Converted orders:', convertedOrders);
        setOrders(convertedOrders);
        
        // Handle settings
        if (fetchedSettings) {
          console.log('Raw settings from API:', fetchedSettings);
          // Convert data types for settings
          const convertedSettings = convertSettingsDataTypes(fetchedSettings);
          console.log('Converted settings:', convertedSettings);
          setSettings(convertedSettings);
        } else {
          // If settings don't exist, use defaults
          console.warn('Settings not found, using defaults');
          setSettings(defaultSettings);
        }
        
        // Check if it's a new day for opening cash popup
        const lastLoginDate = localStorage.getItem('pos-last-login-date');
        const today = getDubaiTime().toDateString();
        
        if (!lastLoginDate || lastLoginDate !== today) {
          setShowOpeningCashPopup(true);
          // Update the last login date to today
          localStorage.setItem('pos-last-login-date', today);
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

  const addToCart = (product: Product, service: 'iron' | 'washAndIron' | 'dryClean', quantity: number = 1) => {
    // Ensure product has correct data types before adding to cart
    const convertedProduct = convertProductDataTypes(product);
    
    // Get the price based on the selected service
    let price = 0;
    switch (service) {
      case 'iron':
        price = convertedProduct.ironRate;
        break;
      case 'washAndIron':
        price = convertedProduct.washAndIronRate;
        break;
      case 'dryClean':
        price = convertedProduct.dryCleanRate;
        break;
    }
    
    setCart(prev => {
      const existingItem = prev.find(item => 
        item.product.id === convertedProduct.id && item.service === service
      );
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        // Recalculate subtotal with the correct price
        const newSubtotal = newQuantity * price;
        return prev.map(item =>
          item.product.id === convertedProduct.id && item.service === service
            ? {
                ...item,
                product: convertedProduct,
                quantity: newQuantity,
                subtotal: newSubtotal
              }
            : item
        );
      }

      return [...prev, {
        id: `cart-${Date.now()}-${convertedProduct.id}-${service}`,
        product: convertedProduct,
        quantity,
        discount: 0,
        subtotal: quantity * price, // Calculate subtotal correctly
        service
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

    setCart(prev => prev.map(item => {
      if (item.id === cartItemId) {
        // Get the price based on the item's service
        let price = 0;
        switch (item.service) {
          case 'iron':
            price = item.product.ironRate;
            break;
          case 'washAndIron':
            price = item.product.washAndIronRate;
            break;
          case 'dryClean':
            price = item.product.dryCleanRate;
            break;
        }
        
        // Recalculate subtotal with the correct price and apply any discount
        const subtotalWithoutDiscount = quantity * price;
        const discountMultiplier = (100 - item.discount) / 100;
        const subtotal = subtotalWithoutDiscount * discountMultiplier;
        
        return {
          ...item,
          quantity,
          subtotal: subtotal
        };
      }
      return item;
    }));
  };

  const updateCartItemDiscount = (cartItemId: string, discount: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === cartItemId) {
        // Get the price based on the item's service
        let price = 0;
        switch (item.service) {
          case 'iron':
            price = item.product.ironRate;
            break;
          case 'washAndIron':
            price = item.product.washAndIronRate;
            break;
          case 'dryClean':
            price = item.product.dryCleanRate;
            break;
        }
        
        // Calculate subtotal with discount applied
        const subtotalWithoutDiscount = item.quantity * price;
        const discountMultiplier = (100 - discount) / 100;
        const subtotal = subtotalWithoutDiscount * discountMultiplier;
        
        return {
          ...item,
          discount,
          subtotal: subtotal
        };
      }
      return item;
    }));
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
      
      // Prepare order data, ensuring all fields are properly set to null instead of undefined
      const newOrderData: any = {
        customer_id: customer.id,
        subtotal,
        discount,
        tax,
        total,
        payment_method: paymentMethod,
        cash_amount: cashAmount !== undefined ? cashAmount : null, // Explicitly set to null if undefined
        card_amount: cardAmount !== undefined ? cardAmount : null, // Explicitly set to null if undefined
        status: 'completed',
        delivery_status: null, // Explicitly set to null instead of undefined
        payment_status: null, // Explicitly set to null instead of undefined
        items: cart.map(item => ({
          id: `item-${Date.now()}-${item.id}`,
          product_id: item.product.id,
          quantity: item.quantity,
          discount: item.discount,
          subtotal: item.subtotal,
          service: item.service
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
      
      // Clear cart immediately without waiting for orders reload
      clearCart();
      
      // Reload orders in background without blocking the UI
      reloadOrders().catch(err => {
        console.error('Failed to reload orders in background:', err);
      });
      
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
      setOrders(prevOrders => {
        // Only update if there are actual changes
        if (JSON.stringify(prevOrders) !== JSON.stringify(convertedOrders)) {
          return convertedOrders;
        }
        return prevOrders;
      });
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
      product.barcode.toLowerCase().includes(lowercaseQuery) || // Add barcode search
      product.id.includes(query) // Direct ID match for barcode scanning
    );
  };

  const setOpeningCashAmount = (amount: number) => {
    setOpeningCash(amount);
    setShowOpeningCashPopup(false);
    // Save opening cash to localStorage
    localStorage.setItem('pos-opening-cash', amount.toString());
  };

  const getTodayOrders = (orderList: Order[] = orders) => {
    const today = getDubaiTime();
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
      // Ensure all rate values are proper numbers before sending
      const productWithCorrectTypes = {
        ...product,
        ironRate: typeof product.ironRate === 'string' ? parseFloat(product.ironRate) : product.ironRate,
        washAndIronRate: typeof product.washAndIronRate === 'string' ? parseFloat(product.washAndIronRate) : product.washAndIronRate,
        dryCleanRate: typeof product.dryCleanRate === 'string' ? parseFloat(product.dryCleanRate) : product.dryCleanRate
      };
      
      // Validate that all required fields are present
      if (!productWithCorrectTypes.name || !productWithCorrectTypes.category || !productWithCorrectTypes.barcode) {
        throw new Error('Missing required product fields: name, category, and barcode are required');
      }
      
      // Validate that rates are valid numbers
      if (isNaN(productWithCorrectTypes.ironRate) || 
          isNaN(productWithCorrectTypes.washAndIronRate) || 
          isNaN(productWithCorrectTypes.dryCleanRate)) {
        throw new Error('Invalid rate values: all rates must be valid numbers');
      }
      
      console.log('Sending product to API:', productWithCorrectTypes);
      const newProduct = await productsApi.create(productWithCorrectTypes);
      
      // Convert data types for the returned product with error handling
      const convertedProduct = convertProductDataTypes(newProduct);
      setProducts(prev => [...prev, convertedProduct]);
      return convertedProduct;
    } catch (err: any) {
      console.error('Failed to add product:', err);
      setError('Failed to add product: ' + (err.message || 'Unknown error'));
      
      // Re-throw the error with more details for the UI to handle
      const errorObj = {
        message: err.message || 'Failed to add product',
        details: err.details || '',
        hint: err.hint || ''
      };
      throw errorObj;
    }
  };

  const editProduct = async (updatedProduct: Product) => {
    try {
      // Convert rates to proper types before sending to API
      const productWithCorrectTypes = {
        ...updatedProduct,
        ironRate: typeof updatedProduct.ironRate === 'string' ? parseFloat(updatedProduct.ironRate) : updatedProduct.ironRate,
        washAndIronRate: typeof updatedProduct.washAndIronRate === 'string' ? parseFloat(updatedProduct.washAndIronRate) : updatedProduct.washAndIronRate,
        dryCleanRate: typeof updatedProduct.dryCleanRate === 'string' ? parseFloat(updatedProduct.dryCleanRate) : updatedProduct.dryCleanRate
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
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError('Failed to remove product: ' + errorMessage);
      
      // Provide more specific guidance for common deletion issues
      if (errorMessage.includes('referenced in existing')) {
        alert('Cannot delete this product because it is referenced in existing orders or returns. To remove this product, you would need to first delete all related orders and returns.');
      }
      
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
      console.log('Processing return for order:', orderId, 'Items:', items, 'Reason:', reason);
      
      // Validate that the order ID exists in our orders list
      const orderExists = orders.some(order => order.id === orderId);
      if (!orderExists) {
        console.error('Order ID does not exist:', orderId);
        setError(`Invalid order ID: ${orderId}. Please refresh the page and try again.`);
        return null;
      }
      
      // Validate items
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const product = item.product || (item.item && item.item.product);
        
        if (!product) {
          console.error('Missing product in item at index:', i, item);
          setError(`Missing product information in item ${i + 1}. Please refresh the page and try again.`);
          return null;
        }
        
        // Check if we can identify the product
        let productId = product.id;
        if (!productId && product.barcode) {
          // Try to find the product in our products list by barcode
          const matchingProduct = products.find(p => p.barcode === product.barcode);
          if (matchingProduct) {
            productId = matchingProduct.id;
          }
        }
        
        // If we still can't identify the product, try to find it by name as a last resort
        if (!productId && product.name) {
          // Try to find the product in our products list by name
          const matchingProduct = products.find(p => p.name === product.name);
          if (matchingProduct) {
            productId = matchingProduct.id;
            console.warn('Product identified by name instead of ID/barcode:', product.name);
          }
        }
        
        if (!productId) {
          // If we still can't identify the product, create a temporary ID for processing
          // This allows the return to be processed while logging the issue
          productId = `temp-${Date.now()}-${i}`;
          console.warn('Could not identify product, using temporary ID:', productId, 'Product:', product);
        }
      }
      
      // Calculate total refund amount using service-specific rates
      const refundAmount = items.reduce((total, item) => {
        // Handle both data structures: with 'item' property or direct properties
        const quantity = item.quantity || (item.item && item.item.quantity) || 0;
        // Get the service from the item or default to 'iron'
        const service = item.service || (item.item && item.item.service) || 'iron';
        // Get the correct rate based on service
        let price = 0;
        const product = item.product || (item.item && item.item.product);
        if (product) {
          switch (service) {
            case 'iron':
              price = (typeof product.ironRate === 'string' ? parseFloat(product.ironRate) : product.ironRate) || 0;
              break;
            case 'washAndIron':
              price = (typeof product.washAndIronRate === 'string' ? parseFloat(product.washAndIronRate) : product.washAndIronRate) || 0;
              break;
            case 'dryClean':
              price = (typeof product.dryCleanRate === 'string' ? parseFloat(product.dryCleanRate) : product.dryCleanRate) || 0;
              break;
          }
        }
        const discount = item.discount || (item.item && item.item.discount) || 0;
        const refund = quantity * price * (1 - discount / 100);
        console.log('Item refund calculation:', { quantity, price, discount, refund });
        return total + refund;
      }, 0);
      
      console.log('Total refund amount calculated:', refundAmount);
      
      // Prepare return data
      const returnData = {
        order_id: orderId,
        reason,
        refund_amount: refundAmount,
        items: items.map(item => {
          // Handle both data structures: with 'item' property or direct properties
          const product = item.product || (item.item && item.item.product);
          const quantity = item.quantity || (item.item && item.item.quantity) || 0;
          // Get the service from the item or default to 'iron'
          const service = item.service || (item.item && item.item.service) || 'iron';
          // Get the correct rate based on service
          let price = 0;
          if (product) {
            switch (service) {
              case 'iron':
                price = (typeof product.ironRate === 'string' ? parseFloat(product.ironRate) : product.ironRate) || 0;
                break;
              case 'washAndIron':
                price = (typeof product.washAndIronRate === 'string' ? parseFloat(product.washAndIronRate) : product.washAndIronRate) || 0;
                break;
              case 'dryClean':
                price = (typeof product.dryCleanRate === 'string' ? parseFloat(product.dryCleanRate) : product.dryCleanRate) || 0;
                break;
            }
          }
          const discount = item.discount || (item.item && item.item.discount) || 0;
          const refund = quantity * price * (1 - discount / 100);
          
          console.log('Mapping item for return:', { product, quantity, price, discount, refund });
          
          // Validate that product exists
          if (!product) {
            throw new Error('Product is missing for return item');
          }
          
          // Use the actual product ID, with fallbacks
          let productId = product.id;
          
          // If we don't have a product ID, try to find it in our products list
          if (!productId && product.barcode) {
            // Try to find the product in our products list by barcode
            const matchingProduct = products.find(p => p.barcode === product.barcode);
            if (matchingProduct) {
              productId = matchingProduct.id;
            }
          }
          
          // If we still can't identify the product, try to find it by name as a last resort
          if (!productId && product.name && product.name !== 'Unknown Product') {
            // Try to find the product in our products list by name
            const matchingProduct = products.find(p => p.name === product.name);
            if (matchingProduct) {
              productId = matchingProduct.id;
              console.warn('Product identified by name instead of ID/barcode:', product.name);
            }
          }
          
          // If we still can't identify the product, we can't process the return
          if (!productId) {
            throw new Error(`Could not identify product: ${product.name || product.barcode || 'Unknown Product'}. Product ID is required for return processing.`);
          }
          
          // Validate data types
          if (typeof quantity !== 'number' || quantity <= 0) {
            throw new Error(`Invalid quantity for product ${product.name || product.barcode}: ${quantity}`);
          }
          
          if (typeof refund !== 'number' || refund < 0) {
            throw new Error(`Invalid refund amount for product ${product.name || product.barcode}: ${refund}`);
          }
          
          return {
            product_id: productId,
            quantity: quantity,
            refund_amount: refund
          };
        })
      };
      
      // Validate the return data before sending
      if (!returnData.order_id) {
        throw new Error('Order ID is missing');
      }
      
      if (!Array.isArray(returnData.items) || returnData.items.length === 0) {
        throw new Error('No items to return');
      }
      
      if (typeof returnData.refund_amount !== 'number' || returnData.refund_amount < 0) {
        throw new Error('Invalid refund amount');
      }
      
      console.log('Return data prepared:', returnData);
      
      // Send to API
      console.log('Sending return data to API');
      const createdReturn = await returnsApi.create(returnData);
      console.log('Return created via API:', createdReturn);
      
      // Update the order status to "returned" to indicate it has been returned
      try {
        const updatedOrder = await ordersApi.update(orderId, { status: 'returned' });
        console.log('Order status updated:', updatedOrder);
        
        // Update local orders state
        setOrders(prev => prev.map(order => 
          order.id === orderId ? convertOrderDataTypes(updatedOrder) : order
        ));
      } catch (orderError) {
        console.error('Error updating order status:', orderError);
      }
      
      // Reload orders to ensure we have the latest data
      await reloadOrders();
      
      // Fetch updated returns list from backend instead of just adding to local state
      await fetchReturns();
      
      return createdReturn;
    } catch (err) {
      console.error('Failed to process return:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError('Failed to process return: ' + errorMessage);
      
      // Show a more user-friendly error message
      if (errorMessage.includes('Failed to process return')) {
        // This is an error from our own error handling, show it as is
        alert(errorMessage);
      } else {
        // This is an unexpected error, show a generic message
        alert('Failed to process return. Please check the console for more details and try again.');
      }
      
      return null;
    }
  };

  // Add function to fetch returns from backend with date filtering
  const fetchReturns = async (fromDate?: string, toDate?: string) => {
    try {
      const fetchedReturns = await returnsApi.getAll(fromDate, toDate);
      setReturns(fetchedReturns);
      return fetchedReturns;
    } catch (err) {
      console.error('Failed to fetch returns:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError('Failed to fetch returns: ' + errorMessage);
      
      // Provide more specific guidance for schema cache issues
      if (errorMessage.includes('schema mismatch') || errorMessage.includes('sku')) {
        alert('Database schema mismatch detected. Please restart your Supabase project or wait for the schema cache to refresh automatically.');
      }
      
      return [];
    }
  };

  // Add function to clear all returns from backend
  const clearReturns = async () => {
    try {
      const result = await returnsApi.clearAll();
      console.log('Returns cleared:', result);
      // Refresh returns data
      await fetchReturns();
      return result;
    } catch (err) {
      console.error('Failed to clear returns:', err);
      setError('Failed to clear returns: ' + (err as Error).message);
      return null;
    }
  };

  // Add function to refresh all data
  const refreshData = async () => {
    try {
      await reloadOrders();
      await fetchReturns();
    } catch (err) {
      console.error('Failed to refresh data:', err);
      setError('Failed to refresh data: ' + (err as Error).message);
    }
  };

  // Fetch returns when the hook is initialized
  useEffect(() => {
    // Load returns in background without blocking the main loading process
    fetchReturns().catch(err => {
      console.error('Failed to fetch returns in background:', err);
    });
  }, []); // Only run once on mount

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
    fetchReturns, // Export the fetchReturns function
    clearReturns, // Export the clearReturns function
    refreshData, // Export the refreshData function
    reloadOrders, // Export the reloadOrders function

    // Dashboard data
    getTodayOrders,
    getTodaySales,
    getTodayCustomers,
    getTodayProducts,
    getClosingBalance
  };
}
