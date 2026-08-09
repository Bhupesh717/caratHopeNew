'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BannerSlide {
  id: number;
  heading: string;
  subheading: string;
  description: string;
  image: string;
  cta: {
    text: string;
    href: string;
  };
}

import { apiClient } from '@/lib/api-client';

const mockSlides: BannerSlide[] = [
  {
    id: 1,
    heading: 'exquisite rings,',
    subheading: 'crafted to shine.',
    description: 'Discover timeless rings handcrafted with precision and passion. The perfect symbol of love.',
    image: '/images/slider-7.jpg',
    cta: {
      text: 'Explore Rings',
      href: '/shop?category=rings',
    },
  },
  {
    id: 2,
    heading: 'timeless necklaces,',
    subheading: 'elegance redefined.',
    description: 'Grace your neckline with our curated collection of elegant necklaces designed for absolute sophistication.',
    image: '/images/slider-8.jpg',
    cta: {
      text: 'Shop Necklaces',
      href: '/shop?category=necklaces',
    },
  },
  {
    id: 3,
    heading: 'luxury collections,',
    subheading: 'designed for you.',
    description: 'Explore our statement pieces that complement any style, meticulously shaped by master artisans.',
    image: '/images/slider-10-8.jpg',
    cta: {
      text: 'View Collections',
      href: '/shop',
    },
  },
];

export function BannerCarousel() {
  const [slides, setSlides] = useState<BannerSlide[]>([]);
  const [current, setCurrent] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    async function fetchBanners() {
      try {
        const response = await apiClient.get('/public/banners');
        if (response.data && response.data.success && response.data.data.length > 0) {
          const mapped: BannerSlide[] = response.data.data.map((b: any) => ({
            id: b.id,
            heading: b.title,
            subheading: b.badge || '',
            description: b.description || '',
            image: b.image,
            cta: {
              text: 'Shop Now',
              href: '/shop',
            },
          }));
          setSlides(mapped);
        } else {
          setSlides(mockSlides);
        }
      } catch (err) {
        console.error('Error fetching public banners:', err);
        setSlides(mockSlides);
      }
    }
    fetchBanners();
  }, []);

  useEffect(() => {
    if (!autoPlay || slides.length === 0) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [autoPlay, slides.length]);

  const next = () => {
    if (slides.length === 0) return;
    setCurrent((prev) => (prev + 1) % slides.length);
    setAutoPlay(false);
  };

  const prev = () => {
    if (slides.length === 0) return;
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
    setAutoPlay(false);
  };

  const goToSlide = (index: number) => {
    setCurrent(index);
    setAutoPlay(false);
  };

  const slide = slides[current] || slides[0] || mockSlides[0];

  return (
    <section className="relative overflow-hidden w-full h-[60vw] sm:h-[50vw] lg:h-[42vw] max-h-[800px] min-h-[260px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="relative w-full h-full overflow-hidden"
        >
          {/* Full-width Background Image */}
          <motion.img
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            src={slide.image}
            alt={slide.heading || 'Banner'}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />

          {/* Dark gradient overlay at top for navbar readability, and bottom for contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/20" />

          {/* Clickable overlay */}
          <Link href={slide.cta.href} className="absolute inset-0 z-10" aria-label={slide.heading} />

          {/* Centered Container for Overlaid Text Content & Button (commented out) */}
          {/* <div className="relative z-10 mx-auto max-w-7xl h-full px-6 sm:px-12 flex items-center">
            <div className="max-w-xl space-y-4 sm:space-y-6 text-left">
              <motion.span
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-xs md:text-sm font-semibold uppercase tracking-[0.25em] text-primary block"
              >
                {slide.subheading}
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light font-serif text-primary uppercase leading-tight tracking-wide"
              >
                {slide.heading}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-xs sm:text-sm md:text-base text-slate-600 font-light max-w-md leading-relaxed"
              >
                {slide.description}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="pt-2 sm:pt-4"
              >
                <Link href={slide.cta.href}>
                  <button className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-slate-300 shadow-sm transition-all duration-300 px-8 py-3.5 text-xs tracking-[0.2em] font-semibold uppercase hover:shadow-md cursor-pointer">
                    {slide.cta.text}
                  </button>
                </Link>
              </motion.div>
            </div>
          </div> */}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons (extreme edges, clean design matching screenshot) */}
      <button
        onClick={prev}
        onMouseEnter={() => setAutoPlay(false)}
        onMouseLeave={() => setAutoPlay(true)}
        className="absolute left-4 md:left-8 top-1/2 z-20 -translate-y-1/2 rounded-full border border-slate-200 bg-white/60 hover:bg-white p-3 shadow-sm transition-all duration-300 group"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5 text-slate-700 group-hover:text-slate-900" />
      </button>

      <button
        onClick={next}
        onMouseEnter={() => setAutoPlay(false)}
        onMouseLeave={() => setAutoPlay(true)}
        className="absolute right-4 md:right-8 top-1/2 z-20 -translate-y-1/2 rounded-full border border-slate-200 bg-white/60 hover:bg-white p-3 shadow-sm transition-all duration-300 group"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5 text-slate-700 group-hover:text-slate-900" />
      </button>

      {/* Dot Indicators (centered at the bottom) */}
      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-3 items-center">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            onMouseEnter={() => setAutoPlay(false)}
            onMouseLeave={() => setAutoPlay(true)}
            className={`transition-all duration-300 rounded-full ${index === current
              ? 'w-2.5 h-2.5 bg-slate-800'
              : 'w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400'
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
