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
}

export interface CartItem extends Product {
  quantity: number;
  selected?: boolean;
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
