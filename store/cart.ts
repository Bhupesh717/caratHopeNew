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
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  appliedCoupon: AppliedCoupon | null;
  applyCoupon: (coupon: AppliedCoupon | null) => void;
  toggleSelection: (productId: string) => void;
  toggleAllSelection: (selected: boolean) => void;
  clearSelectedCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: null,
      
      applyCoupon: (coupon) => set({ appliedCoupon: coupon }),

      addItem: (product, quantity = 1) =>
        set((state) => {
          const existingItem = state.items.find((item) => item.id === product.id);
          
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          
          return {
            items: [...state.items, { ...product, quantity, selected: true }],
          };
        }),
      
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        })),
      
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
        })),
      
      clearCart: () => set({ items: [], appliedCoupon: null }),
      
      clearSelectedCart: () => set((state) => ({
        items: state.items.filter((item) => item.selected === false),
        appliedCoupon: null
      })),

      toggleSelection: (productId) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === productId ? { ...item, selected: item.selected === false ? true : false } : item
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
