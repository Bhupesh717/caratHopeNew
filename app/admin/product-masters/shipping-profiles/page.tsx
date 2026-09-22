'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Pencil, Trash2, Truck, Settings2, PackagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { DataTable, DTColumn } from '../../_components/data-table';
import { FormModal } from '../../_components/form-modal';
import { ConfirmDialog } from '../../_components/confirm-dialog';
import { shippingProfileService } from '../../_services/shipping-profile.service';
import { AdminShippingProfile } from '../../_types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const emptyForm = { name: '', origin_pincode: '', origin_country_code: 'IN', is_active: true, is_default: false };

export default function ShippingProfilesPage() {
  const router = useRouter();
  const [data, setData] = useState<AdminShippingProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminShippingProfile | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminShippingProfile | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await shippingProfileService.getAll());
    } catch (e) {
      toast.error('Failed to load shipping profiles');
    }
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

  const openEdit = (p: AdminShippingProfile) => {
    setEditing(p);
    setForm({
      name: p.name,
      origin_pincode: p.origin_pincode,
      origin_country_code: p.origin_country_code,
      is_active: p.is_active ?? true,
      is_default: p.is_default
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.origin_pincode.trim() || !form.origin_country_code.trim()) {
      toast.error('Name, Pincode, and Country Code are required');
      return;
    }
    if (form.origin_country_code.length !== 2) {
      toast.error('Country code must be exactly 2 letters');
      return;
    }
    setSaving(true);
    const payload = { ...form, origin_country_code: form.origin_country_code.toUpperCase() };

    try {
      if (editing) {
        await shippingProfileService.update(editing.id, payload);
        toast.success('Profile updated');
      } else {
        await shippingProfileService.create(payload);
        toast.success('Profile created');
      }
      setFormOpen(false);
      load();
    } catch (e) {
      toast.error('Failed to save shipping profile');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await shippingProfileService.delete(deleteTarget.id);
      toast.success('Profile deleted');
      setDeleteTarget(null);
      load();
    } catch (e: any) {
      if (e?.response?.status === 422) {
        toast.error('Cannot delete profile because it is still used by active listings.');
      } else {
        toast.error('Failed to delete profile');
      }
    }
    setDeleting(false);
  };

  const columns: DTColumn<AdminShippingProfile>[] = [
    {
      key: 'name',
      header: 'Profile Name',
      className: 'font-semibold text-slate-800',
      render: (r) => (
        <div className="flex items-center gap-2">
          {r.name}
          {r.is_default && (
            <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-transparent text-[10px] uppercase">
              Default
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'origin',
      header: 'Origin',
      render: (r) => <span className="font-medium text-slate-600">{r.origin_pincode}, {r.origin_country_code}</span>
    },
    {
      key: 'products_count',
      header: 'Usage',
      render: (r) => (
        <span className="text-sm text-slate-500">
          {r.products_count} active listing{r.products_count !== 1 ? 's' : ''}
        </span>
      )
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (r) => (
        <span className={cn(
          "px-2 py-0.5 rounded-full text-xs font-medium uppercase",
          r.is_active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-zinc-50 text-zinc-500 border border-zinc-200"
        )}>
          {r.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-900 to-blue-700 p-8 text-white shadow-lg">
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm border border-white/30">
            <Truck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Shipping Profiles</h1>
            <p className="mt-2 text-blue-100">Manage shipping rates, methods, and origins across your products.</p>
          </div>
        </div>
        <div className="absolute -right-10 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="p-6">
            <DataTable
              columns={columns}
              data={data}
              loading={loading}
              searchKeys={['name', 'origin_pincode']}
              onAdd={openAdd}
              addLabel="Add Profile"
              actions={(row) => (
                <>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" title="Manage Rates & Methods" onClick={() => router.push(`/admin/product-masters/shipping-profiles/${row.id}`)}>
                    <PackagePlus className="h-4 w-4" />
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
          </div>
        </CardContent>
      </Card>

      <FormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editing ? 'Edit Profile' : 'Add Profile'}
        onSubmit={handleSave}
        loading={saving}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Profile Name *</Label>
            <Input placeholder="e.g. Free shipping, Heavy Items" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Origin Pincode *</Label>
              <Input placeholder="e.g. 302001" value={form.origin_pincode} onChange={(e) => setForm({ ...form, origin_pincode: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Country Code (2 Letters) *</Label>
              <Input placeholder="e.g. IN, US" maxLength={2} value={form.origin_country_code} onChange={(e) => setForm({ ...form, origin_country_code: e.target.value.toUpperCase() })} />
            </div>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-center space-x-2">
              <Switch id="is_active" checked={form.is_active} onCheckedChange={(c) => setForm({ ...form, is_active: c })} />
              <Label htmlFor="is_active">Active (Available for products)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="is_default" checked={form.is_default} onCheckedChange={(c) => setForm({ ...form, is_default: c })} />
              <Label htmlFor="is_default">Default Profile</Label>
            </div>
          </div>
        </div>
      </FormModal>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="Are you sure you want to delete this profile? You cannot delete profiles that have active products."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
