'use client';

import React from 'react';
import Image from 'next/image';

export function BrandMarquee() {
  const brandLogos = [
    '/images/brands/brand-1.jpg',
    '/images/brands/brand-2.jpg',
    '/images/brands/brand-3.jpg',
    '/images/brands/brand-4.jpg',
  ];

  return (
    <div className="relative w-full overflow-hidden bg-slate-50 
     border-t border-b border-slate-200">
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        .marquee-group:hover .animate-marquee,
        .marquee-group:focus-within .animate-marquee {
          animation-play-state: paused;
        }
      `}} />
      <div
        className="marquee-group flex overflow-hidden select-none gap-16 [--gap:4rem]"
        tabIndex={0}
      >
        <div className="flex shrink-0 justify-around gap-16 min-w-full animate-marquee">
          {brandLogos.map((logoPath, idx) => (
            <a
              href="#"
              key={`logo-1-${idx}`}
              className="flex items-center justify-center px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <Image
                src={logoPath}
                alt={`Partner Brand Logo ${idx + 1}`}
                width={200}
                height={100}
                className="h-1/2 w-auto object-contain"
              />
            </a>
          ))}
        </div>
        <div className="flex shrink-0 justify-around gap-16 min-w-full animate-marquee" aria-hidden="true">
          {brandLogos.map((logoPath, idx) => (
            <a
              href="#"
              key={`logo-2-${idx}`}
              className="flex items-center justify-center px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              tabIndex={-1}
            >
              <Image
                src={logoPath}
                alt={`Partner Brand Logo ${idx + 1}`}
                width={200}
                height={100}
                className="h-1/2 w-auto object-contain"
              />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
