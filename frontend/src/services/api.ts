// api.ts
// Determine API base URL based on environment variables or default behavior
const getApiBaseUrl = () => {
  // Check for environment variable first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // For Vercel deployments, API is at the same domain
  if (typeof window !== 'undefined') {
    // In browser environment
    if (window.location.hostname.includes('vercel.app')) {
      // For Vercel deployments, API is at the same domain
      // But we need to allow cross-domain requests for separate deployments
      // Return the specific backend URL for Vercel deployments
      return 'https://pos-laundry-backend.vercel.app';
    } else {
      // For local development - changed from port 3000 to 3004
      return 'http://localhost:3004';
    }
  }
  // For server-side rendering, fallback to localhost
  return 'http://localhost:3004';
};

const API_BASE_URL = getApiBaseUrl();
console.log('API base URL:', API_BASE_URL);

// Helper function for API requests
export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Ensure endpoint starts with /api
  const normalizedEndpoint = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
  const url = `${API_BASE_URL}${normalizedEndpoint}`;
  
  console.log(`Making API request to: ${url}`, options);
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    // Add timeout to prevent hanging requests
    signal: AbortSignal.timeout(10000), // 10 second timeout
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    console.log(`API response from ${url}:`, response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error from ${url}:`, errorText);
      
      // Try to parse the error as JSON
      try {
        const errorJson = JSON.parse(errorText);
        // Create a more detailed error object
        const errorObj: any = new Error(errorJson.error || errorJson.message || `HTTP error! status: ${response.status}`);
        errorObj.details = errorJson.details || '';
        errorObj.hint = errorJson.hint || '';
        errorObj.status = response.status;
        throw errorObj;
      } catch (parseError) {
        // If parsing fails, use the raw error text
        const errorObj: any = new Error(errorText || `HTTP error! status: ${response.status}`);
        errorObj.status = response.status;
        throw errorObj;
      }
    }
    
    const result = await response.json();
    console.log(`API success from ${url}:`, result);
    return result;
  } catch (error: any) {
    console.error(`API request failed for ${url}:`, error);
    // Provide a more user-friendly error message
    if (error.name === 'AbortError') {
      throw new Error('Request timeout. Please try again.');
    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    throw error;
  }
}

// Updated Product type to match our new structure
type Product = {
  id: string;
  name: string;
  // Remove single price field and replace with service rates
  ironRate: number;
  washAndIronRate: number;
  dryCleanRate: number;
  category: string;
  barcode: string;
  description?: string;
};

type CartItem = {
  id: string;
  product: Product;
  quantity: number;
  discount: number;
  subtotal: number;
  // Add service type to cart item
  service: 'iron' | 'washAndIron' | 'dryClean';
};

type Customer = {
  id: string;
  name: string;
  code?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  place?: string;
  emirate?: string;
};

type Order = {
  id: string;
  items: CartItem[];
  customer: Customer;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'credit' | 'both' | 'cod';
  cashAmount?: number; // Add cash amount for split payments
  cardAmount?: number; // Add card amount for split payments
  status: 'completed' | 'pending' | 'cancelled' | 'returned';
  deliveryStatus?: 'pending' | 'in-transit' | 'delivered';
  paymentStatus?: 'paid' | 'unpaid';
  createdAt: Date;
  updatedAt: Date;
};

type POSSettings = {
  taxRate: number;
  currency: string;
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  barcodeScannerEnabled: boolean;
};

// Products API
export const productsApi = {
  getAll: () => apiRequest<Product[]>('/products'),
  getById: (id: string) => apiRequest<Product>(`/products/${id}`),
  create: (product: Omit<Product, 'id'>) => apiRequest<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(product),
  }),
  update: (id: string, product: Partial<Product>) => apiRequest<Product>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  }),
  delete: async (id: string) => {
    try {
      return await apiRequest(`/products/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('API error deleting product:', error);
      // Re-throw with more context
      throw new Error(`Failed to delete product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

// Customers API
export const customersApi = {
  getAll: () => apiRequest<Customer[]>('/customers'),
  getById: (id: string) => apiRequest<Customer>(`/customers/${id}`),
  create: (customer: Omit<Customer, 'id'>) => apiRequest<Customer>('/customers', {
    method: 'POST',
    body: JSON.stringify(customer),
  }),
};

// Orders API
export const ordersApi = {
  getAll: async () => {
    const orders = await apiRequest<Order[]>('/orders');
    console.log('=== ORDERS API RESPONSE ===');
    console.log('Raw orders data:', orders);
    console.log('Orders count:', orders.length);
    
    // Log first order details if available
    if (orders.length > 0) {
      console.log('First order:', orders[0]);
      console.log('First order JSON:', JSON.stringify(orders[0], null, 2));
      
      // Log first item details if available
      if (orders[0].items && orders[0].items.length > 0) {
        console.log('First item:', orders[0].items[0]);
        console.log('First item JSON:', JSON.stringify(orders[0].items[0], null, 2));
        console.log('First item product:', orders[0].items[0].product);
        console.log('First item product name:', orders[0].items[0].product?.name);
      }
    }
    
    return orders;
  },
  getById: (id: string) => apiRequest<Order>(`/orders/${id}`),
  create: (order: Omit<Order, 'id'>) => apiRequest<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify(order),
  }),
  update: (id: string, order: Partial<Order>) => apiRequest<Order>(`/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(order),
  }),
};

// Settings API
export const settingsApi = {
  get: () => apiRequest<any>('/settings').then(data => ({
    tax_rate: data.tax_rate || data.taxRate,
    currency: data.currency,
    business_name: data.business_name || data.businessName,
    business_address: data.business_address || data.businessAddress,
    business_phone: data.business_phone || data.businessPhone,
    barcode_scanner_enabled: data.barcode_scanner_enabled !== undefined ? data.barcode_scanner_enabled : data.barcodeScannerEnabled
  })),
  update: (settings: Partial<POSSettings>) => apiRequest<any>('/settings', {
    method: 'PUT',
    body: JSON.stringify({
      tax_rate: settings.taxRate,
      currency: settings.currency,
      business_name: settings.businessName,
      business_address: settings.businessAddress,
      business_phone: settings.businessPhone,
      barcode_scanner_enabled: settings.barcodeScannerEnabled
    }),
  }).then(data => ({
    tax_rate: data.tax_rate || data.taxRate,
    currency: data.currency,
    business_name: data.business_name || data.businessName,
    business_address: data.business_address || data.businessAddress,
    business_phone: data.business_phone || data.businessPhone,
    barcode_scanner_enabled: data.barcode_scanner_enabled !== undefined ? data.barcode_scanner_enabled : data.barcodeScannerEnabled
  })),
};