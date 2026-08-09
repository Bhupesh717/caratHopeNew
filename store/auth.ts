import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/lib/api-client';

export interface User {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  phone?: string;
  permanentAddress?: string;
  shippingAddress?: string;
  isGuest?: boolean;
}

interface AuthState {
  user: User | null;
  customerToken: string | null;
  isAuthenticated: boolean;
  loginSendOtp: (identifier: string, type: 'email' | 'phone') => Promise<void>;
  loginVerifyOtp: (identifier: string, type: 'email' | 'phone', otp: string) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  register: (data: {
    name: string;
    phone: string;
    password: string;
    email?: string;
    shipping_address?: string;
    permanent_address?: string;
  }) => Promise<any>;
  verifyRegisterEmail: (email: string, otp: string) => Promise<void>;
  resendRegisterOtp: (email: string) => Promise<void>;
  sendOtp: (email: string) => Promise<string>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: {
    name: string;
    email?: string;
    phone?: string;
    permanentAddress?: string;
    shippingAddress?: string;
  }) => Promise<void>;
  fetchProfile: () => Promise<void>;
}

const mapUser = (u: any): User => ({
  id: String(u.id),
  name: u.name,
  email: u.email || '',
  joinDate: u.created_at || new Date().toISOString(),
  phone: u.phone,
  permanentAddress: u.permanent_address || '',
  shippingAddress: u.shipping_address || '',
  isGuest: Boolean(u.is_guest),
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      customerToken: null,
      isAuthenticated: false,

      googleLogin: async (credential) => {
        try {
          const response = await apiClient.post('/public/login/google', { token: credential });

          if (response.data && response.data.success) {
            const { token, user } = response.data.data;
            set({
              user: mapUser(user),
              customerToken: token,
              isAuthenticated: true,
            });
          } else {
            throw new Error(response.data?.message || 'Google login failed');
          }
        } catch (error: any) {
          throw new Error(error.response?.data?.message || error.message || 'Google login failed');
        }
      },

      loginSendOtp: async (identifier, type) => {
        try {
          const payload = type === 'email' ? { email: identifier, type } : { phone: identifier, type };
          const response = await apiClient.post('/public/login/send-otp', payload);
          if (response.data && response.data.success === false) {
            throw new Error(response.data?.message || 'Failed to send OTP');
          }
        } catch (error: any) {
          throw new Error(error.response?.data?.message || error.message || 'Failed to send OTP');
        }
      },

      loginVerifyOtp: async (identifier, type, otp) => {
        try {
          const payload = type === 'email' ? { email: identifier, type, otp } : { phone: identifier, type, otp };
          const response = await apiClient.post('/public/login/verify-otp', payload);

          if (response.data && response.data.success) {
            const { token, user } = response.data.data;
            set({
              user: mapUser(user),
              customerToken: token,
              isAuthenticated: true,
            });
          } else {
            throw new Error(response.data?.message || 'Invalid OTP');
          }
        } catch (error: any) {
          throw new Error(error.response?.data?.message || error.message || 'Invalid OTP');
        }
      },

      register: async (data) => {
        try {
          const response = await apiClient.post('/public/register', data);

          if (response.data && response.data.success) {
            return response.data;
          } else {
            throw new Error(response.data?.message || 'Registration failed');
          }
        } catch (error: any) {
          throw new Error(error.response?.data?.message || error.message || 'Registration failed');
        }
      },

      verifyRegisterEmail: async (email, otp) => {
        try {
          const response = await apiClient.post('/public/register/verify-email', { email, otp });
          
          if (response.data && response.data.success) {
            const { token, user } = response.data.data;
            set({
              user: mapUser(user),
              customerToken: token,
              isAuthenticated: true,
            });
          } else {
            throw new Error(response.data?.message || 'Invalid OTP');
          }
        } catch (error: any) {
          throw new Error(error.response?.data?.message || error.message || 'Invalid OTP');
        }
      },

      resendRegisterOtp: async (email) => {
        try {
          const response = await apiClient.post('/public/register/resend-otp', { email });
          if (response.data && response.data.success === false) {
            throw new Error(response.data?.message || 'Failed to resend OTP');
          }
        } catch (error: any) {
          throw new Error(error.response?.data?.message || error.message || 'Failed to resend OTP');
        }
      },

      sendOtp: async (email) => {
        try {
          const response = await apiClient.post('/public/guest/send-otp', { email });
          if (response.data && response.data.success) {
            return response.data.test_otp || 'OTP Sent';
          }
          throw new Error(response.data?.message || 'Failed to send OTP');
        } catch (error: any) {
          throw new Error(error.response?.data?.message || error.message || 'Failed to send OTP');
        }
      },

      verifyOtp: async (email, otp) => {
        try {
          const response = await apiClient.post('/public/guest/verify-otp', { email, otp });
          if (response.data && response.data.success) {
            const { token, user } = response.data.data;
            set({
              user: mapUser(user),
              customerToken: token,
              isAuthenticated: true,
            });
          } else {
            throw new Error(response.data?.message || 'Invalid OTP');
          }
        } catch (error: any) {
          throw new Error(error.response?.data?.message || error.message || 'Invalid OTP');
        }
      },

      logout: async () => {
        try {
          if (get().customerToken) {
            await apiClient.post('/public/logout');
          }
        } catch (error) {
          console.error('Customer logout API call failed:', error);
        } finally {
          set({ user: null, customerToken: null, isAuthenticated: false });
        }
      },

      updateProfile: async (data) => {
        try {
          const response = await apiClient.put('/public/profile', {
            name: data.name,
            email: data.email,
            shipping_address: data.shippingAddress,
            permanent_address: data.permanentAddress,
          });

          if (response.data && response.data.success) {
            const updatedUser = response.data.data;
            set({
              user: mapUser(updatedUser),
            });
          } else {
            throw new Error(response.data?.message || 'Failed to update profile');
          }
        } catch (error: any) {
          throw new Error(error.response?.data?.message || error.message || 'Failed to update profile');
        }
      },

      fetchProfile: async () => {
        try {
          if (!get().customerToken) return;
          const response = await apiClient.get('/public/profile');
          if (response.data && response.data.success) {
            set({
              user: mapUser(response.data.data),
              isAuthenticated: true,
            });
          }
        } catch (error) {
          console.error('Error fetching customer profile:', error);
          set({ user: null, customerToken: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'caratehope-auth',
    }
  )
);
