import { adminApiClient } from '@/lib/api-client';
import { AdminProcessingProfile } from '../_types';

export const processingProfileService = {
  getAll: async (): Promise<AdminProcessingProfile[]> => {
    const response = await adminApiClient.get('/admin/processing-profiles');
    return response.data.data || [];
  },

  create: async (payload: Partial<AdminProcessingProfile>): Promise<AdminProcessingProfile> => {
    const response = await adminApiClient.post('/admin/processing-profiles', payload);
    return response.data.data;
  },

  update: async (id: string, payload: Partial<AdminProcessingProfile>): Promise<AdminProcessingProfile> => {
    const response = await adminApiClient.put(`/admin/processing-profiles/${id}`, payload);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await adminApiClient.delete(`/admin/processing-profiles/${id}`);
  }
};
