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
  has_variants?: boolean;
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

/** The exact payload shape for POST/PUT /admin/products */
export interface ProductFormState {
  name: string;
  category_id: string | number;
  description?: string;
  status?: 'active' | 'inactive';
  is_featured?: boolean;
  sku?: string;
  when_was_it_made?: string;
  images: (string | File)[]; // Base64 data URIs, URLs, or raw Files
  video?: string | File;
  
  has_variants?: boolean;
  prices_vary?: boolean;
  quantities_vary?: boolean;
  skus_vary?: boolean;
  processing_time_varies?: boolean;
  max_variation_axes?: number;
  variation_axis_ids?: string[]; // attribute IDs selected as variation axes in Step 3
  
  variants?: ProductVariantFormState[];
  
  // Top-level when toggles are OFF
  prices?: { region_id: number | string; price: number; compare_at_price?: number }[];
  total_stock?: number;
  stock_qty?: number; // for no-variant products
  
  is_global_pricing_enabled?: boolean;
  allow_offers?: boolean;
  max_offer_discount_percent?: number;
  
  // Descriptive
  tags?: string[];
  materials?: string[];
  gold_solidity?: string[];
  gold_purity?: string[];
  listing_attributes?: Record<string, any>;
  
  processing_profile_id?: string | number;
  shipping_profile_id?: string | number;
}

export interface ProductVariantFormState {
  id?: string; // For updates
  attributes: (string | number)[]; // e.g. [29, 51]
  prices?: { region_id: number | string; price: number; compare_at_price?: number }[];
  stock_quantity?: number;
  sku?: string;
  processing_days?: number;
  is_active?: boolean;
  weight_grams?: number;
  making_charges?: number;
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
  allowed_units?: string[];
  max_selections?: number;
  can_be_variation?: boolean;
  is_global?: boolean;
  is_custom?: boolean;
  affects_price?: boolean;
  createdAt: string;
  values?: AdminAttributeValue[];
}

/** Product Attribute Value */
export interface AdminAttributeValue {
  id: string;
  attribute_id: string;
  value: string;
  scale?: string;
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

/** Region (Pricing/Shipping) */
export interface AdminRegion {
  id: string;
  name: string;
  code?: string;
  currency_code: string;
  currency_symbol: string;
  tax_rate?: number;
  is_active?: boolean;
  is_default: boolean;
  createdAt: string;
}

/** Processing Profile */
export interface AdminProcessingProfile {
  id: string;
  name: string;
  min_days: number;
  max_days: number;
  is_default: boolean;
  is_active: boolean;
  createdAt: string;
}

/** Shipping Profile */
export interface AdminShippingProfile {
  id: string;
  name: string;
  origin_pincode: string;
  origin_country_code: string;
  is_default: boolean;
  is_active: boolean;
  products_count: number;
  createdAt: string;
}

/** Shipping Method */
export interface AdminShippingMethod {
  id: string;
  shipping_zone_id: string;
  shipping_profile_id: string;
  name: string;
  carrier_type: 'manual' | 'shiprocket' | 'direct_carrier';
  base_rate: number;
  min_transit_days: number;
  max_transit_days: number;
  processing_days: number;
  requires_signature: boolean;
  is_active: boolean;
  createdAt: string;
}

/** Product Option Group */
export interface AdminProductOptionGroup {
  group: string;
  options: { label: string; value: string }[];
}
