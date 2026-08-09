'use client';

import Image from 'next/image';

import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DataTable, DTColumn, DTFilter } from '../_components/data-table';
import { FormModal } from '../_components/form-modal';
import { ConfirmDialog } from '../_components/confirm-dialog';
import { DetailModal } from '../_components/detail-modal';
import { ImageUpload } from '../_components/image-upload';
import { categoryService } from '../_services/category.service';
import { AdminCategory } from '../_types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const emptyForm = { 
  image: '', 
  name: '', 
  description: '', 
  status: 'active' as 'active' | 'inactive' 
};

export default function CategoriesPage() {
  const [data, setData] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [viewItem, setViewItem] = useState<AdminCategory | null>(null);

  const load = useCallback(async () => { 
    setLoading(true); 
    setData(await categoryService.getAll()); 
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

  const openEdit = (c: AdminCategory) => { 
    setEditing(c); 
    setForm({ 
      image: c.image, 
      name: c.name, 
      description: c.description, 
      status: c.status 
    }); 
    setFormOpen(true); 
  };

  const handleSave = async () => {
    if (!form.name.trim()) { 
      toast.error('Name is required'); 
      return; 
    }
    setSaving(true);
    const payload = {
      image: form.image,
      name: form.name,
      slug: slugify(form.name),
      description: form.description,
      parentId: null,
      status: editing ? form.status : 'active', // default to active on create
    };
    
    if (editing) { 
      await categoryService.update(editing.id, payload); 
    } else { 
      await categoryService.create(payload); 
    }
    
    setSaving(false); 
    setFormOpen(false); 
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true); 
    await categoryService.delete(deleteTarget.id); 
    setDeleting(false); 
    setDeleteTarget(null); 
    load();
  };

  const handleToggle = async (c: AdminCategory) => { 
    await categoryService.toggleStatus(c.id); 
    load(); 
  };

  const columns: DTColumn<AdminCategory>[] = [
    { 
      key: 'image', 
      header: 'Image', 
      render: (r) => r.image ? <Image src={r.image} alt="" width={40} height={40} className="h-10 w-10 rounded object-cover" /> : <div className="h-10 w-10 rounded bg-muted" /> 
    },
    { 
      key: 'name', 
      header: 'Name' 
    },
    { 
      key: 'description', 
      header: 'Description', 
      className: 'hidden md:table-cell max-w-xs truncate text-muted-foreground',
      render: (r) => r.description || '—'
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
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Categories</h1>
        <p className="text-sm text-muted-foreground">Manage product categories and subcategories.</p>
      </div>

      <DataTable 
        columns={columns} 
        data={data} 
        loading={loading} 
        filters={filters} 
        searchKeys={['name', 'description']} 
        onAdd={openAdd} 
        addLabel="Add Category"
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
        title={editing ? 'Edit Category' : 'Add Category'} 
        onSubmit={handleSave} 
        loading={saving}
      >
        <ImageUpload value={form.image} onChange={(v) => setForm({ ...form, image: v })} label="Category Image" dimensions="500x500px" />
        <div className="space-y-2">
          <Label>Name *</Label>
          <Input 
            placeholder="e.g. Necklaces"
            value={form.name} 
            onChange={(e) => setForm({ ...form, name: e.target.value })} 
          />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea 
            placeholder="Describe the category..."
            value={form.description} 
            onChange={(e) => setForm({ ...form, description: e.target.value })} 
            rows={3} 
          />
        </div>
      </FormModal>

      <ConfirmDialog 
        open={!!deleteTarget} 
        onOpenChange={() => setDeleteTarget(null)} 
        title={`Delete "${deleteTarget?.name}"?`} 
        description="This category and any references will be removed." 
        onConfirm={handleDelete} 
        loading={deleting} 
      />

      {viewItem && (
        <DetailModal 
          open={!!viewItem} 
          onOpenChange={() => setViewItem(null)} 
          title="Category Details"
          fields={[
            { 
              label: 'Image', 
              value: viewItem.image ? (
                <Image src={viewItem.image} alt="" width={80} height={80} className="h-20 w-20 rounded-lg object-cover" />
              ) : '—' 
            },
            { label: 'Name', value: viewItem.name },
            { label: 'Description', value: viewItem.description || '—' },
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
