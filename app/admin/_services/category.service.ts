import { adminApiClient } from '@/lib/api-client';
import { AdminCategory } from '../_types';

const mapCategory = (c: any): AdminCategory => ({
  id: String(c.id),
  image: c.image || '',
  name: c.name,
  slug: c.slug,
  description: c.description || '',
  parentId: c.parent_id ? String(c.parent_id) : null,
  status: c.status,
  createdAt: c.created_at,
});

export const categoryService = {
  getAll: async (): Promise<AdminCategory[]> => {
    const response = await adminApiClient.get('/admin/categories');
    return (response.data.data || []).map(mapCategory);
  },

  getById: async (id: string): Promise<AdminCategory | undefined> => {
    const response = await adminApiClient.get(`/admin/categories/${id}`);
    if (response.data && response.data.success) {
      return mapCategory(response.data.data);
    }
    return undefined;
  },

  create: async (data: Omit<AdminCategory, 'id' | 'createdAt'>): Promise<AdminCategory> => {
    const payload = {
      name: data.name,
      image: data.image,
      description: data.description,
      parent_id: data.parentId ? Number(data.parentId) : null,
      status: data.status,
    };
    const response = await adminApiClient.post('/admin/categories', payload);
    return mapCategory(response.data.data);
  },

  update: async (id: string, data: Partial<AdminCategory>): Promise<AdminCategory> => {
    const payload = {
      name: data.name,
      image: data.image,
      description: data.description,
      parent_id: data.parentId !== undefined ? (data.parentId ? Number(data.parentId) : null) : undefined,
      status: data.status,
    };
    const response = await adminApiClient.put(`/admin/categories/${id}`, payload);
    return mapCategory(response.data.data);
  },

  delete: async (id: string): Promise<void> => {
    await adminApiClient.delete(`/admin/categories/${id}`);
  },

  toggleStatus: async (id: string): Promise<AdminCategory> => {
    const response = await adminApiClient.patch(`/admin/categories/${id}/toggle-status`);
    return mapCategory(response.data.data);
  },
};
