'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function AboutSection() {
  return (
    <section className="w-full bg-muted overflow-hidden border-t border-slate-100">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[580px]">

        {/* Left — Content Panel */}
        <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-24 py-20 lg:py-28 space-y-8">

          {/* Elegant eyebrow — no logo */}
          <div className="flex items-center gap-3">
            <span className="text-gold-primary text-base select-none">◆</span>
            <span className="text-[9px] tracking-[0.32em] uppercase text-slate-400 font-semibold">
              Fine Jewellery · Since 2010
            </span>
          </div>

          {/* Main headline */}
          <div className="space-y-1">
            <h2 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extralight font-serif tracking-tight text-emerald-dark leading-[1.08]">
              Crafted with precision,
            </h2>
            <h2 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-serif tracking-tight leading-[1.08] italic text-primary font-light">
              worn with love.
            </h2>
          </div>

          {/* Italic tagline / quote */}
          <p className="text-xs sm:text-sm tracking-wide text-slate-400 font-light italic border-l-2 border-gold-light pl-4 max-w-xs leading-relaxed">
            "Every piece we craft holds a story — your story."
          </p>

          {/* Body copy */}
          <div className="space-y-4 text-slate-500 text-sm sm:text-[15px] leading-relaxed font-light max-w-md">
            <p>
              Behind our 15-year legacy is a panel of master jewellers who have scoured the globe in pursuit of the rarest, most extraordinary gems — each piece selected for its unmatched brilliance and enduring beauty.
            </p>
            <p>
              Shop the finest earrings, rings, bracelets, watches, silver, and the most luxurious gemstones — all ethically sourced.
            </p>
          </div>

          {/* Stats row with vertical dividers */}
          <div className="flex items-center gap-0 pt-2 divide-x divide-slate-200">
            {[
              { value: '15+', label: 'Years' },
              { value: '10K+', label: 'Clients' },
              { value: '50+', label: 'Countries' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col pr-8 pl-0 first:pl-0 [&:not(:first-child)]:pl-8">
                <span className="text-2xl sm:text-3xl font-light font-serif text-slate-900">{stat.value}</span>
                <span className="text-[9px] tracking-[0.25em] uppercase text-slate-400 font-medium mt-0.5">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div>
            <Link
              href="/about"
              className="inline-flex items-center group text-[11px] tracking-[0.28em] font-semibold text-emerald-dark uppercase border-b border-slate-300 hover:border-gold-primary hover:text-gold-primary pb-1 transition-all duration-300"
            >
              <span>Our Story</span>
              <span className="ml-2.5 transform group-hover:translate-x-1.5 transition-transform duration-300">→</span>
            </Link>
          </div>
        </div>

        {/* Right — Full-bleed Image Panel */}
        <div className="relative min-h-[400px] lg:min-h-full overflow-hidden">
          <Image
            src="/images/about/about-2.png"
            alt="Luxury Diamond Rings winding inside Champagne Ribbon"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center transition-transform duration-1000 ease-out hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-transparent pointer-events-none" />
        </div>

      </div>
    </section>
  );
}
