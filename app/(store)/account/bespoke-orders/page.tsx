'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, Plus, ArrowRight, Package, User, LogOut, Loader2, Gem } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BespokeStatusBadge } from '@/components/bespoke/BespokeStatusBadge';
import { BespokeOrder } from '@/types/bespoke';
import { format } from 'date-fns';
import { useAuthStore } from '@/store/auth';
import { PageHeader } from '@/components/page-header';

// Mock Data
const mockOrders: BespokeOrder[] = [
  {
    id: 'ORD-8921',
    customerId: 'CUST-1',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '1234567890',
    jewelleryType: 'ring',
    metalType: 'Platinum',
    budgetRange: '₹1,00,000+',
    description: 'Custom engagement ring with a halo setting.',
    inspirationImages: [],
    status: 'CAD Design',
    createdAt: '2024-05-20T10:30:00Z',
    updatedAt: '2024-05-25T14:20:00Z',
  },
  {
    id: 'ORD-7634',
    customerId: 'CUST-1',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '1234567890',
    jewelleryType: 'necklace',
    metalType: '18K Yellow Gold',
    budgetRange: '₹50,000 - ₹1,00,000',
    description: 'Pendant necklace with birthstones.',
    inspirationImages: [],
    status: 'Delivered',
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-02-15T11:45:00Z',
  }
];

export default function CustomerBespokeDashboard() {
  const router = useRouter();
  const { logout, isAuthenticated } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="bg-muted min-h-screen pb-24">
      <PageHeader
        title="Bespoke Orders"
        eyebrow="My Account"
        icon={Gem}
        imageSrc="/page_heaer.png"
      />

      <div className="mx-auto max-w-6xl px-6 pt-16">
        <div className="grid md:grid-cols-[250px_1fr] gap-10">

          {/* Sidebar Menu */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-border/60 h-fit space-y-2">
            <Link href="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors font-medium text-sm">
              <User className="w-4 h-4" />
              Profile Info
            </Link>
            <Link href="/orders" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors font-medium text-sm">
              <Package className="w-4 h-4" />
              Order History
            </Link>
            <Link href="/account/bespoke-orders" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted text-primary font-medium text-sm transition-colors">
              <Gem className="w-4 h-4" />
              Bespoke Orders
            </Link>
            <div className="pt-4 mt-4 border-t border-slate-100">
              <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors font-medium text-sm">
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-border/60">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-2xl font-serif text-foreground mb-2">My Bespoke Creations</h2>
                <p className="text-slate-500 text-sm">Track the progress of your custom jewellery orders.</p>
              </div>
              <Link href="/bespoke-jewellery/request">
                <Button className="bg-primary text-white hover:bg-primary/90 w-full md:w-auto rounded-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  New Request
                </Button>
              </Link>
            </div>

            {/* Orders List */}
            {mockOrders.length === 0 ? (
              <div className="border border-dashed border-slate-200 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-serif mb-2 text-foreground">No Bespoke Orders Yet</h3>
                <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                  You haven't requested any custom jewellery yet. Start your bespoke journey to create something truly unique.
                </p>
                <Link href="/bespoke-jewellery/request">
                  <Button className="bg-primary text-white hover:bg-primary/90 rounded-xl">
                    Create Your First Piece
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-6">
                {mockOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-slate-100 rounded-2xl p-6 hover:shadow-md transition-shadow group relative overflow-hidden bg-white"
                  >
                    <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">

                      {/* Left Side: Order Info */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="bg-muted rounded-xl p-4 flex items-center justify-center text-primary font-serif text-2xl uppercase w-16 h-16 shrink-0 border border-border/40">
                            {order.jewelleryType.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-lg font-serif text-foreground capitalize">
                              Bespoke {order.jewelleryType}
                            </h3>
                            <p className="text-xs text-slate-500 font-mono mt-1">
                              Ref: {order.id} • {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-2">
                          <span className="flex items-center gap-1.5 bg-muted/60 border border-border/30 px-3 py-1 rounded-full">
                            Metal: <strong className="text-slate-800 font-medium">{order.metalType}</strong>
                          </span>
                          <span className="flex items-center gap-1.5 bg-muted/60 border border-border/30 px-3 py-1 rounded-full">
                            Budget: <strong className="text-slate-800 font-medium">{order.budgetRange}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Right Side: Status & Actions */}
                      <div className="flex flex-col md:items-end justify-between border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-6">
                        <div className="mb-6 md:mb-0">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-2 md:text-right">Current Status</span>
                          <BespokeStatusBadge status={order.status} className="text-xs px-3 py-1.5" />
                        </div>

                        <Link href={`/account/bespoke-orders/${order.id}`} className="w-full md:w-auto">
                          <Button variant="outline" className="w-full md:w-auto rounded-xl border-border text-primary hover:bg-muted hover:text-primary/90 group-hover:border-primary transition-all">
                            View Details
                            <ArrowRight className="w-4 h-4 ml-2 text-slate-400 group-hover:text-primary transition-colors" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
