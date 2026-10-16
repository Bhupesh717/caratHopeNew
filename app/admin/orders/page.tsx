'use client';

import Image from 'next/image';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { Eye, Loader2, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DataTable, DTColumn } from '../_components/data-table';
import { StatusBadge } from '../_components/status-badge';
import { orderService, OrderFilters } from '../_services/order.service';
import { Order, OrderStatus, PaymentStatus } from '../_types';
import { format } from 'date-fns';

const statusOptions: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function OrdersPage() {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // ── Server-side filter state ────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | ''>('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  // Pagination metadata from server
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);

  // Debounce search so we don't fire on every keystroke
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (filters: OrderFilters) => {
    setLoading(true);
    try {
      const result = await orderService.getAll(filters);
      setData(result.data);
      setTotal(result.total);
      setLastPage(result.last_page);
    } catch {
      toast.error('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-fetch whenever filters / pagination change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      load({
        search,
        status: status || undefined,
        payment_status: paymentStatus || undefined,
        per_page: perPage,
        page,
      });
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, status, paymentStatus, page, perPage, load]);

  // Reset page to 1 when filters change (not when page itself changes)
  useEffect(() => {
    setPage(1);
  }, [search, status, paymentStatus, perPage]);

  const handleStatusChange = async (id: string, newStatus: OrderStatus) => {
    try {
      await orderService.updateStatus(id, newStatus);
      toast.success(`Order #${id} status updated to ${newStatus}`);
      load({
        search,
        status: status || undefined,
        payment_status: paymentStatus || undefined,
        per_page: perPage,
        page,
      });
      if (viewOrder && viewOrder.id === id) {
        setViewOrder((prev) => (prev ? { ...prev, orderStatus: newStatus } : null));
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleViewOrder = async (order: Order) => {
    setViewOrder(order);
    if (!order.items || order.items.length === 0) {
      setLoadingDetails(true);
      try {
        const full = await orderService.getById(order.id);
        if (full) {
          setViewOrder(full);
        }
      } catch {
        // keep row data if detail fetch fails
      } finally {
        setLoadingDetails(false);
      }
    }
  };

  const columns: DTColumn<Order>[] = [
    {
      key: 'id',
      header: 'Order ID',
      render: (r) => <span className="font-mono text-xs font-semibold">#{r.id}</span>,
    },
    {
      key: 'customerName',
      header: 'Customer',
      render: (r) => (
        <div>
          <p className="font-medium text-sm leading-snug">{r.customerName}</p>
          <p className="text-xs text-muted-foreground">{r.customerEmail}</p>
        </div>
      ),
    },
    {
      key: 'items',
      header: 'Items',
      render: (r) => (
        <span className="text-xs font-medium text-muted-foreground">
          {r.itemsCount !== undefined && r.itemsCount > 0 ? r.itemsCount : r.items.length} item{((r.itemsCount ?? r.items.length) !== 1) ? 's' : ''}
        </span>
      ),
      className: 'hidden md:table-cell',
    },
    {
      key: 'totalAmount',
      header: 'Amount',
      render: (r) => (
        <span className="font-semibold text-sm">
          ₹{r.totalAmount.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'paymentStatus',
      header: 'Payment',
      render: (r) => (
        <div className="flex flex-col gap-1 items-start">
          <StatusBadge status={r.paymentStatus} />
          {r.paymentMethod && (
            <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {r.paymentMethod}
            </span>
          )}
        </div>
      ),
      className: 'hidden md:table-cell',
    },
    {
      key: 'orderStatus',
      header: 'Status',
      render: (r) => (
        <Select value={r.orderStatus} onValueChange={(v: OrderStatus) => handleStatusChange(r.id, v)}>
          <SelectTrigger className="h-7 w-[120px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((s) => (
              <SelectItem key={s} value={s} className="capitalize text-xs">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (r) => (
        <span className="text-xs text-muted-foreground">
          {format(new Date(r.createdAt), 'dd MMM yyyy')}
        </span>
      ),
      className: 'hidden lg:table-cell',
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground">View and manage customer orders.</p>
      </div>

      {/* ── Server-side toolbar ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          {/* Status filter */}
          <Select value={status || '__all__'} onValueChange={(v) => setStatus(v === '__all__' ? '' : (v as OrderStatus))}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Status</SelectItem>
              {statusOptions.map((s) => (
                <SelectItem key={s} value={s} className="capitalize text-xs">
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Payment filter */}
          <Select value={paymentStatus || '__all__'} onValueChange={(v) => setPaymentStatus(v === '__all__' ? '' : (v as PaymentStatus))}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue placeholder="All Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Payment</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        hideToolbar={true}
        serverPagination={{
          page,
          pageSize: perPage,
          total,
          lastPage,
          onPageChange: (p) => setPage(p),
          onPageSizeChange: (ps) => setPerPage(ps),
        }}
        actions={(row) => (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-muted"
            title="View Order Details"
            onClick={() => handleViewOrder(row)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}
      />

      {/* ── Order Detail Modal ── */}
      <Dialog open={!!viewOrder} onOpenChange={() => setViewOrder(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between pr-4">
              <span>Order #{viewOrder?.id}</span>
              {viewOrder && (
                <div className="flex items-center gap-2">
                  <StatusBadge status={viewOrder.orderStatus} />
                  <StatusBadge status={viewOrder.paymentStatus} />
                </div>
              )}
            </DialogTitle>
          </DialogHeader>

          {viewOrder && (
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-4 pr-3 py-1">
                {/* Customer Information */}
                <div>
                  <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Customer Info
                  </h3>
                  <div className="bg-muted/40 p-3 rounded-md text-sm space-y-1">
                    <p className="font-medium text-foreground">{viewOrder.customerName}</p>
                    <p className="text-xs text-muted-foreground">{viewOrder.customerEmail}</p>
                    <p className="text-xs text-muted-foreground">{viewOrder.customerPhone}</p>
                  </div>
                </div>

                {/* Billing Address */}
                {viewOrder.billingAddress && (
                  <div>
                    <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Billing Address
                    </h3>
                    <div className="bg-muted/40 p-3 rounded-md text-xs space-y-0.5">
                      <p>{viewOrder.billingAddress.address || viewOrder.billingAddress.line1}</p>
                      {viewOrder.billingAddress.apartment && <p>{viewOrder.billingAddress.apartment}</p>}
                      <p>
                        {[
                          viewOrder.billingAddress.city,
                          viewOrder.billingAddress.state,
                          viewOrder.billingAddress.zip || viewOrder.billingAddress.pincode,
                          viewOrder.billingAddress.country,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Payment & Gateway details */}
                {(viewOrder.paymentMethod || viewOrder.razorpayPaymentId || viewOrder.razorpayOrderId) && (
                  <div>
                    <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Payment Details
                    </h3>
                    <div className="bg-muted/40 p-3 rounded-md text-xs space-y-1">
                      {viewOrder.paymentMethod && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Method:</span>
                          <span className="font-medium uppercase">{viewOrder.paymentMethod}</span>
                        </div>
                      )}
                      {viewOrder.razorpayOrderId && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Razorpay Order:</span>
                          <span className="font-mono">{viewOrder.razorpayOrderId}</span>
                        </div>
                      )}
                      {viewOrder.razorpayPaymentId && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Payment ID:</span>
                          <span className="font-mono">{viewOrder.razorpayPaymentId}</span>
                        </div>
                      )}
                      {viewOrder.paidAt && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Paid At:</span>
                          <span>{format(new Date(viewOrder.paidAt), 'dd MMM yyyy, hh:mm a')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Items */}
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Items ({viewOrder.itemsCount ?? viewOrder.items.length})
                  </h3>
                  {loadingDetails ? (
                    <div className="flex items-center justify-center py-6 text-sm text-muted-foreground gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading item details…
                    </div>
                  ) : viewOrder.items.length > 0 ? (
                    <div className="space-y-2">
                      {viewOrder.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 rounded-md border bg-card text-card-foreground">
                          {item.productImage ? (
                            <Image
                              src={item.productImage}
                              alt=""
                              width={44}
                              height={44}
                              className="h-11 w-11 rounded object-cover border"
                            />
                          ) : (
                            <div className="h-11 w-11 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                              No img
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.productName}</p>
                            <p className="text-xs text-muted-foreground">
                              Qty: {item.quantity} × ₹{item.price.toLocaleString()}
                            </p>
                          </div>
                          <span className="text-sm font-semibold">
                            ₹{(item.quantity * item.price).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground py-2">
                      {viewOrder.itemsCount ?? 1} item(s) in this order.
                    </p>
                  )}
                </div>

                <Separator />

                {/* Financial Summary */}
                <div className="space-y-1.5 text-xs">
                  {viewOrder.subtotalAmount !== undefined && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>₹{viewOrder.subtotalAmount.toLocaleString()}</span>
                    </div>
                  )}
                  {Boolean(viewOrder.gstAmount) && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>GST</span>
                      <span>₹{viewOrder.gstAmount?.toLocaleString()}</span>
                    </div>
                  )}
                  {Boolean(viewOrder.discountAmount) && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount</span>
                      <span>-₹{viewOrder.discountAmount?.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1 border-t text-sm font-semibold text-foreground">
                    <span>Total Amount</span>
                    <span className="text-base font-bold">₹{viewOrder.totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground pt-1">
                  Ordered on {format(new Date(viewOrder.createdAt), 'dd MMM yyyy, hh:mm a')}
                </p>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

