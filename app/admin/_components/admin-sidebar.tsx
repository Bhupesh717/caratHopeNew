'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Image as ImageIcon,
  Layers3,
  Package,
  TicketPercent,
  ShoppingCart,
  Users,
  LogOut,
  Gem,
  MessageSquare,
  Tags,
  Link as LinkIcon,
  Globe,
  Clock,
  Truck,
  List,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useAdminAuthStore } from '../_store/admin-auth';

const menuGroups = [
  {
    label: 'Menu',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { label: 'Banners', href: '/admin/banners', icon: ImageIcon },
      { label: 'Products', href: '/admin/products', icon: Package },
      { label: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
      { label: 'Personalised', href: '/admin/personalised-orders', icon: Gem },
      { label: 'Coupons', href: '/admin/coupons', icon: TicketPercent },
      { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
      { label: 'Users', href: '/admin/users', icon: Users },
    ],
  },
  {
    label: 'Product Masters',
    items: [
      { label: 'Categories', href: '/admin/product-masters/categories', icon: Layers3 },
      { label: 'Attributes', href: '/admin/product-masters/attributes', icon: Tags },
      { label: 'Category Mappings', href: '/admin/product-masters/category-attributes', icon: LinkIcon },
      { label: 'Regions', href: '/admin/product-masters/regions', icon: Globe },
      { label: 'Processing Profiles', href: '/admin/product-masters/processing-profiles', icon: Clock },
      { label: 'Shipping Profiles', href: '/admin/product-masters/shipping-profiles', icon: Truck },
      { label: 'Static Dropdowns', href: '/admin/product-masters/product-options', icon: List },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { adminLogout } = useAdminAuthStore();

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="p-4">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Gem className="h-4 w-4" />
          </div>
          <span className="text-base font-bold tracking-tight group-data-[collapsible=icon]:hidden">
            CaratHope
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {menuGroups.map((group, index) => (
          <SidebarGroup key={index}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href)}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Logout"
              onClick={() => { adminLogout(); window.location.href = '/admin/login'; }}
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
