import { adminApiClient } from '@/lib/api-client';

export interface Review {
  id: string;
  product: { id: string; name: string };
  user: { id: string; name: string };
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export const reviewService = {
  async getAll(): Promise<Review[]> {
    const res = await adminApiClient.get('/admin/reviews');
    return res.data?.data || [];
  },

  async updateStatus(id: string, status: 'pending' | 'approved' | 'rejected'): Promise<void> {
    await adminApiClient.patch(`/admin/reviews/${id}/status`, { status });
  },

  async delete(id: string): Promise<void> {
    await adminApiClient.delete(`/admin/reviews/${id}`);
  },
};
