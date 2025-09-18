// returnsApi.ts
import { apiRequest } from './api';

// Return types
type ReturnItem = {
  product_id: string;
  quantity: number;
  refund_amount: number;
};

type Return = {
  id: string;
  order_id: string;
  reason?: string;
  refund_amount: number;
  created_at: string;
  items: ReturnItem[];
};

// Returns API
export const returnsApi = {
  create: async (returnData: Omit<Return, 'id' | 'created_at'>) => {
    console.log('Creating return with data:', returnData);
    try {
      // Validate the data before sending
      if (!returnData.order_id) {
        throw new Error('Order ID is required');
      }
      
      if (!Array.isArray(returnData.items) || returnData.items.length === 0) {
        throw new Error('At least one item is required for return');
      }
      
      for (let i = 0; i < returnData.items.length; i++) {
        const item = returnData.items[i];
        if (!item.product_id) {
          throw new Error(`Product ID is required for item ${i + 1}`);
        }
        if (typeof item.quantity !== 'number' || item.quantity <= 0) {
          throw new Error(`Valid quantity is required for item ${i + 1}`);
        }
        if (typeof item.refund_amount !== 'number' || item.refund_amount < 0) {
          throw new Error(`Valid refund amount is required for item ${i + 1}`);
        }
      }
      
      if (typeof returnData.refund_amount !== 'number' || returnData.refund_amount < 0) {
        throw new Error('Valid refund amount is required');
      }
      
      const result = await apiRequest<Return>('/returns', {
        method: 'POST',
        body: JSON.stringify(returnData),
      });
      console.log('Return created successfully:', result);
      return result;
    } catch (error) {
      console.error('Failed to create return:', error);
      throw new Error(`Failed to process return: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
  getAll: (fromDate?: string, toDate?: string) => {
    console.log('Fetching all returns with date filter:', { fromDate, toDate });
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (fromDate) queryParams.append('from_date', fromDate);
    if (toDate) queryParams.append('to_date', toDate);
    
    const url = queryParams.toString() ? `/returns?${queryParams.toString()}` : '/returns';
    console.log('Fetching returns from URL:', url);
    
    return apiRequest<Return[]>(url);
  },
  clearAll: () => {
    console.log('Clearing all returns');
    return apiRequest<{ message: string }>('/returns/clear', {
      method: 'DELETE',
    });
  },
};