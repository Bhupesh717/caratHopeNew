'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Pencil, Trash2, Clock, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { DataTable, DTColumn } from '../../_components/data-table';
import { FormModal } from '../../_components/form-modal';
import { ConfirmDialog } from '../../_components/confirm-dialog';
import { processingProfileService } from '../../_services/processing-profile.service';
import { AdminProcessingProfile } from '../../_types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const emptyForm = { name: '', min_days: 1, max_days: 2, is_active: true, is_default: false };

export default function ProcessingProfilesPage() {
  const [data, setData] = useState<AdminProcessingProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminProcessingProfile | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminProcessingProfile | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await processingProfileService.getAll());
    } catch (e) {
      toast.error('Failed to load processing profiles');
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

  const openEdit = (p: AdminProcessingProfile) => {
    setEditing(p);
    setForm({
      name: p.name,
      min_days: p.min_days,
      max_days: p.max_days,
      is_active: p.is_active ?? true,
      is_default: p.is_default
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (form.min_days < 0 || form.max_days < form.min_days) {
      toast.error('Invalid min/max days');
      return;
    }
    setSaving(true);
    const payload = { ...form };

    try {
      if (editing) {
        await processingProfileService.update(editing.id, payload);
        toast.success('Profile updated');
      } else {
        await processingProfileService.create(payload);
        toast.success('Profile created');
      }
      setFormOpen(false);
      load();
    } catch (e) {
      toast.error('Failed to save processing profile');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await processingProfileService.delete(deleteTarget.id);
      toast.success('Profile deleted');
      setDeleteTarget(null);
      load();
    } catch (e) {
      toast.error('Failed to delete profile');
    }
    setDeleting(false);
  };

  const columns: DTColumn<AdminProcessingProfile>[] = [
    {
      key: 'name',
      header: 'Profile Name',
      className: 'font-semibold text-slate-800',
      render: (r) => (
        <div className="flex items-center gap-2">
          {r.name}
          {r.is_default && (
            <Badge variant="default" className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-transparent text-[10px] uppercase">
              Default
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'timeframe',
      header: 'Timeframe',
      render: (r) => <span className="font-medium text-slate-600">{r.min_days} - {r.max_days} days</span>
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
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 p-8 text-white shadow-lg">
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm border border-white/30">
            <Clock className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Processing Profiles</h1>
            <p className="mt-2 text-amber-100">Manage dispatch timeframes for your products.</p>
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
              searchKeys={['name']}
              onAdd={openAdd}
              addLabel="Add Profile"
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
        title={editing ? 'Edit Profile' : 'Add Profile'}
        onSubmit={handleSave}
        loading={saving}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Profile Name *</Label>
            <Input placeholder="e.g. Ready to dispatch" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Min Days *</Label>
              <Input type="number" min="0" value={form.min_days} onChange={(e) => setForm({ ...form, min_days: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="space-y-2">
              <Label>Max Days *</Label>
              <Input type="number" min="0" value={form.max_days} onChange={(e) => setForm({ ...form, max_days: parseInt(e.target.value) || 0 })} />
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
        description="Are you sure you want to delete this profile? Products using it might be affected."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
