'use client';

import React from 'react';
import { Gem, Award, ShieldCheck, PenTool, Truck, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function WhyChooseUs() {
  const features = [
    { icon: <Gem className="h-4 w-4" />, title: 'Certified Gold', desc: 'Every piece is accompanied by international grading certificates.' },
    { icon: <Award className="h-4 w-4" />, title: 'Finest Quality', desc: 'Handcrafted by expert artisans with generations of experience.' },
    { icon: <ShieldCheck className="h-4 w-4" />, title: 'Lifetime Exchange Policy', desc: 'Trade in or upgrade your pieces at any time, hassle-free.' },
    { icon: <PenTool className="h-4 w-4" />, title: 'Bespoke Custom Designs', desc: 'Co-create your dream design with our lead jewelry illustrators.' },
    { icon: <Sparkles className="h-4 w-4" />, title: 'Gift-Worthy', desc: 'Exquisitely packaged for your special moments.' },
    { icon: <Truck className="h-4 w-4" />, title: 'Free Insured Global Shipping', desc: 'Secure doorstep delivery with full insurance coverage.' },
  ];

  return (
    <section className="w-full bg-background py-24 md:py-32 overflow-hidden border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-8 sm:px-12 lg:px-16">
        <div className="grid lg:grid-cols-12 gap-16 items-center">

          {/* Left Column — Content & Features */}
          <div className="lg:col-span-7 space-y-12">

            {/* Elegant Header Block */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-amber-500 text-base select-none">◆</span>
                <span className="text-[9px] tracking-[0.32em] uppercase text-slate-400 font-semibold">
                  CaratHope Excellence
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-light font-serif tracking-tight text-emerald-dark leading-[1.1]">
                An unwavering promise of <span className="italic text-primary">perfection.</span>
              </h2>
            </div>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-8 pt-4">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-transparent border-[1.5px] border-emerald-accent text-emerald-accent">
                    {feature.icon}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-emerald-dark transition-colors group-hover:text-emerald-accent">
                      {feature.title}
                    </h4>
                    <p className="text-xs text-slate-400 font-light leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Link */}
            <div className="pt-4">
              <Link
                href="/shop"
                className="inline-flex items-center group text-[11px] tracking-[0.28em] font-semibold text-emerald-dark uppercase border-b border-slate-300 hover:border-emerald-accent hover:text-emerald-accent pb-1 transition-all duration-300"
              >
                <span>Shop Our Collection</span>
                <span className="ml-2.5 transform group-hover:translate-x-1.5 transition-transform duration-300">→</span>
              </Link>
            </div>
          </div>

          {/* Right Column — Premium Showcase Cards */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="flex gap-6 w-full max-w-[450px] lg:max-w-none">

              {/* Card 1 (Shifted down) */}
              <div className="relative w-1/2 mt-12 group">
                <div className="relative aspect-[3/4] overflow-hidden border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                  <Image
                    src="/images/products/ruby_necklace.png"
                    alt="Royal Ruby Necklace"
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                </div>
                <div className="absolute -bottom-4 left-3 right-3 bg-white/95 backdrop-blur-md p-3 text-center border border-slate-100 shadow-lg">
                  <h4 className="text-[13px] font-medium text-slate-800 whitespace-nowrap">Royal Ruby</h4>
                  <p className="text-[8px] font-semibold tracking-widest text-amber-600 uppercase mt-0.5">Exclusive Piece</p>
                </div>
              </div>

              {/* Card 2 (Higher) */}
              <div className="relative w-1/2 mb-12 group">
                <div className="relative aspect-[3/4] overflow-hidden border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                  <Image
                    src="/images/products/luxury_diamond_ring.png"
                    alt="Eternity Diamond Ring"
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                </div>
                <div className="absolute -bottom-4 left-3 right-3 bg-white/95 backdrop-blur-md p-3 text-center border border-slate-100 shadow-lg">
                  <h4 className="text-[13px] font-medium text-slate-800 whitespace-nowrap">Eternity Ring</h4>
                  <p className="text-[8px] font-semibold tracking-widest text-amber-600 uppercase mt-0.5">Bridal Heritage</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
