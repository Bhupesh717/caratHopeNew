'use client';

import React from 'react';
import { Truck, RefreshCw, Clock, Sparkles } from 'lucide-react';

export function InfoRibbon() {
  return (
    <div className="w-full bg-white border-b border-slate-100 py-4">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 items-center justify-items-center text-center">

          {/* Item 1: Free Shipping */}
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-slate-700 stroke-[1.5]" />
            <span className="text-[10px] md:text-xs font-medium tracking-[0.2em] text-slate-600 uppercase">
              Elegance Delivered, On Us
            </span>
          </div>

          {/* Item 2: Easy Exchanges */}
          <div className="flex items-center gap-3 border-t border-slate-100 pt-4 md:pt-0 md:border-t-0 w-full md:w-auto justify-center">
            <RefreshCw className="h-4 w-4 text-slate-700 stroke-[1.5]" />
            <span className="text-[10px] md:text-xs font-medium tracking-[0.2em] text-slate-600 uppercase">
              Easy Exchanges & Returns
            </span>
          </div>

          {/* Item 3: 24/7 Free Support */}
          <div className="flex items-center gap-3 border-t border-slate-100 pt-4 md:pt-0 md:border-t-0 w-full md:w-auto justify-center">
            <div className="relative flex items-center justify-center">
              <Clock className="h-5 w-5 text-slate-700 stroke-[1.5]" />
              <span className="absolute text-[8px] font-bold text-slate-700 top-[4.5px]">24</span>
            </div>
            <span className="text-[10px] md:text-xs font-medium tracking-[0.2em] text-slate-600 uppercase">
              24/7 Free Support
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
