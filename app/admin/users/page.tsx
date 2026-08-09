'use client';

import Image from 'next/image';

import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Eye, Trash2, UserCheck, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable, DTColumn, DTFilter } from '../_components/data-table';
import { ConfirmDialog } from '../_components/confirm-dialog';
import { DetailModal } from '../_components/detail-modal';
import { StatusBadge } from '../_components/status-badge';
import { userService } from '../_services/user.service';
import { AppUser } from '../_types';
import { format } from 'date-fns';

export default function UsersPage() {
  const [data, setData] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<AppUser | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [viewItem, setViewItem] = useState<AppUser | null>(null);

  const load = useCallback(async () => { setLoading(true); setData(await userService.getAll()); setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);

  const handleToggle = async (u: AppUser) => {
    await userService.toggleStatus(u.id);
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true); 
    await userService.delete(deleteTarget.id); 
    setDeleting(false); 
    setDeleteTarget(null); 
    load();
  };

  const columns: DTColumn<AppUser>[] = [
    { 
      key: 'name', 
      header: 'Name', 
      render: (r) => (
        <div className="flex items-center gap-3">
          <Image src={r.avatar} alt="" width={32} height={32} className="h-8 w-8 rounded-full object-cover border" />
          <span className="font-semibold text-foreground">{r.name}</span>
        </div>
      ) 
    },
    { key: 'email', header: 'Email', className: 'hidden md:table-cell' },
    { key: 'phone', header: 'Phone', className: 'hidden lg:table-cell' },
    { key: 'orderCount', header: 'Orders', className: 'hidden md:table-cell' },
    { key: 'totalSpent', header: 'Spent', render: (r) => `₹${r.totalSpent.toLocaleString()}`, className: 'hidden lg:table-cell' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const filters: DTFilter[] = [{ key: 'status', label: 'Status', options: [{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }] }];

  return (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-bold">Users</h1><p className="text-sm text-muted-foreground">Manage registered customers.</p></div>

      <DataTable columns={columns} data={data} loading={loading} filters={filters} searchKeys={['name', 'email', 'phone']} searchPlaceholder="Search by name, email…"
        actions={(row) => (
          <>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewItem(row)}><Eye className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggle(row)} title={row.status === 'active' ? 'Deactivate' : 'Activate'}>
              {row.status === 'active' ? <UserX className="h-4 w-4 text-amber-600" /> : <UserCheck className="h-4 w-4 text-emerald-600" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(row)}><Trash2 className="h-4 w-4" /></Button>
          </>
        )}
      />

      <ConfirmDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)} title={`Delete "${deleteTarget?.name}"?`} description="This user will be permanently removed." onConfirm={handleDelete} loading={deleting} />

      {viewItem && (
        <DetailModal open={!!viewItem} onOpenChange={() => setViewItem(null)} title="User Details"
          fields={[
            { label: 'Avatar', value: <Image src={viewItem.avatar} alt="" width={64} height={64} className="h-16 w-16 rounded-full object-cover" /> },
            { label: 'Name', value: viewItem.name },
            { label: 'Email', value: viewItem.email },
            { label: 'Phone', value: viewItem.phone },
            { label: 'Registered', value: format(new Date(viewItem.registrationDate), 'dd MMM yyyy') },
            { label: 'Orders', value: viewItem.orderCount },
            { label: 'Total Spent', value: `₹${viewItem.totalSpent.toLocaleString()}` },
            { label: 'Status', value: <StatusBadge status={viewItem.status} /> },
          ]}
        />
      )}
    </div>
  );
}
