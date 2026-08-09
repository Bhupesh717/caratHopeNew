import { adminApiClient } from '@/lib/api-client';
import { AppUser } from '../_types';

const mapUser = (u: any): AppUser => ({
  id: String(u.id),
  avatar: u.avatar || `https://i.pravatar.cc/150?u=${u.id}`,
  name: u.name,
  email: u.email,
  phone: u.phone || '',
  registrationDate: u.created_at || new Date().toISOString(),
  status: u.status,
  orderCount: Number(u.orderCount || 0),
  totalSpent: Number(u.totalSpent || 0),
});

export const userService = {
  getAll: async (): Promise<AppUser[]> => {
    const response = await adminApiClient.get('/admin/users');
    return (response.data.data || []).map(mapUser);
  },

  getById: async (id: string): Promise<AppUser | undefined> => {
    const list = await userService.getAll();
    return list.find((u) => u.id === id);
  },

  delete: async (id: string): Promise<void> => {
    await adminApiClient.delete(`/admin/users/${id}`);
  },

  toggleStatus: async (id: string): Promise<AppUser> => {
    await adminApiClient.patch(`/admin/users/${id}/toggle-status`);
    const list = await userService.getAll();
    return list.find((u) => u.id === id)!;
  },
};
