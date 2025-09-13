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
  create: (returnData: Omit<Return, 'id' | 'created_at'>) => apiRequest<Return>('/returns', {
    method: 'POST',
    body: JSON.stringify(returnData),
  }),
  getAll: () => apiRequest<Return[]>('/returns'),
};