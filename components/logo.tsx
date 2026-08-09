'use client';

import Image from 'next/image';

interface LogoProps {
  /** Tailwind height class for the wrapper, e.g. "h-20" or "h-14" */
  className?: string;
  textColorClass?: string;
  /** Tailwind text-size classes for the brand name, e.g. "text-2xl md:text-3xl" */
  textSizeClass?: string;
  /** Hide the brand text (for footer / login / register pages that only want the icon) */
  iconOnly?: boolean;
}

export function Logo({
  className = 'h-20',
  textColorClass = 'text-foreground',
  textSizeClass = 'text-4xl md:text-5xl lg:text-6xl',
  iconOnly = false,
}: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      {/* Logo image — native scaling with height */}
      <img
        src="/logo.png"
        alt="CaratHope logo"
        className="h-full w-auto object-contain"
      />
    </div>
  );
}
