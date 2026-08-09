'use client';

import { WishlistSection } from '@/components/wishlist-section';
import { PageHeader } from '@/components/page-header';
import { Heart } from 'lucide-react';

export default function WishlistPage() {
  return (
    <div className="border-t border-neutral-200">
      <PageHeader
        eyebrow="Your Favorites"
        icon={Heart}
        title="Wishlist"
        subtitle="Items you love and want to remember."
        imageSrc="/page_heaer.png"
      />

      {/* Wishlist Items */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <WishlistSection />
      </div>
    </div>
  );
}
