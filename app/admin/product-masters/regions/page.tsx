'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Pencil, Trash2, Globe, Settings2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { DataTable, DTColumn } from '../../_components/data-table';
import { FormModal } from '../../_components/form-modal';
import { ConfirmDialog } from '../../_components/confirm-dialog';
import { regionService } from '../../_services/region.service';
import { AdminRegion } from '../../_types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const emptyForm = { name: '', code: '', currency_code: '', currency_symbol: '', tax_rate: 0, is_active: true, is_default: false };

export default function RegionsPage() {
  const [data, setData] = useState<AdminRegion[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminRegion | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminRegion | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await regionService.getAll());
    } catch (e) {
      toast.error('Failed to load regions');
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

  const openEdit = (r: AdminRegion) => {
    setEditing(r);
    setForm({
      name: r.name,
      code: r.code || '',
      currency_code: r.currency_code,
      currency_symbol: r.currency_symbol,
      tax_rate: r.tax_rate || 0,
      is_active: r.is_active ?? true,
      is_default: r.is_default
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.currency_code.trim() || !form.currency_symbol.trim()) {
      toast.error('Name, currency code, and symbol are required');
      return;
    }
    setSaving(true);
    const payload = { ...form };

    try {
      if (editing) {
        await regionService.update(editing.id, payload);
        toast.success('Region updated');
      } else {
        await regionService.create(payload);
        toast.success('Region created');
      }
      setFormOpen(false);
      load();
    } catch (e) {
      toast.error('Failed to save region');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await regionService.delete(deleteTarget.id);
      toast.success('Region deleted');
      setDeleteTarget(null);
      load();
    } catch (e) {
      toast.error('Failed to delete region');
    }
    setDeleting(false);
  };

  const columns: DTColumn<AdminRegion>[] = [
    {
      key: 'name',
      header: 'Region Name',
      className: 'font-semibold text-slate-800',
      render: (r) => (
        <div className="flex items-center gap-2">
          {r.name}
          {r.is_default && (
            <Badge variant="default" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-transparent text-[10px] uppercase">
              Default
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'currency_code',
      header: 'Currency',
      render: (r) => <span className="font-medium">{r.currency_code} ({r.currency_symbol})</span>
    },
    {
      key: 'tax_rate',
      header: 'Tax Rate',
      render: (r) => <span>{r.tax_rate ? `${r.tax_rate}%` : '0%'}</span>
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
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-900 to-emerald-800 p-8 text-white shadow-lg">
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
            <Globe className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Regions Master</h1>
            <p className="mt-2 text-emerald-200">Manage the regions you price in, currencies, and tax rates.</p>
          </div>
        </div>
        <div className="absolute -right-10 -top-24 h-64 w-64 rounded-full bg-white/5 blur-3xl"></div>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="p-6">
            <DataTable
              columns={columns}
              data={data}
              loading={loading}
              searchKeys={['name', 'currency_code']}
              onAdd={openAdd}
              addLabel="Add Region"
              actions={(row) => (
                <>
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
        title={editing ? 'Edit Region' : 'Add Region'}
        onSubmit={handleSave}
        loading={saving}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Region Name *</Label>
            <Input placeholder="e.g. India, United States" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Currency Code *</Label>
              <Input placeholder="e.g. INR, USD" value={form.currency_code} onChange={(e) => setForm({ ...form, currency_code: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Currency Symbol *</Label>
              <Input placeholder="e.g. ₹, $" value={form.currency_symbol} onChange={(e) => setForm({ ...form, currency_symbol: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tax Rate (%)</Label>
            <Input type="number" step="0.01" value={form.tax_rate} onChange={(e) => setForm({ ...form, tax_rate: parseFloat(e.target.value) || 0 })} />
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-center space-x-2">
              <Switch id="is_active" checked={form.is_active} onCheckedChange={(c) => setForm({ ...form, is_active: c })} />
              <Label htmlFor="is_active">Active (Visible on frontend)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="is_default" checked={form.is_default} onCheckedChange={(c) => setForm({ ...form, is_default: c })} />
              <Label htmlFor="is_default">Default Region</Label>
            </div>
          </div>
        </div>
      </FormModal>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This will permanently delete this region. This action cannot be undone."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
