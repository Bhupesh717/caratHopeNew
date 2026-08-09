'use client';
import Image from 'next/image';

import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTable, DTColumn, DTFilter } from '../_components/data-table';
import { FormModal } from '../_components/form-modal';
import { ConfirmDialog } from '../_components/confirm-dialog';
import { DetailModal } from '../_components/detail-modal';
import { ImageUpload } from '../_components/image-upload';
import { bannerService } from '../_services/banner.service';
import { Banner } from '../_types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const emptyBanner = {
  image: '',
  badge: '',
  title: '',
  description: '',
  status: 'active' as 'active' | 'inactive'
};

export default function BannersPage() {
  const [data, setData] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState(emptyBanner);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [viewItem, setViewItem] = useState<Banner | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setData(await bannerService.getAll());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyBanner);
    setFormOpen(true);
  };

  const openEdit = (b: Banner) => {
    setEditing(b);
    setForm({
      image: b.image,
      badge: b.badge,
      title: b.title,
      description: b.description,
      status: b.status
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    /* if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    } */
    if (!form.image) {
      toast.error('Image is required');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await bannerService.update(editing.id, {
          image: form.image,
          badge: form.badge,
          title: form.title,
          description: form.description,
          status: form.status,
        });
      } else {
        await bannerService.create({
          image: form.image,
          badge: form.badge,
          title: form.title,
          description: form.description,
          status: 'active', // default to active on create
        });
      }
      setFormOpen(false);
      load();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save banner');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await bannerService.delete(deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
    load();
  };

  const handleToggle = async (b: Banner) => {
    await bannerService.toggleStatus(b.id);
    load();
  };

  const columns: DTColumn<Banner>[] = [
    {
      key: 'image',
      header: 'Image',
      render: (r) => r.image ? <Image src={r.image} alt="" width={64} height={40} className="h-10 w-16 rounded object-cover" /> : <div className="h-10 w-16 rounded bg-muted" />
    },
    /* {
      key: 'badge',
      header: 'Badge',
      className: 'hidden sm:table-cell font-semibold text-xs tracking-wider text-primary'
    },
    {
      key: 'title',
      header: 'Title'
    },
    {
      key: 'description',
      header: 'Description',
      className: 'hidden md:table-cell max-w-xs truncate text-muted-foreground'
    }, */
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
    {
      key: 'createdAt',
      header: 'Created',
      render: (r) => format(new Date(r.createdAt), 'dd MMM yyyy'),
      className: 'hidden lg:table-cell'
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
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Banners</h1>
        <p className="text-sm text-muted-foreground">Manage homepage banners and promotional slides.</p>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        filters={filters}
        searchKeys={[/* 'title', 'badge', 'description' */]}
        onAdd={openAdd}
        addLabel="Add Banner"
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

      {/* Add / Edit modal */}
      <FormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editing ? 'Edit Banner' : 'Add Banner'}
        onSubmit={handleSave}
        loading={saving}
      >
        <ImageUpload value={form.image} onChange={(v) => setForm({ ...form, image: v })} dimensions="1500x600px" />
        {/* <div className="space-y-2">
          <Label>Badge</Label>
          <Input
            placeholder="e.g. SUMMER SALE"
            value={form.badge}
            onChange={(e) => setForm({ ...form, badge: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Title *</Label>
          <Input
            placeholder="e.g. Summer Collection"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <textarea
            placeholder="Describe the banner promo details..."
            className="flex min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div> */}
      </FormModal>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title={deleteTarget ? "Delete Banner?" : ""}
        description="This banner will be permanently removed."
        onConfirm={handleDelete}
        loading={deleting}
      />

      {viewItem && (
        <DetailModal
          open={!!viewItem}
          onOpenChange={() => setViewItem(null)}
          title="Banner Details"
          fields={[
            {
              label: 'Image',
              value: viewItem.image ? (
                <div className="relative h-32 w-full"><Image src={viewItem.image} alt="" fill className="rounded-lg object-cover" /></div>
              ) : '—'
            },
            // { label: 'Badge', value: viewItem.badge || '—' },
            // { label: 'Title', value: viewItem.title },
            // { label: 'Description', value: viewItem.description || '—' },
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
            { label: 'Created', value: format(new Date(viewItem.createdAt), 'dd MMM yyyy, hh:mm a') },
          ]}
        />
      )}
    </div>
  );
}
