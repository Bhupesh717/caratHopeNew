'use client';
import Image from 'next/image';


import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Eye, EyeOff, Pencil, Trash2, Star, Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import { DataTable, DTColumn, DTFilter } from '../_components/data-table';
import { FormModal } from '../_components/form-modal';
import { ConfirmDialog } from '../_components/confirm-dialog';
import { ProductViewModal } from './_components/product-view-modal';
import { ImageUpload } from '../_components/image-upload';
import { MultiImageUpload } from '../_components/multi-image-upload';
import { productService } from '../_services/product.service';
import { categoryService } from '../_services/category.service';
import { AdminProduct, AdminCategory } from '../_types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';



export default function ProductsPage() {
  const [data, setData] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewProductId, setViewProductId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [prods, cats] = await Promise.all([productService.getAll(), categoryService.getAll()]);
    setData(prods);
    setCategories(cats);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const catName = (id: string) => categories.find((c) => c.id === id)?.name || '—';

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await productService.delete(deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
    load();
  };

  const handleToggle = async (p: AdminProduct) => {
    await productService.toggleStatus(p.id);
    load();
  };

  const handleToggleFeatured = async (p: AdminProduct) => {
    try {
      await productService.toggleFeatured(p.id);
      load();
    } catch (err: any) {
      toast.error('Failed to update featured status');
    }
  };

  const columns: DTColumn<AdminProduct>[] = [
    {
      key: 'images',
      header: 'Image',
      render: (r) => r.images[0] ? <Image src={r.images[0]} alt="" width={40} height={40} className="h-10 w-10 rounded object-cover" /> : <div className="h-10 w-10 rounded bg-muted" />
    },
    {
      key: 'name',
      header: 'Name'
    },
    {
      key: 'sku',
      header: 'SKU',
      className: 'hidden md:table-cell font-mono text-xs',
      render: (r) => r.has_variants ? <span className="text-muted-foreground italic">Multiple Variants</span> : r.sku
    },
    {
      key: 'categoryId',
      header: 'Category',
      render: (r) => catName(r.categoryId),
      className: 'hidden lg:table-cell'
    },
    {
      key: 'price',
      header: 'Price',
      render: (r) => r.has_variants ? (
        <span className="text-slate-600 text-xs italic">See Variants</span>
      ) : (
        <div>
          <span className={r.discountPrice ? 'line-through text-muted-foreground text-xs' : ''}>₹{r.price?.toLocaleString() || 0}</span>
          {r.discountPrice && <span className="ml-1 text-emerald-600 font-medium">₹{r.discountPrice.toLocaleString()}</span>}
        </div>
      )
    },
    {
      key: 'stockQty',
      header: 'Stock',
      render: (r) => r.has_variants ? (
        <span className="text-slate-600 text-xs italic">Multiple Variants</span>
      ) : (
        <span className={r.stockQty === 0 ? 'text-destructive font-medium' : ''}>{r.stockQty}</span>
      ),
      className: 'hidden md:table-cell'
    },
    {
      key: 'isFeatured',
      header: '★',
      render: (r) => (
        <button
          onClick={() => handleToggleFeatured(r)}
          className="p-1 hover:bg-slate-100 rounded-full transition-colors"
          title={`Click to ${r.isFeatured ? 'remove from' : 'add to'} featured`}
        >
          <Star className={cn("h-4 w-4 transition-colors", r.isFeatured ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-400")} />
        </button>
      ),
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
      key: 'categoryId',
      label: 'Category',
      options: categories.map((c) => ({ label: c.name, value: c.id }))
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Products</h1>
        <p className="text-sm text-muted-foreground">Manage your jewelry product catalog.</p>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        filters={filters}
        searchKeys={['name', 'sku']}
        addLabel="Add Product"
        onAdd={() => window.location.href = '/admin/products/new'}
        actions={(row) => (
          <>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.location.href = `/admin/products/${row.id}/edit`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" onClick={() => setViewProductId(row.id)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive cursor-pointer" onClick={() => setDeleteTarget(row)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This product will be permanently removed."
        onConfirm={handleDelete}
        loading={deleting}
      />

      <ProductViewModal
        productId={viewProductId}
        open={Boolean(viewProductId)}
        onOpenChange={(isOpen) => {
          if (!isOpen) setViewProductId(null);
        }}
        categoriesList={categories}
      />
    </div>
  );
}
