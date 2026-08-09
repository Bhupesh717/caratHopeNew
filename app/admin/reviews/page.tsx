'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Eye, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable, DTColumn, DTFilter } from '../_components/data-table';
import { ConfirmDialog } from '../_components/confirm-dialog';
import { DetailModal } from '../_components/detail-modal';
import { StatusBadge } from '../_components/status-badge';
import { reviewService, Review } from '../_services/review.service';
import { format } from 'date-fns';
import { Star } from 'lucide-react';

export default function ReviewsPage() {
  const [data, setData] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [viewItem, setViewItem] = useState<Review | null>(null);

  const load = useCallback(async () => { 
    setLoading(true); 
    setData(await reviewService.getAll()); 
    setLoading(false); 
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleUpdateStatus = async (r: Review, newStatus: 'approved' | 'rejected') => {
    try {
      await reviewService.updateStatus(r.id, newStatus);
      toast.success(`Review ${newStatus} successfully.`);
      load();
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true); 
    try {
      await reviewService.delete(deleteTarget.id); 
      toast.success('Review deleted.');
    } catch (err) {
      toast.error('Failed to delete review.');
    } finally {
      setDeleting(false); 
      setDeleteTarget(null); 
      load();
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${i < rating ? 'fill-yellow-500 text-yellow-500' : 'text-neutral-200'}`}
          />
        ))}
      </div>
    );
  };

  const columns: DTColumn<Review>[] = [
    { 
      key: 'product', 
      header: 'Product', 
      render: (r) => (
        <span className="font-semibold text-foreground truncate max-w-[200px] inline-block">{r.product?.name || 'Unknown'}</span>
      ) 
    },
    { key: 'user', header: 'Customer', render: (r) => r.user?.name || 'Unknown' },
    { key: 'rating', header: 'Rating', render: (r) => renderStars(r.rating) },
    { key: 'comment', header: 'Comment', className: 'hidden lg:table-cell', render: (r) => <span className="truncate max-w-[200px] inline-block">{r.comment || '-'}</span> },
    { key: 'created_at', header: 'Date', render: (r) => format(new Date(r.created_at), 'dd MMM yyyy') },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const filters: DTFilter[] = [
    { 
      key: 'status', 
      label: 'Status', 
      options: [
        { label: 'Approved', value: 'approved' }, 
        { label: 'Pending', value: 'pending' },
        { label: 'Rejected', value: 'rejected' }
      ] 
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Reviews</h1>
        <p className="text-sm text-muted-foreground">Manage product reviews and ratings.</p>
      </div>

      <DataTable 
        columns={columns} 
        data={data} 
        loading={loading} 
        filters={filters} 
        searchKeys={['comment']} 
        searchPlaceholder="Search reviews..."
        actions={(row) => (
          <>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewItem(row)}><Eye className="h-4 w-4" /></Button>
            
            {row.status !== 'approved' && (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600" onClick={() => handleUpdateStatus(row, 'approved')} title="Approve">
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}
            
            {row.status !== 'rejected' && (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600" onClick={() => handleUpdateStatus(row, 'rejected')} title="Reject">
                <XCircle className="h-4 w-4" />
              </Button>
            )}

            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(row)}><Trash2 className="h-4 w-4" /></Button>
          </>
        )}
      />

      <ConfirmDialog 
        open={!!deleteTarget} 
        onOpenChange={() => setDeleteTarget(null)} 
        title={`Delete Review?`} 
        description="This review will be permanently removed." 
        onConfirm={handleDelete} 
        loading={deleting} 
      />

      {viewItem && (
        <DetailModal 
          open={!!viewItem} 
          onOpenChange={() => setViewItem(null)} 
          title="Review Details"
          fields={[
            { label: 'Product', value: viewItem.product?.name },
            { label: 'Customer', value: viewItem.user?.name },
            { label: 'Rating', value: renderStars(viewItem.rating) },
            { label: 'Comment', value: viewItem.comment || '-' },
            { label: 'Submitted', value: format(new Date(viewItem.created_at), 'dd MMM yyyy, hh:mm a') },
            { label: 'Status', value: <StatusBadge status={viewItem.status} /> },
          ]}
        />
      )}
    </div>
  );
}
