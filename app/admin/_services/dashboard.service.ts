import { adminApiClient } from '@/lib/api-client';

export interface DashboardStats {
  activeProducts: number;
  activeCategories: number;
  totalOrders: number;
  totalUsers: number;
  activeCoupons: number;
  totalRevenue: number;
  monthlyRevenue: { month: string; revenue: number }[];
  orderStatusDistribution: { status: string; count: number }[];
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await adminApiClient.get('/admin/dashboard/stats');
    if (response.data && response.data.success) {
      return response.data.data;
    }
    throw new Error('Failed to fetch dashboard statistics.');
  },
};
