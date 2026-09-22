import { adminApiClient } from '@/lib/api-client';
import { AdminProductOptionGroup } from '../_types';

export const productOptionService = {
  getAll: async (key?: string): Promise<AdminProductOptionGroup[]> => {
    const params = key ? { key } : {};
    const response = await adminApiClient.get('/admin/product-options', { params });
    
    const responseData = response.data?.data || response.data;
    
    // Check direct array response
    if (Array.isArray(responseData)) {
      return responseData;
    }
    
    // Check object response (like the provided JSON)
    if (responseData && typeof responseData === 'object') {
      if (key && Array.isArray(responseData[key])) {
        return responseData[key];
      }
      
      // If no key is provided, extract all valid AdminProductOptionGroups
      let allGroups: AdminProductOptionGroup[] = [];
      for (const k in responseData) {
        const item = responseData[k];
        if (Array.isArray(item)) {
          // Check if it matches AdminProductOptionGroup shape
          if (item.length > 0 && item[0].group && Array.isArray(item[0].options)) {
            allGroups = [...allGroups, ...item];
          }
        }
      }
      return allGroups;
    }
    
    // Fallback
    return [];
  },
};
