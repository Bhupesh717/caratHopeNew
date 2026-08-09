'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function HeroBanner() {
  return (
    <section className="relative w-full h-[77vh] min-h-[450px] overflow-hidden flex items-center justify-center bg-slate-900">
      {/* Background Image with optional parallax feel */}
      <Image
        src="/images/banner/hero-banner.png"
        alt="Hero Banner"
        fill
        sizes="100vw"
        priority
        className="object-cover object-center transition-transform duration-10000 ease-out hover:scale-105"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/35" />

      {/* Centered Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto space-y-6">
        <h2 className="font-serif text-4xl sm:text-5xl md:text-7xl font-bold tracking-widest text-white uppercase leading-none drop-shadow-md select-none">
          Timeless Elegance
        </h2>

        <p className="text-xs sm:text-sm md:text-base font-light tracking-[0.3em] text-white/90 uppercase select-none">
          Crafted with Hope &bull; Shaped by Love
        </p>

        <div className="pt-4">
          <Link
            href="/shop"
            className="inline-block bg-primary hover:bg-emerald-accent text-white transition-all duration-300 px-8 py-3.5 text-xs tracking-[0.2em] font-semibold uppercase hover:shadow-lg cursor-pointer"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
}
