'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AdminUser } from '../_types';
import axios from 'axios';

interface AdminAuthState {
  adminUser: AdminUser | null;
  adminToken: string | null;
  isAdminAuthenticated: boolean;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  adminLogout: () => void;
  setAdminUser: (user: AdminUser) => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      adminUser: null,
      adminToken: null,
      isAdminAuthenticated: false,

      adminLogin: async (email, password) => {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
          const response = await axios.post(`${baseUrl}/admin/login`, {
            email,
            password,
          }, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            }
          });

          if (response.data && response.data.success) {
            const { token, user } = response.data.data;
            set({
              adminToken: token,
              adminUser: {
                id: String(user.id),
                name: user.name,
                email: user.email,
                role: user.role || 'admin',
                avatar: user.avatar || `https://i.pravatar.cc/150?u=${user.id}`,
              },
              isAdminAuthenticated: true,
            });
            return { success: true, message: response.data.message || 'Login successful' };
          }
          return { success: false, error: response.data?.message || 'Invalid credentials' };
        } catch (error: any) {
          console.error('Admin login error:', error);
          const errorMsg = error.response?.data?.message || 'Invalid email or password';
          return { success: false, error: errorMsg };
        }
      },

      adminLogout: () => {
        set({ adminUser: null, adminToken: null, isAdminAuthenticated: false });
      },

      setAdminUser: (user) => {
        set({ adminUser: user });
      },
    }),
    { name: 'caratehope-admin-auth' }
  )
);
