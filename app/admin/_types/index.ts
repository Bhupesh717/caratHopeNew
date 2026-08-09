// ============================================================
// Admin Panel TypeScript Types
// ============================================================

/** Admin user session */
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
  avatar: string;
}

/** Banner / hero slide */
export interface Banner {
  id: string;
  image: string;
  badge: string;
  title: string;
  description: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

/** Product category */
export interface AdminCategory {
  id: string;
  image: string;
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  status: 'active' | 'inactive';
  createdAt: string;
}

/** Product */
export interface AdminProduct {
  id: string;
  images: string[];
  name: string;
  sku: string | null;
  categoryId: string;
  price: number | null;
  discountPrice: number | null;
  stockQty: number | null;
  description: string;
  video?: string | null;
  details?: { key: string; value: string }[];
  has_variants: boolean;
  status: 'active' | 'inactive';
  isFeatured: boolean;
  createdAt: string;
  variants?: AdminProductVariant[];
}

export interface VariantPrice {
  id: string;
  product_variant_id: string;
  region_id: string;
  price: number;
  compare_at_price: number | null;
}

export interface AdminProductVariant {
  id: string;
  product_id: string;
  sku: string;
  weight_grams: number | null;
  making_charges: number | null;
  stock_quantity: number;
  is_active: boolean;
  attribute_value_ids?: string[]; // IDs of attribute values this variant represents
  prices?: VariantPrice[];
  createdAt: string;
}

/** Coupon / discount code */
export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  expiryDate: string;
  usageLimit: number;
  usageCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

/** Order status enum */
export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

/** Payment status */
export type PaymentStatus = 'paid' | 'unpaid' | 'refunded';

/** A single item inside an order */
export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
}

/** Order */
export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
}

/** App user (customer) */
export interface AppUser {
  id: string;
  avatar: string;
  name: string;
  email: string;
  phone: string;
  registrationDate: string;
  status: 'active' | 'inactive';
  orderCount: number;
  totalSpent: number;
}

// ============================================================
// Generic helpers for the data-table component
// ============================================================

export interface ColumnDef<T> {
  key: string;
  header: string;
  /** Return a ReactNode for custom rendering, or a string/number for plain text */
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterDef {
  key: string;
  label: string;
  options: FilterOption[];
}

/** Product Attribute */
export interface AdminAttribute {
  id: string;
  name: string;
  slug: string;
  input_type: string;
  unit?: string | null;
  affects_price?: boolean;
  createdAt: string;
  values?: AdminAttributeValue[];
}

/** Product Attribute Value */
export interface AdminAttributeValue {
  id: string;
  attribute_id: string;
  value: string;
  price_modifier?: number;
  sort_order?: number;
  createdAt: string;
}

/** Category Attribute Mapping */
export interface AdminCategoryAttribute {
  id: string;
  category_id: string;
  attribute_id: string;
  is_required: boolean;
  createdAt: string;
  
  // Extra fields that might come from JOINs or populated data
  category_name?: string;
  attribute_name?: string;
}
