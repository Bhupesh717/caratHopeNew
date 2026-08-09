'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable, DTColumn, DTFilter } from '../_components/data-table';
import { FormModal } from '../_components/form-modal';
import { ConfirmDialog } from '../_components/confirm-dialog';
import { DetailModal } from '../_components/detail-modal';
import { couponService } from '../_services/coupon.service';
import { Coupon } from '../_types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const emptyForm = { 
  code: '', 
  discountType: 'percentage' as 'percentage' | 'fixed', 
  discountValue: 0, 
  expiryDate: '', 
  usageLimit: 100, 
  status: 'active' as 'active' | 'inactive' 
};

export default function CouponsPage() {
  const [data, setData] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [viewItem, setViewItem] = useState<Coupon | null>(null);

  const load = useCallback(async () => { 
    setLoading(true); 
    setData(await couponService.getAll()); 
    setLoading(false); 
  }, []);

  useEffect(() => { 
    load(); 
  }, [load]);

  const openAdd = () => { 
    setEditing(null); 
    setForm(emptyForm); 
    setFormOpen(true); 
  };

  const openEdit = (c: Coupon) => { 
    setEditing(c); 
    setForm({ 
      code: c.code, 
      discountType: c.discountType, 
      discountValue: c.discountValue, 
      expiryDate: c.expiryDate.split('T')[0], 
      usageLimit: c.usageLimit, 
      status: c.status 
    }); 
    setFormOpen(true); 
  };

  const handleSave = async () => {
    if (!form.code.trim()) { toast.error('Code is required'); return; }
    if (form.discountValue <= 0) { toast.error('Value must be > 0'); return; }
    setSaving(true);
    const payload = { 
      ...form, 
      expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : new Date().toISOString(),
      status: editing ? form.status : 'active', // default to active on create
    };
    if (editing) { 
      await couponService.update(editing.id, payload); 
    } else { 
      await couponService.create(payload); 
    }
    setSaving(false); 
    setFormOpen(false); 
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true); 
    await couponService.delete(deleteTarget.id); 
    setDeleting(false); 
    setDeleteTarget(null); 
    load();
  };

  const handleToggle = async (c: Coupon) => {
    await couponService.toggleStatus(c.id);
    load();
  };

  const columns: DTColumn<Coupon>[] = [
    { 
      key: 'code', 
      header: 'Code', 
      render: (r) => <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs font-bold">{r.code}</code> 
    },
    { 
      key: 'discountType', 
      header: 'Type', 
      render: (r) => r.discountType === 'percentage' ? 'Percent' : 'Fixed', 
      className: 'hidden md:table-cell' 
    },
    { 
      key: 'discountValue', 
      header: 'Value', 
      render: (r) => r.discountType === 'percentage' ? `${r.discountValue}%` : `₹${r.discountValue}` 
    },
    { 
      key: 'expiryDate', 
      header: 'Expires', 
      render: (r) => format(new Date(r.expiryDate), 'dd MMM yyyy'), 
      className: 'hidden md:table-cell' 
    },
    { 
      key: 'usageCount', 
      header: 'Usage', 
      render: (r) => `${r.usageCount}/${r.usageLimit}`, 
      className: 'hidden lg:table-cell' 
    },
    { 
      key: 'status', 
      header: 'Status', 
      render: (r) => (
        <button
          onClick={() => handleToggle(r)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer select-none",
            r.status === 'active'
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/80"
              : "bg-zinc-50 text-zinc-500 border-zinc-200 hover:bg-zinc-100/80"
          )}
          title={`Click to make ${r.status === 'active' ? 'inactive' : 'active'}`}
        >
          {r.status === 'active' ? (
            <>
              <Eye className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
              <span>Active</span>
            </>
          ) : (
            <>
              <EyeOff className="h-3.5 w-3.5 text-zinc-400" />
              <span>Inactive</span>
            </>
          )}
        </button>
      ) 
    },
  ];

  const filters: DTFilter[] = [
    { 
      key: 'status', 
      label: 'Status', 
      options: [
        { label: 'Active', value: 'active' }, 
        { label: 'Inactive', value: 'inactive' }
      ] 
    },
    { 
      key: 'discountType', 
      label: 'Type', 
      options: [
        { label: 'Percentage', value: 'percentage' }, 
        { label: 'Fixed', value: 'fixed' }
      ] 
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Coupons</h1>
        <p className="text-sm text-muted-foreground">Manage discount codes and promotions.</p>
      </div>

      <DataTable 
        columns={columns} 
        data={data} 
        loading={loading} 
        filters={filters} 
        searchKeys={['code']} 
        onAdd={openAdd} 
        addLabel="Add Coupon"
        actions={(row) => (
          <>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewItem(row)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(row)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(row)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      />

      <FormModal 
        open={formOpen} 
        onOpenChange={setFormOpen} 
        title={editing ? 'Edit Coupon' : 'Add Coupon'} 
        onSubmit={handleSave} 
        loading={saving}
      >
        <div className="space-y-2">
          <Label>Code *</Label>
          <Input 
            placeholder="e.g. JEWELRY25"
            value={form.code} 
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} 
            className="font-mono" 
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Discount Type</Label>
            <Select 
              value={form.discountType} 
              onValueChange={(v: 'percentage' | 'fixed') => setForm({ ...form, discountType: v })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage (%)</SelectItem>
                <SelectItem value="fixed">Fixed (₹)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Value *</Label>
            <Input 
              type="number" 
              min={0} 
              value={form.discountValue} 
              onChange={(e) => setForm({ ...form, discountValue: +e.target.value })} 
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Expiry Date</Label>
            <Input 
              type="date" 
              value={form.expiryDate} 
              onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} 
            />
          </div>
          <div className="space-y-2">
            <Label>Usage Limit</Label>
            <Input 
              type="number" 
              min={1} 
              value={form.usageLimit} 
              onChange={(e) => setForm({ ...form, usageLimit: +e.target.value })} 
            />
          </div>
        </div>
      </FormModal>

      <ConfirmDialog 
        open={!!deleteTarget} 
        onOpenChange={() => setDeleteTarget(null)} 
        title={`Delete coupon "${deleteTarget?.code}"?`} 
        description="This coupon will be permanently removed." 
        onConfirm={handleDelete} 
        loading={deleting} 
      />

      {viewItem && (
        <DetailModal 
          open={!!viewItem} 
          onOpenChange={() => setViewItem(null)} 
          title="Coupon Details"
          fields={[
            { label: 'Code', value: <code className="font-mono font-bold">{viewItem.code}</code> },
            { label: 'Type', value: viewItem.discountType === 'percentage' ? 'Percentage' : 'Fixed Amount' },
            { label: 'Value', value: viewItem.discountType === 'percentage' ? `${viewItem.discountValue}%` : `₹${viewItem.discountValue}` },
            { label: 'Expiry', value: format(new Date(viewItem.expiryDate), 'dd MMM yyyy') },
            { label: 'Usage', value: `${viewItem.usageCount} / ${viewItem.usageLimit}` },
            { 
              label: 'Status', 
              value: (
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-semibold uppercase",
                  viewItem.status === 'active' ? "bg-emerald-100 text-emerald-800" : "bg-zinc-100 text-zinc-800"
                )}>
                  {viewItem.status}
                </span>
              ) 
            },
            { label: 'Created', value: format(new Date(viewItem.createdAt), 'dd MMM yyyy') },
          ]}
        />
      )}
    </div>
  );
}
