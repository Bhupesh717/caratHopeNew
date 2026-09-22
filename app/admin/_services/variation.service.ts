import { adminApiClient } from '@/lib/api-client';
import { AdminAttribute } from '../_types';

// We map variations to AdminAttribute to reuse existing type structures
export const variationService = {
  getAll: async (): Promise<AdminAttribute[]> => {
    try {
      // Endpoint to be implemented by backend
      const response = await adminApiClient.get('/admin/variations');
      return response.data?.data || [];
    } catch (error) {
      console.error("Failed to fetch variations", error);
      return [];
    }
  },
};
