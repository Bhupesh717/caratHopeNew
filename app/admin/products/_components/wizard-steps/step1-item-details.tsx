import React, { useEffect, useState, useMemo, useRef } from 'react';
import { ProductFormState, AdminCategory, AdminProductOptionGroup } from '../../../_types';
import { categoryService } from '../../../_services/category.service';
import { productOptionService } from '../../../_services/product-option.service';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

function SearchableSelect({
  categories,
  loading,
  value,
  onChange,
}: {
  categories: AdminCategory[];
  loading: boolean;
  value: string | number;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(
    () => categories.find((c) => c.id === String(value)),
    [value, categories]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, search]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleToggle = () => {
    setOpen((prev) => {
      if (!prev) {
        setSearch('');
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      return !prev;
    });
  };

  const handleSelect = (cat: AdminCategory) => {
    onChange(cat.id);
    setOpen(false);
    setSearch('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors',
          'hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          open && 'ring-2 ring-ring ring-offset-2',
          !selected && 'text-muted-foreground'
        )}
      >
        <span className="truncate">
          {loading ? 'Loading categories...' : selected ? selected.name : 'Select a category...'}
        </span>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {selected && (
            <span
              role="button"
              onClick={handleClear}
              className="h-4 w-4 rounded-full hover:bg-slate-200 flex items-center justify-center"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </span>
          )}
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200">
          {/* Search Input */}
          <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} className="shrink-0">
                <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-[220px] overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {loading ? 'Loading...' : 'No categories found.'}
              </div>
            ) : (
              filtered.map((cat) => {
                const isSelected = String(value) === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => handleSelect(cat)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm transition-colors cursor-pointer',
                      isSelected
                        ? 'bg-slate-100 text-slate-900 font-medium'
                        : 'text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    <Check
                      className={cn(
                        'h-4 w-4 shrink-0 transition-opacity',
                        isSelected ? 'opacity-100 text-emerald-600' : 'opacity-0'
                      )}
                    />
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function Step1ItemDetails({ form, setForm }: { form: ProductFormState, setForm: (f: ProductFormState) => void }) {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [whenMadeGroups, setWhenMadeGroups] = useState<AdminProductOptionGroup[]>([]);
  const [loadingWhenMade, setLoadingWhenMade] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCats(true);
      try {
        const cats = await categoryService.getAll({ leaf_only: true });
        setCategories(cats);
      } catch (e) {
        toast.error('Failed to load categories');
      }
      setLoadingCats(false);
    };

    const loadWhenMade = async () => {
      setLoadingWhenMade(true);
      try {
        const result: any = await productOptionService.getAll('when_was_it_made');
        if (Array.isArray(result) && result.length > 0) {
          if (result[0].options) {
            setWhenMadeGroups(result);
          } else if (result[0].label) {
            setWhenMadeGroups([{ group: 'Options', options: result }]);
          }
        }
      } catch (e) {
        // fail silently if api is missing
      }
      setLoadingWhenMade(false);
    }

    loadCategories();
    loadWhenMade();
  }, []);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label>Product Name *</Label>
        <Input
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. 18K Gold Solitaire Ring"
        />
        <p className="text-xs text-muted-foreground">Max 255 characters.</p>
      </div>

      <div className="space-y-2">
        <Label>Category *</Label>
        <SearchableSelect
          categories={categories}
          loading={loadingCats}
          value={form.category_id}
          onChange={(id) => {
            if (id !== String(form.category_id)) {
              setForm({
                ...form,
                category_id: id,
                variation_axis_ids: [],
                variants: [],
                listing_attributes: {},
                materials: [],
                gold_solidity: [],
                gold_purity: [],
                prices: [],
                stock_qty: undefined,
                total_stock: undefined,
              });
            }
          }}
        />
      </div>

      <div className="space-y-2">
        <Label>When was it made? *</Label>
        <Select
          value={form.when_was_it_made || ''}
          onValueChange={(val) => setForm({ ...form, when_was_it_made: val })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={loadingWhenMade ? "Loading..." : "When was it made?"} />
          </SelectTrigger>
          <SelectContent className="max-h-[350px]">
            {whenMadeGroups.map((group) => (
              <SelectGroup key={group.group}>
                <SelectLabel className="bg-slate-50 border-y py-1.5">{group.group}</SelectLabel>
                {group.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="pl-6">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Base SKU</Label>
          <Input
            value={form.sku || ''}
            onChange={e => setForm({ ...form, sku: e.target.value })}
            placeholder="e.g. CH-RINGS-21"
          />
          <p className="text-xs text-muted-foreground">Must be unique. Leave blank to auto-generate.</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <div className="bg-white [&_.ql-editor]:min-h-[200px] [&_.ql-toolbar]:rounded-t-md [&_.ql-container]:rounded-b-md border rounded-md">
          <ReactQuill
            theme="snow"
            value={form.description || ''}
            onChange={v => setForm({ ...form, description: v })}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2 pt-4 border-t">
        <Switch
          id="is_active"
          checked={form.status === 'active'}
          onCheckedChange={c => setForm({ ...form, status: c ? 'active' : 'inactive' })}
        />
        <Label htmlFor="is_active" className="cursor-pointer">Active (Visible on storefront)</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="is_featured"
          checked={!!form.is_featured}
          onCheckedChange={c => setForm({ ...form, is_featured: c })}
        />
        <Label htmlFor="is_featured" className="cursor-pointer">Featured Product</Label>
      </div>
    </div>
  );
}
