'use client';

import React from 'react';
import { useUiStore } from '@/store/ui';
import Image from 'next/image';

export function GlobalLoader() {
  const loadingCount = useUiStore((state) => state.loadingCount);

  if (loadingCount === 0) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/70 backdrop-blur-xl">

      {/* Ambient glow */}
      <div className="absolute w-72 h-72 rounded-full bg-primary/10 blur-3xl animate-pulse" />

      {/* Loader Container */}
      <div className="relative flex items-center justify-center w-36 h-36 mb-8">

        {/* Outer faint ring */}
        <div className="absolute inset-0 rounded-full border border-primary/10" />

        {/* Faint dashed ring for texture */}
        <div className="absolute inset-2 rounded-full border border-dashed border-primary/15" />

        {/* Orbiting diamond — travels around the ring */}
        <div className="absolute inset-0 animate-[spin_2s_cubic-bezier(0.65,0,0.35,1)_infinite]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="bg-background rounded-full p-1 shadow-lg shadow-primary/40">
              <Image
                src="/logo_diamond.png"
                alt="diamond"
                width={20}
                height={20}
                className="object-contain drop-shadow-[0_0_6px_rgba(212,162,76,0.6)]"
              />
            </div>
          </div>
        </div>

        {/* Trailing faint arc behind the diamond */}
        <svg
          className="absolute inset-0 w-full h-full animate-[spin_2s_cubic-bezier(0.65,0,0.35,1)_infinite]"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="40 280"
            className="text-primary/50"
          />
        </svg>

        {/* Center logo plate */}
        <div className="relative flex items-center justify-center w-20 h-20 z-10">
          <Image
            src="/logo11.png"
            alt="CaratHope"
            width={52}
            height={52}
            className="object-contain w-3/5 h-auto"
            priority
          />
        </div>
      </div>

      {/* Branding */}
      <div className="flex flex-col items-center gap-2 relative z-10">
        <p className="text-sm font-semibold tracking-[0.35em] uppercase text-foreground">
          CaratHope
        </p>
        <div className="flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1 h-1 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1 h-1 rounded-full bg-primary/60 animate-bounce" />
        </div>
      </div>
    </div>
  );
}