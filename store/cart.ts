import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '@/types';

export interface AppliedCoupon {
  id: number;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, variantId?: string, selectedOptions?: Record<string, string>) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  appliedCoupon: AppliedCoupon | null;
  applyCoupon: (coupon: AppliedCoupon | null) => void;
  toggleSelection: (cartItemId: string) => void;
  toggleAllSelection: (selected: boolean) => void;
  clearSelectedCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: null,
      
      applyCoupon: (coupon) => set({ appliedCoupon: coupon }),

      addItem: (product, quantity = 1, variantId, selectedOptions) =>
        set((state) => {
          const cartItemId = variantId ? `${product.id}_${variantId}` : String(product.id);
          const existingItem = state.items.find((item) => (item.cartItemId || item.id) === cartItemId);
          
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                (item.cartItemId || item.id) === cartItemId
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          
          return {
            items: [...state.items, { ...product, quantity, selected: true, variantId, selectedOptions, cartItemId }],
          };
        }),
      
      removeItem: (cartItemId) =>
        set((state) => ({
          items: state.items.filter((item) => (item.cartItemId || item.id) !== cartItemId),
        })),
      
      updateQuantity: (cartItemId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            (item.cartItemId || item.id) === cartItemId ? { ...item, quantity } : item
          ),
        })),
      
      clearCart: () => set({ items: [], appliedCoupon: null }),
      
      clearSelectedCart: () => set((state) => ({
        items: state.items.filter((item) => item.selected === false),
        appliedCoupon: null
      })),

      toggleSelection: (cartItemId) =>
        set((state) => ({
          items: state.items.map((item) =>
            (item.cartItemId || item.id) === cartItemId ? { ...item, selected: item.selected === false ? true : false } : item
          ),
        })),

      toggleAllSelection: (selected) =>
        set((state) => ({
          items: state.items.map((item) => ({ ...item, selected })),
        })),

      getTotal: () => {
        const state = get();
        return state.items
          .filter(item => item.selected !== false)
          .reduce((total, item) => total + item.price * item.quantity, 0);
      },
      
      getItemCount: () => {
        const state = get();
        return state.items
          .filter(item => item.selected !== false)
          .reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
