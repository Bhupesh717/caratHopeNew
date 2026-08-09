'use client';

import { usePathname } from 'next/navigation';
import React from 'react';

export function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <main className={`min-h-screen ${isHome ? 'pt-32' : 'pt-24'}`}>
      {children}
    </main>
  );
}
