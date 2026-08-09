'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Trash2, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable, DTColumn } from '../_components/data-table';
import { ConfirmDialog } from '../_components/confirm-dialog';
import { categoryService } from '../_services/category.service';
import { attributeService } from '../_services/attribute.service';
import { categoryAttributeService } from '../_services/category-attribute.service';
import { AdminCategory, AdminAttribute, AdminCategoryAttribute } from '../_types';
import { format } from 'date-fns';

export default function CategoryAttributesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [attributes, setAttributes] = useState<AdminAttribute[]>([]);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedAttribute, setSelectedAttribute] = useState<string>('');
  const [isRequired, setIsRequired] = useState<boolean>(true);
  
  const [mappedAttributes, setMappedAttributes] = useState<AdminCategoryAttribute[]>([]);
  const [loadingMappings, setLoadingMappings] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [deleteTarget, setDeleteTarget] = useState<AdminCategoryAttribute | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Load dropdown data
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [cats, attrs] = await Promise.all([
          categoryService.getAll(),
          attributeService.getAll()
        ]);
        setCategories(cats);
        setAttributes(attrs);
      } catch (e) {
        toast.error('Failed to load categories or attributes');
      }
    };
    loadFilters();
  }, []);

  // Load mappings when a category is selected
  const loadMappings = useCallback(async (categoryId: string) => {
    if (!categoryId) {
      setMappedAttributes([]);
      return;
    }
    setLoadingMappings(true);
    try {
      const data = await categoryAttributeService.getByCategory(categoryId);
      setMappedAttributes(data);
    } catch (e) {
      toast.error('Failed to load mappings');
    }
    setLoadingMappings(false);
  }, []);

  useEffect(() => {
    loadMappings(selectedCategory);
  }, [selectedCategory, loadMappings]);

  const handleMap = async () => {
    if (!selectedCategory || !selectedAttribute) {
      toast.error('Please select both Category and Attribute');
      return;
    }
    setSaving(true);
    try {
      await categoryAttributeService.create({
        category_id: selectedCategory,
        attribute_id: selectedAttribute,
        is_required: isRequired
      });
      toast.success('Attribute mapped successfully');
      // Reset form but keep category selected
      setSelectedAttribute('');
      setIsRequired(true);
      loadMappings(selectedCategory);
    } catch (e) {
      toast.error('Failed to map attribute');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await categoryAttributeService.delete(deleteTarget.id);
      toast.success('Mapping removed successfully');
      setDeleteTarget(null);
      loadMappings(selectedCategory);
    } catch (e) {
      toast.error('Failed to remove mapping');
    }
    setDeleting(false);
  };

  const columns: DTColumn<AdminCategoryAttribute>[] = [
    {
      key: 'attribute_name',
      header: 'Attribute',
      className: 'font-semibold text-slate-800',
      render: (r) => r.attribute_name || '—'
    },
    {
      key: 'is_required',
      header: 'Required',
      render: (r) => (
        r.is_required ? (
          <Badge variant="default" className="bg-rose-100 text-rose-800 hover:bg-rose-100 border-transparent">
            Required
          </Badge>
        ) : (
          <Badge variant="outline" className="text-slate-500">Optional</Badge>
        )
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-900 to-violet-800 p-8 text-white shadow-lg">
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
            <LinkIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Category-Attribute Mapping</h1>
            <p className="mt-2 text-violet-200">Link global attributes to specific product categories.</p>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-24 h-64 w-64 rounded-full bg-white/5 blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Mapping Form */}
        <Card className="border-slate-200 shadow-sm md:col-span-1 h-fit">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <CardTitle>Map New Attribute</CardTitle>
            <CardDescription>Select a category and attribute to link them.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-3">
              <Label>Select Category *</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Select Attribute *</Label>
              <Select value={selectedAttribute} onValueChange={setSelectedAttribute}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an attribute" />
                </SelectTrigger>
                <SelectContent>
                  {attributes.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 pt-2 pb-4">
              <Switch
                id="is_required"
                checked={isRequired}
                onCheckedChange={setIsRequired}
              />
              <Label htmlFor="is_required" className="cursor-pointer">Mandatory for this Category</Label>
            </div>

            <Button className="w-full" onClick={handleMap} disabled={saving || !selectedCategory || !selectedAttribute}>
              {saving ? 'Mapping...' : 'Add Mapping'}
            </Button>
          </CardContent>
        </Card>

        {/* Existing Mappings Table */}
        <Card className="border-slate-200 shadow-sm overflow-hidden md:col-span-2">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <CardTitle>Existing Mappings</CardTitle>
            <CardDescription>
              {selectedCategory 
                ? `Showing attributes mapped to the selected category.`
                : 'Please select a category to view its mapped attributes.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {selectedCategory ? (
              <div className="p-6">
                <DataTable
                  columns={columns}
                  data={mappedAttributes}
                  loading={loadingMappings}
                  searchKeys={['attribute_name']}
                  actions={(row) => (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors" onClick={() => setDeleteTarget(row)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
                <LinkIcon className="h-12 w-12 text-slate-200 mb-4" />
                <p>Select a category from the left panel to view existing mappings.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Remove Mapping?"
        description="Are you sure you want to unlink this attribute from the category? Products already using this attribute might be affected."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
