'use client';

import { usePathname } from 'next/navigation';
import React from 'react';

export function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <main className="min-h-screen">
      {children}
    </main>
  );
}
