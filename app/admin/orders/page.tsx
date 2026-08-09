'use client';

import Image from 'next/image';

import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DataTable, DTColumn, DTFilter } from '../_components/data-table';
import { StatusBadge } from '../_components/status-badge';
import { orderService } from '../_services/order.service';
import { Order, OrderStatus } from '../_types';
import { format } from 'date-fns';

const statusOptions: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function OrdersPage() {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);

  const load = useCallback(async () => { setLoading(true); setData(await orderService.getAll()); setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    await orderService.updateStatus(id, status);
    load();
  };

  const columns: DTColumn<Order>[] = [
    { key: 'id', header: 'Order ID', render: (r) => <span className="font-mono text-xs">{r.id}</span> },
    { key: 'customerName', header: 'Customer' },
    { key: 'items', header: 'Items', render: (r) => r.items.length, className: 'hidden md:table-cell' },
    { key: 'totalAmount', header: 'Amount', render: (r) => `₹${r.totalAmount.toLocaleString()}` },
    { key: 'paymentStatus', header: 'Payment', render: (r) => <StatusBadge status={r.paymentStatus} />, className: 'hidden md:table-cell' },
    { key: 'orderStatus', header: 'Status', render: (r) => (
      <Select value={r.orderStatus} onValueChange={(v: OrderStatus) => handleStatusChange(r.id, v)}>
        <SelectTrigger className="h-7 w-[120px] text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>{statusOptions.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
      </Select>
    )},
    { key: 'createdAt', header: 'Date', render: (r) => format(new Date(r.createdAt), 'dd MMM yyyy'), className: 'hidden lg:table-cell' },
  ];

  const filters: DTFilter[] = [
    { key: 'orderStatus', label: 'Status', options: statusOptions.map((s) => ({ label: s.charAt(0).toUpperCase() + s.slice(1), value: s })) },
    { key: 'paymentStatus', label: 'Payment', options: [{ label: 'Paid', value: 'paid' }, { label: 'Unpaid', value: 'unpaid' }, { label: 'Refunded', value: 'refunded' }] },
  ];

  return (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-bold">Orders</h1><p className="text-sm text-muted-foreground">View and manage customer orders.</p></div>

      <DataTable columns={columns} data={data} loading={loading} filters={filters} searchKeys={['id', 'customerName', 'customerEmail']} searchPlaceholder="Search by ID or customer…"
        actions={(row) => (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewOrder(row)}><Eye className="h-4 w-4" /></Button>
        )}
      />

      {/* Order detail modal */}
      <Dialog open={!!viewOrder} onOpenChange={() => setViewOrder(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Order {viewOrder?.id}</DialogTitle></DialogHeader>
          {viewOrder && (
            <ScrollArea className="max-h-[65vh]">
              <div className="space-y-4 pr-4">
                {/* Customer info */}
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Customer</h3>
                  <p className="text-sm font-medium">{viewOrder.customerName}</p>
                  <p className="text-sm text-muted-foreground">{viewOrder.customerEmail}</p>
                  <p className="text-sm text-muted-foreground">{viewOrder.customerPhone}</p>
                </div>
                <Separator />
                {/* Items */}
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Items</h3>
                  <div className="space-y-2">
                    {viewOrder.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Image src={item.productImage} alt="" width={40} height={40} className="h-10 w-10 rounded object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                        </div>
                        <span className="text-sm font-medium">₹{(item.quantity * item.price).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                {/* Summary */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Total</span>
                  <span className="text-lg font-bold">₹{viewOrder.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div><span className="text-xs text-muted-foreground">Payment: </span><StatusBadge status={viewOrder.paymentStatus} /></div>
                  <div><span className="text-xs text-muted-foreground">Status: </span><StatusBadge status={viewOrder.orderStatus} /></div>
                </div>
                <p className="text-xs text-muted-foreground">Ordered: {format(new Date(viewOrder.createdAt), 'dd MMM yyyy, hh:mm a')}</p>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
