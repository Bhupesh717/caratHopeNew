'use client';

import React from 'react';
import Link from 'next/link';

export function ShoppableShowcase() {
  return (
    <section className="w-full bg-muted border-t border-slate-100 overflow-hidden">

      {/* Section Divider/Header */}
      {/* <div className="text-center py-16 bg-slate-50/20">
        <span className="text-[9px] tracking-[0.32em] uppercase text-slate-400 font-semibold">
          Luxury in Motion
        </span>
        <h2 className="text-2xl md:text-3xl font-light font-serif tracking-wide text-slate-900 mt-2 uppercase">
          The Showcase
        </h2>
        <div className="h-[1px] w-12 bg-amber-500/30 mx-auto mt-4" />
      </div> */}

      {/* Row 1: Video Left, Text Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch min-h-[500px]">
        {/* Video Column */}
        <div className="relative w-full min-h-[350px] lg:min-h-full overflow-hidden bg-slate-100">
          <video
            src="/images/showcase-1.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 hover:scale-103"
          />
          <div className="absolute inset-0 bg-black/5 pointer-events-none" />
        </div>

        {/* Text Content */}
        <div className="flex flex-col justify-center px-8 sm:px-16 lg:px-20 xl:px-28 py-16 space-y-6 bg-muted">
          <span className="text-[9px] tracking-[0.25em] uppercase text-emerald-dark/70 font-bold">
            01 / Fine Jewels
          </span>
          <h3 className="text-3xl sm:text-4xl font-light tracking-wide text-emerald-dark font-serif leading-tight">
            Curated by color
          </h3>
          <div className="h-[1px] w-16 bg-slate-200" />
          <p className="text-slate-500 leading-relaxed text-sm sm:text-[15px] font-light max-w-md">
            Brighten up your look with vibrant gemstone jewelry. Discover selected styles crafted in warm gold and colorful tones.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center group text-[11px] tracking-[0.28em] font-semibold text-emerald-dark uppercase border-b border-slate-300 hover:border-emerald-accent hover:text-emerald-accent pb-1 transition-all duration-300"
            >
              <span>Explore Collection</span>
              <span className="ml-2.5 transform group-hover:translate-x-1.5 transition-transform duration-300">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Row 2: Text Left, Video Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch min-h-[500px] border-t border-slate-100">
        {/* Text Content (first on desktop, second on mobile) */}
        <div className="flex flex-col justify-center px-8 sm:px-16 lg:px-20 xl:px-28 py-16 space-y-6 bg-muted order-2 lg:order-1">
          <span className="text-[9px] tracking-[0.25em] uppercase text-emerald-dark/70 font-bold">
            02 / Modern Design
          </span>
          <h3 className="text-3xl sm:text-4xl font-light tracking-wide text-emerald-dark font-serif leading-tight">
            Make the connection
          </h3>
          <div className="h-[1px] w-16 bg-slate-200" />
          <p className="text-slate-500 leading-relaxed text-sm sm:text-[15px] font-light max-w-md">
            Introducing your outfit's missing link. Designed to be layered or worn alone as a bold, elegant statement.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center group text-[11px] tracking-[0.28em] font-semibold text-emerald-dark uppercase border-b border-slate-300 hover:border-emerald-accent hover:text-emerald-accent pb-1 transition-all duration-300"
            >
              <span>Explore Collection</span>
              <span className="ml-2.5 transform group-hover:translate-x-1.5 transition-transform duration-300">→</span>
            </Link>
          </div>
        </div>

        {/* Video Column (second on desktop, first on mobile) */}
        <div className="relative w-full min-h-[350px] lg:min-h-full overflow-hidden bg-slate-100 order-1 lg:order-2">
          <video
            src="/images/showcase-2.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 hover:scale-103"
          />
          <div className="absolute inset-0 bg-black/5 pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
