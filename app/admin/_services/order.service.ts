import { adminApiClient } from '@/lib/api-client';
import { Order, OrderStatus, PaymentStatus } from '../_types';

export interface OrderFilters {
  search?: string;
  status?: OrderStatus | '';
  payment_status?: PaymentStatus | '';
  per_page?: number;
  page?: number;
}

export interface PaginatedOrders {
  data: Order[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

const mapOrder = (o: any): Order => ({
  id: String(o.id),
  customerId: o.user_id ? String(o.user_id) : '',
  customerName: o.customer_name || 'Customer',
  customerEmail: o.customer_email || '',
  customerPhone: o.customer_phone || '',
  items: (o.order_items || o.items || []).map((item: any) => ({
    productId: String(item.product_id || item.id || ''),
    productName: item.product_name || item.name || 'Product',
    productImage: item.product_image || item.image || '',
    quantity: Number(item.quantity || 1),
    price: Number(item.price || item.unit_price || 0),
  })),
  itemsCount: o.items_count !== undefined ? Number(o.items_count) : (o.order_items?.length || 0),
  itemsQuantity: o.items_quantity !== undefined ? Number(o.items_quantity) : 0,
  subtotalAmount: o.subtotal_amount !== null && o.subtotal_amount !== undefined ? Number(o.subtotal_amount) : undefined,
  discountAmount: o.discount_amount !== null && o.discount_amount !== undefined ? Number(o.discount_amount) : 0,
  gstAmount: o.gst_amount !== null && o.gst_amount !== undefined ? Number(o.gst_amount) : 0,
  totalAmount: Number(o.total_amount || 0),
  currency: o.currency || 'INR',
  paymentStatus: o.payment_status || 'unpaid',
  orderStatus: o.order_status || 'pending',
  paymentMethod: o.payment_method || null,
  razorpayOrderId: o.razorpay_order_id || null,
  razorpayPaymentId: o.razorpay_payment_id || null,
  paidAt: o.paid_at || null,
  billingAddress: o.billing_address || null,
  shippingAddress: o.shipping_address || null,
  notes: o.notes || null,
  createdAt: o.created_at,
  updatedAt: o.updated_at,
});

export const orderService = {
  getAll: async (filters: OrderFilters = {}): Promise<PaginatedOrders> => {
    const params: Record<string, string | number> = {};
    if (filters.search?.trim())       params.search         = filters.search.trim();
    if (filters.status)               params.status         = filters.status;
    if (filters.payment_status)       params.payment_status = filters.payment_status;
    if (filters.per_page)             params.per_page       = filters.per_page;
    if (filters.page)                 params.page           = filters.page;

    const response = await adminApiClient.get('/admin/orders', { params });
    const res = response.data;

    // Support both paginated { success: true, data: [...], meta: {...} } and nested { data: { data: [], meta: {} } }
    const items: any[] = Array.isArray(res?.data)
      ? res.data
      : (res?.data?.data ?? res?.data ?? []);
    const meta = res?.meta ?? res?.data?.meta ?? {};

    return {
      data:         items.map(mapOrder),
      total:        meta.total        ?? items.length,
      per_page:     meta.per_page     ?? (filters.per_page ?? 20),
      current_page: meta.current_page ?? (filters.page     ?? 1),
      last_page:    meta.last_page    ?? 1,
    };
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
