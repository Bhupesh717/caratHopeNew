'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from './_components/admin-sidebar';
import { AdminTopbar } from './_components/admin-topbar';
import { useAdminAuthStore } from './_store/admin-auth';
import { Toaster } from 'sonner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdminAuthenticated } = useAdminAuthStore();
  const [hydrated, setHydrated] = useState(false);

  // Wait for zustand hydration from localStorage
  useEffect(() => { setHydrated(true); }, []);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!hydrated) return;
    if (!isAdminAuthenticated && !isLoginPage) {
      router.replace('/admin/login');
    }
    if (isAdminAuthenticated && isLoginPage) {
      router.replace('/admin');
    }
  }, [hydrated, isAdminAuthenticated, isLoginPage, router]);

  // Show spinner while hydrating to prevent flash
  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Login page — no sidebar/topbar, minimal layout
  if (isLoginPage) {
    return (
      <>
        {children}
        <Toaster richColors position="top-right" />
      </>
    );
  }

  // Authenticated admin shell
  if (!isAdminAuthenticated) return null;

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <AdminTopbar />
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
      <Toaster richColors position="top-right" />
    </SidebarProvider>
  );
}
