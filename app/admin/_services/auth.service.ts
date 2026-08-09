import { apiClient, adminApiClient } from '@/lib/api-client';

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/admin/login', { email, password });
      if (response.data && response.data.success) {
        const { token, user } = response.data.data;
        return { 
          success: true, 
          user: {
            id: String(user.id),
            name: user.name,
            email: user.email,
            role: user.role || 'admin',
            avatar: user.avatar || `https://i.pravatar.cc/150?u=${user.id}`,
          },
          token 
        };
      }
      return { success: false, error: response.data?.message || 'Invalid email or password' };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || 'Invalid email or password' };
    }
  },

  logout: async () => {
    try {
      await adminApiClient.post('/admin/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await adminApiClient.get('/admin/me');
      if (response.data && response.data.success) {
        const user = response.data.data;
        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role || 'admin',
          avatar: user.avatar || `https://i.pravatar.cc/150?u=${user.id}`,
        };
      }
      return null;
    } catch (error) {
      console.error('Fetch current admin user failed:', error);
      return null;
    }
  },
};
