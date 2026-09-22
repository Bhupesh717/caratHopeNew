import { adminApiClient } from '@/lib/api-client';
import { AdminCategoryAttribute } from '../_types';

export const categoryAttributeService = {
  getByCategory: async (categoryId: string, params?: { can_be_variation?: boolean }): Promise<any[]> => {
    let url = `/categories/${categoryId}/attributes`;
    if (params?.can_be_variation) {
      url += `?can_be_variation=true`;
    }
    const response = await adminApiClient.get(url);
    const data = response.data?.data || [];
    
    // Map Laravel's nested relation with pivot to our interface, but keep all original fields
    return data.map((attr: any) => ({
      ...attr,
      id: attr.pivot?.id || attr.id, // Fallback to attribute ID if pivot ID is missing
      category_id: attr.pivot?.category_id || categoryId,
      attribute_id: attr.id,
      is_required: attr.pivot?.is_required === '1' || attr.pivot?.is_required === true || attr.pivot?.is_required === 1,
      attribute_name: attr.name,
      createdAt: attr.pivot?.created_at || attr.created_at,
    }));
  },

  create: async (data: { category_id: string; attribute_id: string; is_required: boolean }): Promise<AdminCategoryAttribute> => {
    const response = await adminApiClient.post('/admin/category-attributes', data);
    return response.data?.data;
  },

  delete: async (id: string): Promise<void> => {
    await adminApiClient.delete(`/admin/category-attributes/${id}`);
  }
};
