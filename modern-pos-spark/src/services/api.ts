// api.ts
// Determine API base URL based on environment
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // In browser environment
    if (window.location.hostname.includes('vercel.app')) {
      // For Vercel deployments, API is at the same domain
      return '';
    } else {
      // For local development
      return 'http://localhost:3001';
    }
  }
  // For server-side rendering, fallback to localhost
  return 'http://localhost:3001';
};

const API_BASE_URL = getApiBaseUrl();

// Helper function for API requests
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Ensure endpoint starts with /api
  const normalizedEndpoint = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
  const url = `${API_BASE_URL}${normalizedEndpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${url}:`, error);
    throw error;
  }
}

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
  delete: (id: string) => apiRequest<void>(`/products/${id}`, {
    method: 'DELETE',
  }),
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
  getAll: () => apiRequest<Order[]>('/orders'),
  getById: (id: string) => apiRequest<Order>(`/orders/${id}`),
  create: (order: Omit<Order, 'id'>) => apiRequest<Order>('/orders', {
    method: 'POST',
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

// Types (imported from pos.ts)
type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  sku: string;
  barcode: string;
  stock: number;
  description?: string;
};

type CartItem = {
  id: string;
  product: Product;
  quantity: number;
  discount: number;
  subtotal: number;
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
  status: 'completed' | 'pending' | 'cancelled';
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