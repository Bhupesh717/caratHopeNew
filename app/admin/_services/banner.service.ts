import { adminApiClient } from '@/lib/api-client';
import { Banner } from '../_types';

const mapBanner = (b: any): Banner => ({
  id: String(b.id),
  image: b.image,
  badge: b.badge || '',
  title: b.title,
  description: b.description || '',
  status: b.status,
  createdAt: b.created_at,
});

export const bannerService = {
  getAll: async (): Promise<Banner[]> => {
    const response = await adminApiClient.get('/admin/banners');
    return (response.data.data || []).map(mapBanner);
  },

  getById: async (id: string): Promise<Banner | undefined> => {
    const response = await adminApiClient.get(`/admin/banners/${id}`);
    if (response.data && response.data.success) {
      return mapBanner(response.data.data);
    }
    return undefined;
  },

  create: async (data: Omit<Banner, 'id' | 'createdAt'>): Promise<Banner> => {
    const response = await adminApiClient.post('/admin/banners', data);
    return mapBanner(response.data.data);
  },

  update: async (id: string, data: Partial<Banner>): Promise<Banner> => {
    const response = await adminApiClient.put(`/admin/banners/${id}`, data);
    return mapBanner(response.data.data);
  },

  delete: async (id: string): Promise<void> => {
    await adminApiClient.delete(`/admin/banners/${id}`);
  },

  toggleStatus: async (id: string): Promise<Banner> => {
    const response = await adminApiClient.patch(`/admin/banners/${id}/toggle-status`);
    return mapBanner(response.data.data);
  },
};
