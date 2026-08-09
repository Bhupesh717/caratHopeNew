import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WishlistItem, Product } from '@/types';

interface WishlistStore {
  items: WishlistItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  getItemCount: () => number;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product) =>
        set((state) => {
          const exists = state.items.find((item) => item.id === product.id);
          if (exists) return state;
          
          return {
            items: [
              ...state.items,
              {
                ...product,
                addedAt: Date.now(),
              },
            ],
          };
        }),
      
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        })),
      
      toggleWishlist: (product) =>
        set((state) => {
          const exists = state.items.find((item) => item.id === product.id);
          
          if (exists) {
            return {
              items: state.items.filter((item) => item.id !== product.id),
            };
          }
          
          return {
            items: [
              ...state.items,
              {
                ...product,
                addedAt: Date.now(),
              },
            ],
          };
        }),
      
      isInWishlist: (productId) => {
        const state = get();
        return state.items.some((item) => item.id === productId);
      },
      
      getItemCount: () => {
        const state = get();
        return state.items.length;
      },
      
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'wishlist-storage',
    }
  )
);
