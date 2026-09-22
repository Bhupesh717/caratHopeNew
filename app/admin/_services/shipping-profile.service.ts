import { adminApiClient } from '@/lib/api-client';
import { AdminShippingProfile } from '../_types';

export const shippingProfileService = {
  getAll: async (): Promise<AdminShippingProfile[]> => {
    const response = await adminApiClient.get('/admin/shipping-profiles');
    return response.data.data || [];
  },

  getById: async (id: string): Promise<AdminShippingProfile> => {
    const response = await adminApiClient.get(`/admin/shipping-profiles/${id}`);
    return response.data.data;
  },

  create: async (payload: Partial<AdminShippingProfile>): Promise<AdminShippingProfile> => {
    const response = await adminApiClient.post('/admin/shipping-profiles', payload);
    return response.data.data;
  },

  update: async (id: string, payload: Partial<AdminShippingProfile>): Promise<AdminShippingProfile> => {
    const response = await adminApiClient.put(`/admin/shipping-profiles/${id}`, payload);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await adminApiClient.delete(`/admin/shipping-profiles/${id}`);
  }
};
