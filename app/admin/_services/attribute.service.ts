import { adminApiClient } from '@/lib/api-client';
import { AdminAttribute, AdminAttributeValue } from '../_types';

export const attributeService = {
  // Attributes
  getAll: async (): Promise<AdminAttribute[]> => {
    const response = await adminApiClient.get('/admin/attributes');
    return response.data?.data || [];
  },

  getById: async (id: string): Promise<AdminAttribute | undefined> => {
    const response = await adminApiClient.get(`/admin/attributes/${id}`);
    return response.data?.data;
  },

  create: async (data: { name: string; slug: string; input_type: string; unit?: string | null; affects_price?: boolean }): Promise<AdminAttribute> => {
    const response = await adminApiClient.post('/admin/attributes', data);
    return response.data?.data;
  },

  update: async (id: string, data: { name: string; slug: string; input_type: string; unit?: string | null; affects_price?: boolean }): Promise<AdminAttribute> => {
    const response = await adminApiClient.put(`/admin/attributes/${id}`, data);
    return response.data?.data;
  },

  delete: async (id: string): Promise<void> => {
    await adminApiClient.delete(`/admin/attributes/${id}`);
  },

  // Attribute Values
  createValue: async (attributeId: string, data: { value: string; price_modifier?: number; sort_order?: number }): Promise<AdminAttributeValue> => {
    const response = await adminApiClient.post(`/admin/attributes/${attributeId}/values`, data);
    return response.data?.data;
  },

  deleteValue: async (valueId: string): Promise<void> => {
    await adminApiClient.delete(`/admin/attributes/values/${valueId}`);
  }
};
