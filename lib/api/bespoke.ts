import axios from 'axios';
import { 
  BespokeOrderRequestPayload, 
  BespokeConsultationRequestPayload,
  BespokeOrder,
  BespokeStatus
} from '@/types/bespoke';

// Use environment variable for base URL or default to localhost for development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const bespokeApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Helper to simulate network delay for mock endpoints
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const bespokeService = {
  /**
   * PUBLIC ROUTES
   */
  
  // Submit a new custom jewellery request
  submitCustomOrder: async (payload: BespokeOrderRequestPayload): Promise<{ data: BespokeOrder, message: string }> => {
    try {
      // For images, we would typically use FormData:
      // const formData = new FormData();
      // Object.keys(payload).forEach(key => formData.append(key, payload[key]));
      // return await bespokeApi.post('/public/custom-orders', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
      
      // MOCK IMPLEMENTATION
      await delay(1000);
      return {
        message: 'Order request submitted successfully.',
        data: {
          id: `ORD-${Math.floor(Math.random() * 10000)}`,
          customerId: 'CUST-1',
          customerName: payload.name,
          customerEmail: payload.email,
          customerPhone: payload.phone,
          jewelleryType: payload.jewelleryType,
          metalType: payload.metalType,
          budgetRange: payload.budgetRange,
          description: payload.description,
          inspirationImages: [], // Mocking empty for now
          status: 'Pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      };
    } catch (error) {
      console.error('Error submitting custom order:', error);
      throw error;
    }
  },

  // Get public order details (e.g. tracking link)
  getOrderDetails: async (id: string): Promise<{ data: BespokeOrder }> => {
    // return await bespokeApi.get(`/public/custom-orders/${id}`);
    
    // MOCK IMPLEMENTATION
    await delay(800);
    return {
      data: {
        id,
        customerId: 'CUST-1',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '1234567890',
        jewelleryType: 'Ring',
        metalType: '18K Gold',
        budgetRange: '$1000 - $3000',
        description: 'A beautiful engagement ring.',
        inspirationImages: [],
        status: 'Reviewing',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    };
  },

  // Book a consultation
  bookConsultation: async (payload: BespokeConsultationRequestPayload): Promise<{ message: string }> => {
    // return await bespokeApi.post('/public/consultations', payload);
    
    // MOCK IMPLEMENTATION
    await delay(1000);
    return { message: 'Consultation booked successfully.' };
  },

  /**
   * ADMIN ROUTES
   */
   
  // List all custom orders (Admin)
  getAdminOrders: async (params?: { status?: string, search?: string }): Promise<{ data: BespokeOrder[], meta: any }> => {
    // return await bespokeApi.get('/admin/custom-orders', { params });
    
    // MOCK IMPLEMENTATION
    await delay(1000);
    return {
      data: [
        {
          id: 'ORD-1001',
          customerId: 'CUST-1',
          customerName: 'Alice Smith',
          customerEmail: 'alice@example.com',
          customerPhone: '1234567890',
          jewelleryType: 'Necklace',
          metalType: 'Platinum',
          budgetRange: '$5000+',
          description: 'Diamond pendant necklace.',
          inspirationImages: [],
          status: 'Pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ],
      meta: { total: 1, page: 1, lastPage: 1 }
    };
  },

  // Update order status (Admin)
  updateOrderStatus: async (id: string, status: BespokeStatus): Promise<{ message: string }> => {
    // return await bespokeApi.patch(`/admin/custom-orders/${id}/status`, { status });
    
    // MOCK IMPLEMENTATION
    await delay(800);
    return { message: 'Status updated successfully.' };
  },

  // Add quote to order (Admin)
  addQuote: async (id: string, payload: { amount: number, notes?: string }): Promise<{ message: string }> => {
    // return await bespokeApi.post(`/admin/custom-orders/${id}/quote`, payload);
    
    // MOCK IMPLEMENTATION
    await delay(800);
    return { message: 'Quote added successfully.' };
  }
};
