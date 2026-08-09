'use client';

import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

export interface Testimonial {
  badge?: string;
  text: string;
  initials: string;
  name: string;
  location: string;
}

const testimonials: Testimonial[] = [
  {
    badge: 'Bespoke Design',
    text: "The most compassionate team we've ever encountered. The bespoke engagement ring they created for us was beyond our wildest dreams. Every detail was crafted to perfection.",
    initials: 'AM',
    name: 'Aisha & Mark',
    location: 'Mumbai, IN',
  },
  {
    badge: 'Expert Quality',
    text: "Expertise you can trust. The attention to detail in their diamond selection is remarkable. The necklace I purchased is a true heirloom piece that I will cherish forever.",
    initials: 'RS',
    name: 'Riya S.',
    location: 'Delhi, IN',
  },
  {
    badge: 'Unwavering Trust',
    text: "A world-class experience. The transition from our initial consultation to the final piece was seamless. We are so grateful to the entire CaratHope team.",
    initials: 'EK',
    name: 'Elena K.',
    location: 'London, UK',
  },
  {
    badge: 'Personal Journey',
    text: "Truly personalized care. They don't just sell jewelry; they help you capture memories. The anniversary ring was everything my wife ever wanted.",
    initials: 'JP',
    name: 'James P.',
    location: 'New York, US',
  },
  {
    badge: 'Highly Recommended',
    text: "Craftsmanship and elegance combined. From the first phone call to receiving the beautiful box, the professionalism was exceptional. Highly recommend CaratHope.",
    initials: 'NM',
    name: 'Neha M.',
    location: 'Jaipur, IN',
  },
];

export function Testimonials() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const slideWidth = scrollRef.current.offsetWidth;
    const index = Math.round(scrollLeft / slideWidth);
    setActiveIndex(index);
  };

  const scrollTo = (index: number) => {
    if (!scrollRef.current) return;

    const scrollNode = scrollRef.current;
    const firstChild = scrollNode.firstElementChild as HTMLElement;
    if (!firstChild) return;

    const slideWidth = firstChild.offsetWidth + 24;

    scrollNode.scrollTo({
      left: slideWidth * index,
      behavior: 'smooth',
    });

    setActiveIndex(index);
  };

  return (
    <section className="bg-background py-10 border-t border-slate-100">
      {/* Header */}
      <div className="mx-auto max-w-7xl px-6 text-center mb-16">
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-2 bg-muted text-primary text-[11px] font-medium tracking-[0.2em] uppercase px-5 py-1.5 rounded-full border border-border">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            Client Stories
          </div>
        </div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-foreground font-medium mb-3">
          Cherished <span className="italic text-primary font-normal">Moments</span>
        </h2>
        <p className="text-[15px] text-foreground/60 tracking-wide max-w-lg mx-auto">
          Thousands of families trust us to craft their perfect heirlooms and celebrate their most precious milestones.
        </p>
      </div>

      {/* Slider Container */}
      <div className="mx-auto max-w-7xl px-6 relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-6 pb-8 pt-4"
        >
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="ts-slide"
            >
              <div
                className="group h-full bg-white rounded-3xl p-8 relative overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1.5 border-[1.5px] border-border/60 shadow-[0_4px_24px_rgba(185,122,87,0.04)] hover:border-primary/50 hover:shadow-[0_20px_48px_rgba(185,122,87,0.12)]"
              >
                {/* Accent Top Bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-[3px] rounded-t-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-r from-primary to-accent"
                />

                {/* Background Blob */}
                <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full pointer-events-none bg-primary/10" />

                {/* Badge */}
                {t.badge && (
                  <div
                    className="absolute top-6 right-6 text-[10px] font-bold tracking-[0.15em] uppercase px-3 py-1 rounded-full border bg-muted text-primary border-border"
                  >
                    {t.badge}
                  </div>
                )}

                <span className="font-serif text-7xl leading-[0.5] mb-8 block text-primary/20">
                  "
                </span>

                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((_, starIdx) => (
                    <Star key={starIdx} className="w-3.5 h-3.5 fill-primary text-primary" />
                  ))}
                </div>

                <p className="text-[15px] leading-[1.8] text-foreground/65 font-light mb-8 flex-1">
                  {t.text}
                </p>

                <div className="w-10 h-[1.5px] mb-5 rounded-sm shrink-0 bg-primary/30" />

                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border-[1.5px] bg-muted text-primary border-border">
                    {t.initials}
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm font-semibold text-foreground m-0">{t.name}</p>
                    <p className="text-xs text-foreground/40 m-0">{t.location}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="mt-8 flex items-center justify-center gap-5">
          <button
            onClick={() => scrollTo(Math.max(0, activeIndex - 1))}
            className="w-11 h-11 rounded-full bg-white border-[1.5px] border-primary/25 flex items-center justify-center text-foreground/40 shadow-[0_2px_12px_rgba(185,122,87,0.08)] transition-all hover:bg-muted hover:border-primary hover:text-primary hover:shadow-[0_4px_16px_rgba(185,122,87,0.2)]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex gap-2 items-center">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                className={`h-1.5 rounded-full transition-all duration-400 ${activeIndex === i ? 'w-7 bg-primary' : 'w-1.5 bg-foreground/15'
                  }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => scrollTo(Math.min(testimonials.length - 1, activeIndex + 1))}
            className="w-11 h-11 rounded-full bg-white border-[1.5px] border-primary/25 flex items-center justify-center text-foreground/40 shadow-[0_2px_12px_rgba(185,122,87,0.08)] transition-all hover:bg-muted hover:border-primary hover:text-primary hover:shadow-[0_4px_16px_rgba(185,122,87,0.2)]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .ts-slide {
          width: 100%;
          flex-shrink: 0;
          scroll-snap-align: start;
        }
        @media (min-width: 640px) {
          .ts-slide {
            width: calc(50% - 12px);
          }
        }
        @media (min-width: 1024px) {
          .ts-slide {
            width: calc(33.33333% - 16px);
          }
        }
      `}} />
    </section>
  );
}
