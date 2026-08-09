'use client';

import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HotspotProps {
  top: string;
  left: string;
  title: string;
  price: string;
  link: string;
}

function Hotspot({ top, left, title, price, link }: HotspotProps) {
  return (
    <div
      className="absolute group/hotspot transition-all duration-300"
      style={{ top, left }}
    >
      {/* Pulse Effect */}
      <span className="absolute inset-0 rounded-full bg-white/50 animate-ping" />

      {/* Hotspot Trigger Button */}
      <button
        className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg transition-transform duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-500"
        aria-label={`View ${title}`}
      >
        <Plus className="h-4 w-4 stroke-[2]" />
      </button>

      {/* Hover Popup Card */}
      <div className="absolute left-1/2 bottom-10 -translate-x-1/2 w-48 scale-95 opacity-0 group-hover/hotspot:opacity-100 group-hover/hotspot:scale-100 transition-all duration-300 pointer-events-none group-hover/hotspot:pointer-events-auto bg-white/95 backdrop-blur-md p-3 rounded-lg shadow-xl border border-slate-100 z-20">
        <h4 className="text-xs font-semibold text-slate-900 line-clamp-1">{title}</h4>
        <p className="text-xs text-amber-600 font-medium mt-0.5">{price}</p>
        <Link href={link} className="text-[10px] uppercase font-semibold text-slate-500 hover:text-amber-600 transition-colors block mt-2 tracking-wider">
          Shop Now &rarr;
        </Link>
      </div>
    </div>
  );
}

export function ShoppableShowcase() {
  return (
    <section className="w-full bg-white py-20 border-t border-border">
      <div className="mx-auto max-w-7xl px-6 space-y-24 md:space-y-32">

        {/* Row 1: Image Left, Text Right */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image Panel with Hotspot */}
          <div className="relative aspect-[4/3] md:aspect-[1.2/1] w-full overflow-hidden shadow-sm bg-slate-50 group">
            <img
              src="/images/showcase/showcase-1.png"
              alt="Stylish model wearing gold statement earrings"
              className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-102"
            />
            {/* Shoppable Hotspot on the Earring */}
            <Hotspot
              top="58%"
              left="54%"
              title="Aurelia Gold Hoops"
              price="$120.00"
              link="/shop"
            />
          </div>

          {/* Text Content */}
          <div className="space-y-6 md:pl-8 max-w-md">
            <h3 className="text-3xl md:text-4xl font-light tracking-wide text-primary font-serif leading-tight">
              Curated by color
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base font-light">
              Brighten up your look with vibrant gemstone jewelry. Discover selected styles crafted in warm gold and colorful tones.
            </p>
            <div className="pt-2">
              <Link href="/shop">
                <Button className="rounded-none bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-xs tracking-widest font-light transition-colors uppercase">
                  Shop Now
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Row 2: Text Left, Image Right */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Text Content (ordered first on mobile, left on desktop) */}
          <div className="space-y-6 max-w-md md:order-1 order-2">
            <h3 className="text-3xl md:text-4xl font-light tracking-wide text-primary font-serif leading-tight">
              Make the connection
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base font-light">
              Introducing your outfit's missing link. Designed to be layered or worn alone as a bold, elegant statement.
            </p>
            <div className="pt-2">
              <Link href="/shop">
                <Button className="rounded-none bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-xs tracking-widest font-light transition-colors uppercase">
                  Shop Now
                </Button>
              </Link>
            </div>
          </div>

          {/* Image Panel with Hotspot (ordered second on mobile, right on desktop) */}
          <div className="relative aspect-[4/3] md:aspect-[1.2/1] w-full overflow-hidden shadow-sm bg-slate-50 group md:order-2 order-1">
            <img
              src="/images/showcase/showcase-2.png"
              alt="Elegant model wearing gold chain link necklace"
              className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-102"
            />
            {/* Shoppable Hotspot on the Necklace */}
            <Hotspot
              top="62%"
              left="73%"
              title="Helix Link Chain"
              price="$240.00"
              link="/shop"
            />
          </div>
        </div>

      </div>
    </section>
  );
}
