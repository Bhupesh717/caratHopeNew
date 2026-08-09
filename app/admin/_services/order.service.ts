import { adminApiClient } from '@/lib/api-client';
import { Order, OrderStatus } from '../_types';

const mapOrder = (o: any): Order => ({
  id: String(o.id),
  customerId: o.user_id ? String(o.user_id) : '',
  customerName: o.customer_name,
  customerEmail: o.customer_email,
  customerPhone: o.customer_phone,
  items: (o.order_items || []).map((item: any) => ({
    productId: String(item.product_id),
    productName: item.product_name,
    productImage: item.product_image || '',
    quantity: Number(item.quantity),
    price: Number(item.price),
  })),
  totalAmount: Number(o.total_amount),
  paymentStatus: o.payment_status,
  orderStatus: o.order_status,
  createdAt: o.created_at,
});

export const orderService = {
  getAll: async (): Promise<Order[]> => {
    const response = await adminApiClient.get('/admin/orders');
    return (response.data.data || []).map(mapOrder);
  },

  getById: async (id: string): Promise<Order | undefined> => {
    const response = await adminApiClient.get(`/admin/orders/${id}`);
    if (response.data && response.data.success) {
      return mapOrder(response.data.data);
    }
    return undefined;
  },

  updateStatus: async (id: string, status: OrderStatus): Promise<Order> => {
    const response = await adminApiClient.patch(`/admin/orders/${id}/status`, { status });
    return mapOrder(response.data.data);
  },
};
