import axios from 'axios';
import { toast } from 'sonner';
import { useUiStore } from '@/store/ui';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Helper to extract clean error messages from Laravel backend API responses
const getBackendErrorMessage = (error: any): string => {
  const data = error.response?.data;
  let msg = data?.message || data?.error || error.message || 'An error occurred';
  if (data?.errors) {
    const errKeys = Object.keys(data.errors);
    if (errKeys.length > 0) {
      msg = errKeys.map((k: string) => data.errors[k][0]).join(' ');
    }
  }
  return msg;
};


// Public API Client
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject Customer Sanctum token dynamically from Zustand persisted localStorage
apiClient.interceptors.request.use(
  (config) => {
    useUiStore.getState().startLoading();
    if (typeof window !== 'undefined') {
      try {
        const storedAuth = localStorage.getItem('caratehope-auth');
        if (storedAuth) {
          const parsed = JSON.parse(storedAuth);
          const token = parsed?.state?.customerToken;
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
      } catch (error) {
        console.error('Error fetching customer auth token for API request interceptor:', error);
      }


    }
    return config;
  },
  (error) => {
    useUiStore.getState().stopLoading();
    return Promise.reject(error);
  }
);

// Interceptor to handle customer response mapping & global 401 Unauthorized redirect & dynamic toasts
apiClient.interceptors.response.use(
  (response) => {
    useUiStore.getState().stopLoading();
    // If successful and has a backend message, show it (except for GET requests)
    if (response.config.method?.toLowerCase() !== 'get') {
      if (response.data && response.data.success && response.data.message) {
        toast.success(response.data.message);
      }
    }
    return response;
  },
  (error) => {
    useUiStore.getState().stopLoading();
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        try {
          // Clear stale customer authentication state
          localStorage.removeItem('caratehope-auth');
          // Redirect the user to the login page
          window.location.href = '/login';
        } catch (e) {
          console.error('Error handling customer global 401 authorization redirect:', e);
        }
      }
    } else {
      // Toast backend error message (unless 401 which redirects)
      const errorMsg = getBackendErrorMessage(error);
      toast.error(errorMsg);
    }
    return Promise.reject(error);
  }
);

// Admin API Client (Authenticated via Laravel Sanctum)
export const adminApiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject Sanctum token dynamically from Zustand persisted localStorage
adminApiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      try {
        const storedAuth = localStorage.getItem('caratehope-admin-auth');
        if (storedAuth) {
          const parsed = JSON.parse(storedAuth);
          const token = parsed?.state?.adminToken;
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
      } catch (error) {
        console.error('Error fetching admin auth token for API request interceptor:', error);
      }


    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle admin response mapping & global 401 Unauthorized redirect & dynamic toasts
adminApiClient.interceptors.response.use(
  (response) => {
    // If successful and has a backend message, show it (except for GET requests)
    if (response.config.method?.toLowerCase() !== 'get') {
      if (response.data && response.data.success && response.data.message) {
        toast.success(response.data.message);
      }
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        try {
          // Clear stale authentication state from localStorage
          localStorage.removeItem('caratehope-admin-auth');
          // Redirect the user to the admin login page
          window.location.href = '/admin/login';
        } catch (e) {
          console.error('Error handling global 401 authorization redirect:', e);
        }
      }
    } else {
      // Toast backend error message (unless 401 which redirects)
      const errorMsg = getBackendErrorMessage(error);
      toast.error(errorMsg);
    }
    return Promise.reject(error);
  }
);
