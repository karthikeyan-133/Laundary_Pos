export type Product = {
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

export type CartItem = {
  id: string;
  product: Product;
  quantity: number;
  discount: number;
  subtotal: number;
  // Add service type to cart item
  service: 'iron' | 'washAndIron' | 'dryClean';
};

export type Customer = {
  id: string;
  name: string;
  code?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  place?: string;
  emirate?: string;
};

export type Order = {
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
  deliveryStatus?: 'pending' | 'in-transit' | 'delivered'; // Add delivery status
  paymentStatus?: 'paid' | 'unpaid'; // Add payment status for COD orders
  createdAt: Date;
  updatedAt: Date;
};

export type POSSettings = {
  taxRate: number;
  currency: string;
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  barcodeScannerEnabled: boolean;
};

export type ProductManagementProps = {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onEditProduct: (product: Product) => void;
  onRemoveProduct: (productId: string) => void;
};

export type DashboardData = {
  todaySales: number;
  totalOrders: number;
  recentOrders: Order[];
  topProducts: Array<{
    product: Product;
    quantitySold: number;
    revenue: number;
  }>;
};

export type ReturnItem = {
  orderId: string;
  itemId: string;
  quantity: number;
  reason?: string;
};