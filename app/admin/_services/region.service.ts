import { adminApiClient } from '@/lib/api-client';
import { AdminRegion } from '../_types';

export const regionService = {
  getAll: async (): Promise<AdminRegion[]> => {
    const response = await adminApiClient.get('/admin/regions');
    return response.data.data || [];
  },
  
  create: async (payload: Partial<AdminRegion>): Promise<AdminRegion> => {
    const response = await adminApiClient.post('/admin/regions', payload);
    return response.data.data;
  },

  update: async (id: string, payload: Partial<AdminRegion>): Promise<AdminRegion> => {
    const response = await adminApiClient.put(`/admin/regions/${id}`, payload);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await adminApiClient.delete(`/admin/regions/${id}`);
  }
};
