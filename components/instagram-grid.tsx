'use client';

import React from 'react';
import { Instagram } from 'lucide-react';
import Image from 'next/image';

export function InstagramGrid() {
  const images = [
    { id: 1, src: '/images/instagram/ig-1.png', alt: 'Gold Diamond Rings Stack' },
    { id: 2, src: '/images/instagram/ig-2.png', alt: 'Model wearing Gold Necklace' },
    { id: 3, src: '/images/instagram/ig-3.png', alt: 'Jeweler Crafting Gold Ring' },
    { id: 4, src: '/images/instagram/ig-4.png', alt: 'Model showing Diamond Ring' }
  ];

  return (
    <section className="relative overflow-hidden bg-white py-10 md:py24 border-t border-slate-100">
      <div className="mx-auto max-w-[1600px] px-6 sm:px-12 lg:px-16 relative z-10">

        {/* Header Block matching Explore Categories / Featured Collections */}
        <div className="text-center mb-10 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <span className="text-amber-500 text-sm select-none">◆</span>
            <span className="text-[9px] tracking-[0.32em] uppercase text-slate-400 font-semibold">
              Connect With Us
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light font-serif tracking-wide text-slate-900 uppercase">
            On Instagram
          </h2>
          <div className="h-[1px] w-12 bg-amber-500/30 mx-auto mt-4" />
          <div className="text-center mt-10">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 group text-[13px] tracking-[0.25em] font-semibold uppercase pb-1.5 relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Instagram className="h-4.5 w-4.5 stroke-[1.8] text-amber-500 transition-all duration-300 group-hover:text-pink-600" />
                <span className="bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent transition-all duration-300 group-hover:from-purple-600 group-hover:via-pink-500 group-hover:to-yellow-500">
                  @CaratHope
                </span>
              </span>
              {/* Elegant luxury brand sliding underline matching instagram gradient */}
              <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-slate-200 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:via-pink-500 group-hover:to-yellow-500 transition-all duration-500" />
            </a>
          </div>
        </div>

        {/* Grid — larger sizes, gap space, clean corners */}
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {images.map((img) => (
            <a
              key={img.id}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-[4/5] overflow-hidden bg-slate-50 border border-slate-100 block"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
              />
              {/* Luxury Minimal Blur Overlay on Hover */}
              <div className="absolute inset-0 bg-slate-950/25 opacity-0 backdrop-blur-[1px] transition-all duration-500 ease-out group-hover:opacity-100 flex items-center justify-center">
                <div className="h-12 w-12 rounded-full bg-white text-slate-800 shadow-md flex items-center justify-center transform translate-y-3 group-hover:translate-y-0 transition-all duration-500 ease-out hover:bg-gradient-to-tr hover:from-purple-600 hover:via-pink-500 hover:to-yellow-500 hover:text-white border border-transparent hover:border-slate-100/20">
                  <Instagram className="h-5 w-5 stroke-[1.5] transition-colors duration-300" />
                </div>
              </div>
            </a>
          ))}
        </div>



      </div>
    </section>
  );
}
