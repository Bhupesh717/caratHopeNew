'use client';

import { useState, useEffect } from 'react';

import { useWishlistStore } from '@/store/wishlist';
import { useCartStore } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { ProductCard } from './product-card';
import { Heart } from 'lucide-react';
import Link from 'next/link';

export function WishlistSection() {
  const wishlistItems = useWishlistStore((state) => state.items);
  const addToCart = useCartStore((state) => state.addItem);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-16">
        <div className="rounded-full bg-neutral-100 p-6">
          <Heart className="h-12 w-12 text-neutral-400" />
        </div>
        <h2 className="text-2xl font-light text-neutral-900">Your Wishlist is Empty</h2>
        <p className="text-center text-neutral-600">
          Add your favorite items to your wishlist and they will appear here.
        </p>
        <Button asChild className="bg-neutral-900 text-white hover:bg-neutral-800">
          <Link href="/shop">
            Continue Shopping
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-light text-neutral-900">
          My Wishlist ({wishlistItems.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {wishlistItems.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </div>
  );
}
