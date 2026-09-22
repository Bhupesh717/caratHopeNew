import { adminApiClient } from '@/lib/api-client';
import { AdminShippingMethod } from '../_types';

export const shippingMethodService = {
  create: async (payload: Partial<AdminShippingMethod>): Promise<AdminShippingMethod> => {
    const response = await adminApiClient.post('/admin/shipping-methods', payload);
    return response.data.data;
  },
};
