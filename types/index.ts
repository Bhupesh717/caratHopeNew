export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  currency?: string;
  category: string;
  image: string;
  description: string;
  rating?: number;
  reviews?: number;
  images?: string[];
  has_variants?: boolean;
  variants?: any[];
  variation_axes?: any[];
}

export interface CartItem extends Product {
  quantity: number;
  selected?: boolean;
  variantId?: string;
  selectedOptions?: Record<string, string>;
  cartItemId?: string;
}

export interface WishlistItem extends Product {
  addedAt: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
}
