'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Pencil, Trash2, List, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { DataTable, DTColumn } from '../../_components/data-table';
import { FormModal } from '../../_components/form-modal';
import { ConfirmDialog } from '../../_components/confirm-dialog';
import { attributeService } from '../../_services/attribute.service';
import { AdminAttribute } from '../../_types';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

const emptyForm = { 
  name: '', 
  input_type: 'select', 
  unit: '', 
  allowed_units: '', 
  max_selections: 0,
  can_be_variation: true,
  is_global: false,
  is_custom: false,
  affects_price: false 
};

export default function AttributesPage() {
  const router = useRouter();
  const [data, setData] = useState<AdminAttribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminAttribute | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminAttribute | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await attributeService.getAll());
    } catch (e) {
      toast.error('Failed to load attributes');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (a: AdminAttribute) => {
    setEditing(a);
    setForm({ 
      name: a.name, 
      input_type: a.input_type || 'select',
      unit: a.unit || '',
      allowed_units: a.allowed_units ? a.allowed_units.join(', ') : '',
      max_selections: a.max_selections || 0,
      can_be_variation: a.can_be_variation ?? true,
      is_global: a.is_global ?? false,
      is_custom: a.is_custom ?? false,
      affects_price: !!a.affects_price
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    const allowedUnitsArray = form.allowed_units
      ? form.allowed_units.split(',').map(s => s.trim()).filter(Boolean)
      : undefined;

    const payload = {
      name: form.name,
      slug: slugify(form.name),
      input_type: form.input_type,
      unit: form.unit || null,
      allowed_units: allowedUnitsArray,
      max_selections: form.max_selections > 0 ? form.max_selections : undefined,
      can_be_variation: form.can_be_variation,
      is_global: form.is_global,
      is_custom: form.is_custom,
      affects_price: form.affects_price
    };

    try {
      if (editing) {
        await attributeService.update(editing.id, payload);
        toast.success('Attribute updated');
      } else {
        await attributeService.create(payload);
        toast.success('Attribute created');
      }
      setFormOpen(false);
      load();
    } catch (e) {
      toast.error('Failed to save attribute');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await attributeService.delete(deleteTarget.id);
      toast.success('Attribute deleted');
      setDeleteTarget(null);
      load();
    } catch (e) {
      toast.error('Failed to delete attribute');
    }
    setDeleting(false);
  };

  const columns: DTColumn<AdminAttribute>[] = [
    {
      key: 'name',
      header: 'Attribute',
      className: 'font-semibold',
      render: (r) => (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-800">{r.name}</span>
          <span className="text-[10px] text-muted-foreground font-mono">{r.slug}</span>
          <div className="flex gap-1 mt-0.5">
            {r.is_global && <Badge variant="secondary" className="text-[9px] h-3.5 px-1 py-0 bg-blue-50 text-blue-700 border-blue-200">Global</Badge>}
            {r.can_be_variation && <Badge variant="secondary" className="text-[9px] h-3.5 px-1 py-0 bg-purple-50 text-purple-700 border-purple-200">Variation</Badge>}
            {r.is_custom && <Badge variant="secondary" className="text-[9px] h-3.5 px-1 py-0 bg-amber-50 text-amber-700 border-amber-200">Custom</Badge>}
          </div>
        </div>
      )
    },
    {
      key: 'input_type',
      header: 'Type',
      render: (r) => (
        <Badge variant="outline" className="capitalize bg-slate-50 text-slate-700 border-slate-200">
          {r.input_type}
        </Badge>
      )
    },
    {
      key: 'unit',
      header: 'Unit',
      render: (r) => <span className="text-sm text-muted-foreground">{r.unit || '—'}</span>
    },
    {
      key: 'affects_price',
      header: 'Pricing Effect',
      render: (r) => (
        r.affects_price ? (
          <Badge variant="default" className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-transparent">
            Affects Price
          </Badge>
        ) : (
          <Badge variant="outline" className="text-slate-500">Standard</Badge>
        )
      )
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (r) => (r.createdAt ? <span className="text-sm text-muted-foreground">{format(new Date(r.createdAt), 'dd MMM yyyy')}</span> : '—'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white shadow-lg">
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
            <Settings2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Attributes Master</h1>
            <p className="mt-2 text-slate-300">Manage global product attributes like Size, Color, and Custom Fields.</p>
          </div>
        </div>
        {/* Decorative background element */}
        <div className="absolute -right-10 -top-24 h-64 w-64 rounded-full bg-white/5 blur-3xl"></div>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="p-6">
            <DataTable
        columns={columns}
        data={data}
        loading={loading}
        searchKeys={['name']}
        onAdd={openAdd}
        addLabel="Add Attribute"
        actions={(row) => (
          <>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" title="Manage Values" onClick={() => router.push(`/admin/product-masters/attributes/${row.id}`)}>
              <List className="h-4 w-4" />
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
        title={editing ? 'Edit Attribute' : 'Add Attribute'}
        onSubmit={handleSave}
        loading={saving}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Attribute Name *</Label>
            <Input
              placeholder="e.g. Ring Size, Metal Type"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Input Type *</Label>
            <Select value={form.input_type} onValueChange={(v) => setForm({ ...form, input_type: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="select">Select Dropdown</SelectItem>
                <SelectItem value="number">Number Input</SelectItem>
                <SelectItem value="text">Text Input</SelectItem>
                <SelectItem value="boolean">Boolean (Yes/No)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {form.input_type === 'select' && (
            <div className="space-y-2">
              <Label>Max Selections (0 for unlimited)</Label>
              <Input
                type="number"
                min="0"
                value={form.max_selections}
                onChange={(e) => setForm({ ...form, max_selections: parseInt(e.target.value) || 0 })}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label>Unit (Optional)</Label>
            <Input
              placeholder="e.g. mm, cm, kg"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Allowed Scales (Comma separated, Optional)</Label>
            <Input
              placeholder="e.g. US, UK/AU, FR, DE"
              value={form.allowed_units}
              onChange={(e) => setForm({ ...form, allowed_units: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Used to create scale-specific options (like Ring Sizes).</p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center space-x-2">
              <Switch id="can_be_variation" checked={form.can_be_variation} onCheckedChange={(c) => setForm({ ...form, can_be_variation: c })} />
              <Label htmlFor="can_be_variation">Can be variation</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="is_global" checked={form.is_global} onCheckedChange={(c) => setForm({ ...form, is_global: c })} />
              <Label htmlFor="is_global">Is Global</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="is_custom" checked={form.is_custom} onCheckedChange={(c) => setForm({ ...form, is_custom: c })} />
              <Label htmlFor="is_custom">Is Custom (Merchant)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="affects_price" checked={form.affects_price} onCheckedChange={(c) => setForm({ ...form, affects_price: c })} />
              <Label htmlFor="affects_price">Affects Price</Label>
            </div>
          </div>
        </div>
      </FormModal>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This will also delete all associated values. This action cannot be undone."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
