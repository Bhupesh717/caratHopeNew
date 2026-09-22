'use client';

import React, { useRef, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface CategoryItem {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  link: string;
}

const mockCategoriesData: CategoryItem[] = [

  {
    id: '2',
    name: 'Silver Jewellery Businesses',
    subtitle: 'Timeless sterling elegance',
    image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&auto=format&fit=crop&q=80',
    link: '/shop?category=silver',
  },
  {
    id: '3',
    name: 'Bridal Jewellery Stores',
    subtitle: 'Heritage sets for your big day',
    image: '/images/bespoke/earrings.png',
    link: '/shop?category=bridal',
  },
  {
    id: '4',
    name: 'Wholesale Jewellery Suppliers',
    subtitle: 'Bulk premium manufacturing',
    image: '/images/bespoke/ring.png',
    link: '/shop?category=wholesale',
  },
  {
    id: '5',
    name: 'Export-Oriented Jewellery MSMEs',
    subtitle: 'Global quality standards',
    image: 'https://images.unsplash.com/photo-1599643478520-413e657d1e5c?w=600&auto=format&fit=crop&q=80',
    link: '/shop?category=export',
  },
  {
    id: '6',
    name: 'Handcrafted Jewellery Businesses',
    subtitle: 'Artisanal details & love',
    image: 'https://images.unsplash.com/photo-1515562141207-6811bcdd56f8?w=600&auto=format&fit=crop&q=80',
    link: '/shop?category=handcrafted',
  },
  {
    id: '7',
    name: 'Fashion Jewellery Brands',
    subtitle: 'Contemporary style statements',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80',
    link: '/shop?category=fashion',
  },
  {
    id: '8',
    name: 'Rajasthan ODOP Jewellery Businesses',
    subtitle: 'Traditional Kundan & Meenakari',
    image: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=600&auto=format&fit=crop&q=80',
    link: '/shop?category=rajasthan-odop',
  },
];

export function ExploreCategories() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await apiClient.get('/public/categories');
        if (response.data && response.data.success && response.data.data.length > 0) {
          const mapped: CategoryItem[] = response.data.data.map((cat: any) => ({
            id: String(cat.id),
            name: cat.name,
            subtitle: cat.description || 'Discover our collections',
            image: cat.image || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80',
            link: `/shop?category=${cat.id}`,
          }));
          setCategories(mapped);
        } else {
          setCategories(mockCategoriesData);
        }
      } catch (err) {
        console.error('Error fetching public categories:', err);
        setCategories(mockCategoriesData);
      }
    }
    fetchCategories();
  }, []);

  const handleScroll = () => {
    if (!scrollRef.current || categories.length === 0) return;
    const container = scrollRef.current;
    const { scrollLeft, scrollWidth, clientWidth } = container;

    if (scrollLeft <= 10) {
      setActiveIndex(0);
      return;
    }
    if (scrollLeft + clientWidth >= scrollWidth - 10) {
      setActiveIndex(categories.length - 1);
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;

    let closestIndex = 0;
    let minDistance = Infinity;

    Array.from(container.children).forEach((child, i) => {
      const rect = child.getBoundingClientRect();
      const childCenter = rect.left + rect.width / 2;
      const distance = Math.abs(containerCenter - childCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    });

    setActiveIndex(closestIndex);
  };

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const child = container.children[index] as HTMLElement;
    if (child) {
      const containerRect = container.getBoundingClientRect();
      const childRect = child.getBoundingClientRect();
      const scrollOffset = childRect.left - containerRect.left + container.scrollLeft;
      container.scrollTo({
        left: scrollOffset,
        behavior: 'smooth',
      });
      setActiveIndex(index);
    }
  };

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
    <section className="w-full bg-white py-24 border-t border-border relative overflow-hidden">
      <div className="mx-auto px-8 sm:px-12 lg:px-16 relative">

        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-wide text-emerald-dark font-serif uppercase">
              Explore Our Categories
            </h2>
            <div className="h-[1px] w-20 bg-amber-500/40 my-4" />
            <p className="text-xs md:text-sm text-slate-500 tracking-widest uppercase font-light">
              Discover the perfect collections, from bridal heritage to contemporary fashion.
            </p>
          </div>
        </div>

        {/* Carousel Container with Left & Right Floating Arrows */}
        <div className="relative group/carousel">
          {/* Left Arrow Button */}
          <button
            onClick={() => scroll('left')}
            className="absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-slate-200 bg-white/95 backdrop-blur-sm hover:bg-white text-slate-700 hover:text-slate-950 shadow-[0_4px_20px_rgba(0,0,0,0.12)] flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
            aria-label="Previous categories"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-slate-700" />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-6 pt-2 scroll-smooth px-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((category) => (
              <motion.div
                key={category.id}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="w-[280px] h-[380px] sm:w-[320px] sm:h-[420px] flex-shrink-0 snap-start relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100/40 group cursor-pointer"
              >
                <Link href={category.link} className="absolute inset-0 block">
                  {/* Background Image */}
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 280px, 320px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  {/* Elegant Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent transition-opacity duration-300 group-hover:opacity-75" />

                  {/* Text Content overlay at the bottom-left */}
                  <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 flex flex-col justify-end">
                    <h3 className="text-white text-lg sm:text-xl font-light font-serif tracking-wider uppercase leading-tight group-hover:text-gold-primary transition-colors duration-300">
                      {category.name}
                    </h3>
                    {/* Premium line micro-animation */}
                    <div className="h-[1px] w-0 bg-amber-200/50 mt-2.5 transition-all duration-500 ease-out group-hover:w-16" />
                    <p className="text-white/70 text-[10px] sm:text-xs font-light mt-3 tracking-widest uppercase">
                      {category.subtitle}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Right Arrow Button */}
          <button
            onClick={() => scroll('right')}
            className="absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-slate-200 bg-white/95 backdrop-blur-sm hover:bg-white text-slate-700 hover:text-slate-950 shadow-[0_4px_20px_rgba(0,0,0,0.12)] flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
            aria-label="Next categories"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-slate-700" />
          </button>
        </div>

        {/* Bottom Dots Indicators */}
        {categories.length > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {categories.map((category, index) => (
              <button
                key={category.id || index}
                onClick={() => scrollToIndex(index)}
                aria-label={`Go to category ${category.name}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeIndex === index
                    ? 'w-7 bg-primary'
                    : 'w-2 bg-slate-200 hover:bg-slate-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* CSS to hide scrollbar (Tailwind custom utility styling) */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
