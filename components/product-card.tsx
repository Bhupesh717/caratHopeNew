'use client';

import { Product } from '@/types';
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getCurrencySymbol } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const inWishlist = isHydrated ? isInWishlist(product.id) : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="group flex flex-col bg-white overflow-hidden transition-all duration-300"
    >
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <Link href={`/product/${product.id}`} className="absolute inset-0 block">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Wishlist Button (Fades in on hover) */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          className="absolute right-3.5 top-3.5 rounded-full bg-white/95 backdrop-blur p-2 shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-slate-100 transition-all duration-300 hover:scale-105 hover:bg-slate-50 text-slate-700 md:opacity-0 md:group-hover:opacity-100"
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className="h-4 w-4 transition-colors duration-200"
            fill={inWishlist ? '#ef4444' : 'none'}
            color={inWishlist ? '#ef4444' : 'currentColor'}
          />
        </button>

        {/* Quick Add Button (Slides up on hover) */}
        <button
          onClick={() => addToCart(product)}
          className="absolute bottom-0 left-0 w-full bg-primary text-white hover:bg-emerald-accent transition-all duration-300 py-3.5 text-center text-[10px] tracking-[0.25em] font-semibold uppercase opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 cursor-pointer hidden md:block"
        >
          Quick Add
        </button>
      </div>

      <div className="flex flex-col space-y-1 py-3 px-1 text-left">
        {/* Category */}
        <span className="text-[9px] sm:text-[10px] tracking-[0.18em] uppercase font-medium text-slate-400/90">
          {product.category}
        </span>

        {/* Product Name */}
        <Link href={`/product/${product.id}`} className="block">
          <h3 className="font-serif font-light text-[15px] sm:text-base tracking-wide text-slate-800 transition-colors duration-300 hover:text-emerald-accent leading-snug line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Rating (fixed the 0 bug) */}
        {product.rating !== undefined && product.rating > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-0.5">
            <span className="text-amber-500">★</span>
            <span>
              {product.rating} ({product.reviews || 0} reviews)
            </span>
          </div>
        )}

        {/* Prices */}
        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="text-sm sm:text-base font-normal text-slate-900">
            {getCurrencySymbol(product.currency)}
            {product.price.toLocaleString()}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-[11px] sm:text-xs line-through text-slate-400 font-light">
              {getCurrencySymbol(product.currency)}
              {product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Mobile-only visible Add to Cart button */}
        <button
          onClick={() => addToCart(product)}
          className="w-full bg-primary text-white hover:bg-emerald-accent active:bg-emerald-dark py-2.5 text-center text-[10px] tracking-[0.2em] font-medium uppercase mt-2 block md:hidden cursor-pointer"
        >
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
}
