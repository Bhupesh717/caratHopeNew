import { adminApiClient } from '@/lib/api-client';
import { Coupon } from '../_types';

const mapCoupon = (c: any): Coupon => ({
  id: String(c.id),
  code: c.code,
  discountType: c.discount_type,
  discountValue: Number(c.discount_value),
  expiryDate: c.expiry_date,
  usageLimit: Number(c.usage_limit),
  usageCount: Number(c.usage_count || 0),
  status: c.status,
  createdAt: c.created_at,
});

export const couponService = {
  getAll: async (): Promise<Coupon[]> => {
    const response = await adminApiClient.get('/admin/coupons');
    return (response.data.data || []).map(mapCoupon);
  },

  getById: async (id: string): Promise<Coupon | undefined> => {
    const response = await adminApiClient.get(`/admin/coupons/${id}`);
    if (response.data && response.data.success) {
      return mapCoupon(response.data.data);
    }
    return undefined;
  },

  create: async (data: Omit<Coupon, 'id' | 'createdAt' | 'usageCount'>): Promise<Coupon> => {
    const payload = {
      code: data.code,
      discount_type: data.discountType,
      discount_value: data.discountValue,
      expiry_date: data.expiryDate,
      usage_limit: data.usageLimit,
    };
    const response = await adminApiClient.post('/admin/coupons', payload);
    return mapCoupon(response.data.data);
  },

  update: async (id: string, data: Partial<Coupon>): Promise<Coupon> => {
    const payload = {
      code: data.code,
      discount_type: data.discountType,
      discount_value: data.discountValue,
      expiry_date: data.expiryDate,
      usage_limit: data.usageLimit,
    };
    const response = await adminApiClient.put(`/admin/coupons/${id}`, payload);
    return mapCoupon(response.data.data);
  },

  delete: async (id: string): Promise<void> => {
    await adminApiClient.delete(`/admin/coupons/${id}`);
  },

  toggleStatus: async (id: string): Promise<Coupon> => {
    const response = await adminApiClient.patch(`/admin/coupons/${id}/toggle-status`);
    return mapCoupon(response.data.data);
  },
};
