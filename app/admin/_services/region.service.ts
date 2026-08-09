import { adminApiClient } from '@/lib/api-client';

export interface Region {
  id: string;
  name: string;
  code?: string;
  currency_code: string;
  currency_symbol: string;
  tax_rate?: number;
  is_active?: boolean;
  is_default: boolean;
}

export const regionService = {
  getAll: async (): Promise<Region[]> => {
    const response = await adminApiClient.get('/admin/regions');
    return response.data.data || [];
  },
};
