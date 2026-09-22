'use client';

import React from 'react';
import { useUiStore } from '@/store/ui';
import Image from 'next/image';

export function GlobalLoader() {
  const loadingCount = useUiStore((state) => state.loadingCount);

  if (loadingCount === 0) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/80 backdrop-blur-xl">

      {/* Ambient glow */}
      <div className="absolute w-72 h-72 rounded-full bg-primary/10 blur-3xl animate-pulse" />

      {/* Center logo plate */}
      <div className="relative flex items-center justify-center w-28 h-28 mb-6 z-10">
        <Image
          src="/logo11.png"
          alt="CaratHope"
          width={80}
          height={80}
          className="object-contain w-auto h-20 drop-shadow-[0_2px_12px_rgba(212,162,76,0.25)]"
          priority
        />
      </div>

      {/* Branding & Bottom Dots */}
      <div className="flex flex-col items-center gap-2.5 relative z-10">
        <p className="text-lg font-semibold tracking-[0.35em] uppercase text-foreground font-serif">
          CaratHope
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
        </div>
      </div>
    </div>
  );
}