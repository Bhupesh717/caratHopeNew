import { adminApiClient } from '@/lib/api-client';
import { AdminAttribute, AdminAttributeValue } from '../_types';

export const attributeService = {
  // Attributes
  getAll: async (params?: Record<string, any>): Promise<AdminAttribute[]> => {
    const response = await adminApiClient.get('/admin/attributes', { params });
    return response.data?.data || [];
  },

  getById: async (id: string): Promise<AdminAttribute | undefined> => {
    const response = await adminApiClient.get(`/admin/attributes/${id}`);
    return response.data?.data;
  },

  create: async (data: { name: string; slug: string; input_type: string; unit?: string | null; allowed_units?: string[]; affects_price?: boolean; can_be_variation?: boolean; is_global?: boolean; is_custom?: boolean; max_selections?: number }): Promise<AdminAttribute> => {
    const response = await adminApiClient.post('/admin/attributes', data);
    return response.data?.data;
  },

  update: async (id: string, data: { name: string; slug: string; input_type: string; unit?: string | null; allowed_units?: string[]; affects_price?: boolean; can_be_variation?: boolean; is_global?: boolean; is_custom?: boolean; max_selections?: number }): Promise<AdminAttribute> => {
    const response = await adminApiClient.put(`/admin/attributes/${id}`, data);
    return response.data?.data;
  },

  delete: async (id: string): Promise<void> => {
    await adminApiClient.delete(`/admin/attributes/${id}`);
  },

  // Attribute Values
  getValues: async (attributeId: string, params?: { search?: string; scale?: string; per_page?: number }): Promise<AdminAttributeValue[]> => {
    const response = await adminApiClient.get(`/admin/attributes/${attributeId}/values`, { params });
    return response.data?.data || [];
  },

  createValue: async (attributeId: string, data: { value: string; scale?: string; price_modifier?: number; sort_order?: number }): Promise<AdminAttributeValue> => {
    const response = await adminApiClient.post(`/admin/attributes/${attributeId}/values`, data);
    return response.data?.data;
  },

  deleteValue: async (valueId: string): Promise<void> => {
    await adminApiClient.delete(`/admin/attributes/values/${valueId}`);
  }
};
