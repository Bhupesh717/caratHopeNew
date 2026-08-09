'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { PageHeader } from '@/components/page-header';
import { User, Package, MapPin, Settings, LogOut, Loader2, ArrowRight, Gem } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import Image from 'next/image';

const MOCK_ORDERS = [
  {
    id: 'ORD-8921-X',
    date: '2023-11-15',
    total: 3499.00,
    status: 'Delivered',
    items: [
      { name: 'Diamond Solitaire Necklace', quantity: 1, image: 'https://images.unsplash.com/photo-1599643478514-46b1d1bc678a?q=80&w=200&auto=format&fit=crop' }
    ]
  },
  {
    id: 'ORD-9204-Y',
    date: '2024-02-03',
    total: 899.00,
    status: 'Processing',
    items: [
      { name: 'Pearl & Gold Earrings', quantity: 1, image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=200&auto=format&fit=crop' }
    ]
  }
];

const mapBackendOrder = (o: any) => ({
  id: `ORD-${o.id}`,
  date: o.created_at ? o.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
  total: Number(o.total_amount),
  status: o.order_status,
  items: (o.order_items || []).map((item: any) => ({
    name: item.product_name,
    quantity: item.quantity,
    image: item.product_image || 'https://images.unsplash.com/photo-1599643478514-46b1d1bc678a?q=80&w=200&auto=format&fit=crop',
  })),
});

export default function OrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    setIsMounted(true);

    const loadOrders = async () => {
      if (isAuthenticated) {
        setIsLoading(true);
        try {
          const response = await apiClient.get('/public/orders');
          if (response.data && response.data.success) {
            const mapped = response.data.data.map(mapBackendOrder);
            setOrders(mapped);
          }
        } catch (error) {
          console.error('Failed to fetch backend orders:', error);
          // Fallback to localStorage if guest or offline
          const stored = localStorage.getItem('caratehope-orders');
          if (stored) {
            setOrders(JSON.parse(stored));
          } else {
            setOrders([]);
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        const stored = localStorage.getItem('caratehope-orders');
        if (stored) {
          setOrders(JSON.parse(stored));
        } else {
          setOrders(MOCK_ORDERS);
        }
      }
    };

    loadOrders();
  }, [isAuthenticated]);

  if (!isMounted) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="bg-muted min-h-screen pb-24">
      <PageHeader
        title="My Orders"
        eyebrow="History"
        icon={Package}
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
            <Link href="/orders" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted text-primary font-medium text-sm transition-colors">
              <Package className="w-4 h-4" />
              Order History
            </Link>
            <Link href="/account/bespoke-orders" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors font-medium text-sm">
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
            <h2 className="text-2xl font-serif text-foreground mb-8">Order History</h2>

            <div className="space-y-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <div key={order.id} className="border border-slate-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-wrap gap-4 items-center justify-between mb-6 pb-6 border-b border-slate-50">
                      <div>
                        <p className="text-xs font-semibold tracking-wider uppercase text-slate-500 mb-1">Order Number</p>
                        <p className="font-medium text-slate-900">{order.id}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold tracking-wider uppercase text-slate-500 mb-1">Date Placed</p>
                        <p className="font-medium text-slate-900">{new Date(order.date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold tracking-wider uppercase text-slate-500 mb-1">Total Amount</p>
                        <p className="font-medium text-slate-900">₹{order.total.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${order.status === 'Delivered' || order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-4">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-4">
                            <Image src={item.image} alt={item.name} width={64} height={64} className="w-16 h-16 rounded-xl object-cover animate-in fade-in" />
                            <div>
                              <p className="font-medium text-slate-900">{item.name}</p>
                              <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <p>You have not placed any orders yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
