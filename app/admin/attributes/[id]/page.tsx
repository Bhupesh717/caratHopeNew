'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Pencil, Trash2, ArrowLeft, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTable, DTColumn } from '../../_components/data-table';
import { FormModal } from '../../_components/form-modal';
import { ConfirmDialog } from '../../_components/confirm-dialog';
import { attributeService } from '../../_services/attribute.service';
import { AdminAttribute, AdminAttributeValue } from '../../_types';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

const emptyForm = { value: '', price_modifier: 0, sort_order: 0 };

export default function AttributeValuesPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const attributeId = params.id;
  
  const [attribute, setAttribute] = useState<AdminAttribute | null>(null);
  const [data, setData] = useState<AdminAttributeValue[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  
  const [deleteTarget, setDeleteTarget] = useState<AdminAttributeValue | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const attr = await attributeService.getById(attributeId);
      if (attr) {
        setAttribute(attr);
        // Ensure values exist in case the API doesn't return them as an array
        // @ts-ignore - values comes from backend but might not be in our strict type
        setData(attr.values || []);
      }
    } catch (e) {
      toast.error('Failed to load attribute values');
    }
    setLoading(false);
  }, [attributeId]);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setForm(emptyForm);
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.value.trim()) {
      toast.error('Value is required');
      return;
    }
    setSaving(true);
    try {
      await attributeService.createValue(attributeId, { 
        value: form.value,
        price_modifier: Number(form.price_modifier) || 0,
        sort_order: Number(form.sort_order) || 0
      });
      toast.success('Value created');
      setFormOpen(false);
      load();
    } catch (e) {
      toast.error('Failed to save value');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await attributeService.deleteValue(deleteTarget.id);
      toast.success('Value deleted');
      setDeleteTarget(null);
      load();
    } catch (e) {
      toast.error('Failed to delete value');
    }
    setDeleting(false);
  };

  const columns: DTColumn<AdminAttributeValue>[] = [
    {
      key: 'value',
      header: 'Value Option',
      className: 'font-semibold',
      render: (r) => (
        <span className="text-sm text-slate-800">{r.value}</span>
      )
    },
    {
      key: 'price_modifier',
      header: 'Price Modifier',
      render: (r) => (
        r.price_modifier ? (
          <Badge variant="default" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-transparent">
            + {r.price_modifier}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )
      )
    },
    {
      key: 'sort_order',
      header: 'Sort Order',
      render: (r) => (
        <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200">
          {r.sort_order !== undefined ? r.sort_order : '0'}
        </Badge>
      )
    },
    {
      key: 'createdAt',
      header: 'Created At',
      render: (r) => (r.createdAt ? <span className="text-sm text-muted-foreground">{format(new Date(r.createdAt), 'dd MMM yyyy')}</span> : '—'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-900 to-indigo-800 p-8 text-white shadow-lg">
        <div className="relative z-10 flex items-center gap-4">
          <Button variant="ghost" size="icon" className="h-10 w-10 bg-white/10 hover:bg-white/20 text-white rounded-full border border-white/20 transition-all" onClick={() => router.push('/admin/attributes')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 ml-2">
            <Layers className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {attribute ? `${attribute.name} - Options` : 'Attribute Values'}
            </h1>
            <p className="mt-2 text-indigo-200">Manage selectable options for this attribute.</p>
          </div>
        </div>
        {/* Decorative background element */}
        <div className="absolute -left-10 -bottom-24 h-64 w-64 rounded-full bg-white/5 blur-3xl"></div>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="p-6">
            <DataTable
        columns={columns}
        data={data}
        loading={loading}
        searchKeys={['value']}
        onAdd={openAdd}
        addLabel="Add Value"
        actions={(row) => (
          <>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors" onClick={() => setDeleteTarget(row)}>
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
        title="Add Value"
        onSubmit={handleSave}
        loading={saving}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Attribute Value *</Label>
            <Input
              placeholder="e.g. 14K, Size 6"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Price Modifier (Optional)</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="e.g. 50.00"
              value={form.price_modifier}
              onChange={(e) => setForm({ ...form, price_modifier: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-2">
            <Label>Sort Order (Optional)</Label>
            <Input
              type="number"
              placeholder="e.g. 1"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value, 10) || 0 })}
            />
          </div>
        </div>
      </FormModal>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.value}"?`}
        description="This action cannot be undone."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
