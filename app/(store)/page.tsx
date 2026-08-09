'use client';

import { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/lib/api-client';
import { Product } from '@/types';
import { BannerCarousel } from '@/components/banner-carousel';
import { ProductCard } from '@/components/product-card';
import { mockProducts } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BrandMarquee } from '@/components/brand-marquee';
import { InstagramGrid } from '@/components/instagram-grid';
import { AboutSection } from '@/components/about-section';
import { ShoppableShowcase } from '@/components/shoppable-showcase';
import { HeroBanner } from '@/components/hero-banner';
import { WhyChooseUs } from '@/components/why-choose-us';
import { Testimonials } from '@/components/testimonials';
import { ExploreCategories } from '@/components/explore-categories';
import { InfoRibbon } from '@/components/info-ribbon';
import { CtaAppointment } from '@/components/cta-appointment';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Page() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        setLoading(true);
        const response = await apiClient.get('/public/products?featured=true&per_page=12');
        if (response.data && response.data.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
          const mapped: Product[] = response.data.data.map((p: any) => ({
            id: String(p.id),
            name: p.name,
            price: p.discount_price ? Number(p.discount_price) : Number(p.price),
            originalPrice: p.discount_price ? Number(p.price) : undefined,
            currency: p.display_currency || 'INR', // Usually INR for Indian sites, but defaulting to IN might be fine, changed to INR just in case
            category: p.category?.name || 'Jewelry',
            image: p.images || p.product_images?.[0]?.image_path || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop',
            description: p.description || '',
            rating: p.avg_rating ? Number(Number(p.avg_rating).toFixed(1)) : 5, // Defaulting to 5 if no rating
            reviews: p.reviews_count || 0,
          }));
          setFeaturedProducts(mapped);
        } else {
          setFeaturedProducts(mockProducts);
        }
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setFeaturedProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  // Autoplay Effect
  useEffect(() => {
    if (loading || featuredProducts.length === 0 || isHovered) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        // If we are at the end, scroll back to 0, otherwise scroll forward by 1 item width
        const itemWidth = 320 + 24; // width + gap
        const nextScroll = scrollLeft + itemWidth;

        if (nextScroll >= scrollWidth - clientWidth) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollTo({ left: nextScroll, behavior: 'smooth' });
        }
      }
    }, 4000); // Auto move every 4 seconds

    return () => clearInterval(interval);
  }, [loading, featuredProducts, isHovered]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div>
      {/* Banner Carousel */}
      <BannerCarousel />

      {/* Info Ribbon */}
      <InfoRibbon />

      {/* Explore Categories Section */}
      <ExploreCategories />

      {/* About Section */}
      <AboutSection />

      {/* Featured Products Section */}
      <section className="w-full bg-background py-24 border-t border-slate-100 relative overflow-hidden">
        <div className="mx-auto px-8 sm:px-12 lg:px-16 relative">

          {/* Header Block */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-wide text-emerald-dark font-serif uppercase">
                Featured Collections
              </h2>
              <div className="h-[1px] w-20 bg-gold-primary/40 my-4" />
              <p className="text-xs md:text-sm text-slate-500 tracking-widest uppercase font-light">
                Meticulously crafted jewelry, handpicked for you
              </p>
            </div>

            {/* Navigation and View All */}
            <div className="flex items-center gap-6">
              <Link
                href="/shop"
                className="hidden md:block text-xs uppercase tracking-widest font-medium text-emerald-dark border-b border-transparent hover:border-gold-primary hover:text-gold-primary transition-all pb-1"
              >
                View All
              </Link>
              <div className="flex gap-2">
                <button
                  onClick={() => scroll('left')}
                  className="rounded-full border border-slate-200 bg-white hover:bg-slate-50 p-2.5 shadow-sm transition-all duration-300 group"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="h-5 w-5 text-slate-600 group-hover:text-slate-900" />
                </button>
                <button
                  onClick={() => scroll('right')}
                  className="rounded-full border border-slate-200 bg-white hover:bg-slate-50 p-2.5 shadow-sm transition-all duration-300 group"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-slate-900" />
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable Container with Carousel items */}
          <div
            ref={scrollRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-6 pt-2 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {featuredProducts.map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="w-[280px] sm:w-[320px] flex-shrink-0 snap-start bg-white  border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>

        </div>
      </section>


      {/* Shoppable Showcase Section */}
      <ShoppableShowcase />

      {/* Why Choose Us Section */}
      <WhyChooseUs />

      {/* Testimonials Section */}
      <Testimonials />

      {/* Hero Banner Section */}
      {/* <HeroBanner /> */}

      {/* Instagram Grid */}
      {/* <InstagramGrid /> */}

      {/* CTA Section */}
      <CtaAppointment />

    </div>
  );
}
