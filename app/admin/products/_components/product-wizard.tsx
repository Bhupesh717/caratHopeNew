'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  ArrowLeft, ArrowRight, Save, Plus, Trash2, Settings2, Package, Tag, CheckCircle2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MultiImageUpload } from '../../_components/multi-image-upload';
import { ImageUpload } from '../../_components/image-upload';
import { VideoUpload } from '../../_components/video-upload';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

import { productService } from '../../_services/product.service';
import { categoryService } from '../../_services/category.service';
import { categoryAttributeService } from '../../_services/category-attribute.service';
import { attributeService } from '../../_services/attribute.service';
import { regionService, Region } from '../../_services/region.service';
import { AdminCategory, AdminCategoryAttribute, AdminAttribute, AdminProduct } from '../../_types';
import { cn } from '@/lib/utils';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const STEPS = [
  { id: 1, title: 'Base Details', icon: Package },
  { id: 2, title: 'Generate Variants', icon: Settings2 },
  { id: 3, title: 'Configure Variants', icon: Tag },
  { id: 4, title: 'Regional Pricing', icon: CheckCircle2 }
];

export function ProductWizard({ mode = 'create', initialProduct = null }: { mode?: 'create' | 'edit', initialProduct?: any }) {
  const router = useRouter();
  
  // States
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [createdProduct, setCreatedProduct] = useState<any>(initialProduct);

  // Form State: Step 1 (Base)
  const [baseForm, setBaseForm] = useState({
    images: [''] as string[],
    name: '',
    categoryId: '',
    description: '',
    video: '',
    details: [{ key: '', value: '' }] as { key: string, value: string }[],
    has_variants: true,
    price: 0,
    discountPrice: '' as string | number,
    stockQty: 0,
  });

  // Form State: Step 2 (Attributes)
  const [categoryAttributes, setCategoryAttributes] = useState<AdminCategoryAttribute[]>([]);
  const [fullAttributes, setFullAttributes] = useState<AdminAttribute[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>({});

  // Form State: Step 3 (Variants)
  const [variants, setVariants] = useState<any[]>([]);

  // Form State: Step 4 (Pricing)
  const [regions, setRegions] = useState<Region[]>([]);
  const [regionalPricingRows, setRegionalPricingRows] = useState<
    Record<string, { id: string; regionId: string; price: string; compare: string }[]>
  >({});

  useEffect(() => {
    categoryService.getAll().then(setCategories);
    attributeService.getAll().then(setFullAttributes);
    regionService.getAll().then(setRegions);

    if (mode === 'edit' && initialProduct) {
      // Hydrate Step 1
      setBaseForm({
        images: (initialProduct.images?.length ? initialProduct.images : ['']),
        name: initialProduct.name,
        categoryId: initialProduct.categoryId || '',
        description: initialProduct.description || '',
        video: initialProduct.video || '',
        details: initialProduct.details?.length ? initialProduct.details : [{ key: '', value: '' }],
        has_variants: Boolean(initialProduct.has_variants),
        price: initialProduct.price || 0,
        discountPrice: initialProduct.discountPrice || '',
        stockQty: initialProduct.stockQty || 0,
      });

      // Hydrate Variants & Pricing
      if (initialProduct.has_variants && initialProduct.variants) {
        setVariants(initialProduct.variants);
        
        // Compute selected attributes from variants
        const selAttrs: Record<string, string[]> = {};
        initialProduct.variants.forEach((v: any) => {
          v.attributeValues?.forEach((av: any) => {
            if (!selAttrs[av.attribute_id]) selAttrs[av.attribute_id] = [];
            if (!selAttrs[av.attribute_id].includes(String(av.attribute_value_id))) {
              selAttrs[av.attribute_id].push(String(av.attribute_value_id));
            }
          });
        });
        setSelectedAttributes(selAttrs);

        // Compute prices
        const rPrices: any = {};
        initialProduct.variants.forEach((v: any) => {
          if (v.prices) {
            rPrices[v.id] = v.prices.map((p: any) => ({
              id: crypto.randomUUID(),
              regionId: String(p.region_id),
              price: p.price,
              compare: p.compare_at_price || ''
            }));
          }
        });
        setRegionalPricingRows(rPrices);
      } else if (!initialProduct.has_variants && initialProduct.local_prices) {
        // Simple product pricing
        // initialProduct.local_prices is e.g. { "IN": { price: 100, discountPrice: 90 } }
        // We need to map region code "IN" back to region ID for our state
        const rPrices: any = { 'base': {} };
        // We will do this mapping below in another useEffect after regions are loaded
      }
    }
  }, [mode, initialProduct]);

  useEffect(() => {
    if (mode === 'edit' && initialProduct && !initialProduct.has_variants && initialProduct.local_prices && regions.length > 0) {
      const bPrices: any[] = [];
      Object.keys(initialProduct.local_prices).forEach(code => {
        const region = regions.find(r => r.currency_code === code || r.name === code);
        if (region) {
          bPrices.push({
            id: crypto.randomUUID(),
            regionId: String(region.id),
            price: initialProduct.local_prices[code].price,
            compare: initialProduct.local_prices[code].discountPrice || ''
          });
        }
      });
      setRegionalPricingRows(prev => ({ ...prev, 'base': bPrices }));
    }
  }, [regions, mode, initialProduct]);

  // Initialize default rows (US, IN, Other) when reaching step 4 or loading regions
  useEffect(() => {
    const items = baseForm.has_variants ? variants : [{ id: 'base' }];
    const newRows = { ...regionalPricingRows };
    let changed = false;

    items.forEach(item => {
      if (!newRows[item.id] || newRows[item.id].length === 0) {
        const usRegion = regions.find(r => r.currency_code === 'USD' && r.name.toUpperCase().includes('UNITED STATES'));
        const inRegion = regions.find(r => r.currency_code === 'INR' || r.name.toUpperCase().includes('INDIA'));
        const otherRegion = regions.find(r => r.name.toUpperCase().includes('REST OF WORLD') || r.name.toUpperCase().includes('OTHER'));

        newRows[item.id] = [
          { id: crypto.randomUUID(), regionId: usRegion ? String(usRegion.id) : '', price: '', compare: '' },
          { id: crypto.randomUUID(), regionId: inRegion ? String(inRegion.id) : '', price: '', compare: '' },
          { id: crypto.randomUUID(), regionId: otherRegion ? String(otherRegion.id) : '', price: '', compare: '' },
        ];
        changed = true;
      }
    });

    if (changed) setRegionalPricingRows(newRows);
  }, [step, variants, baseForm.has_variants, regions]);

  useEffect(() => {
    if (baseForm.categoryId) {
      categoryAttributeService.getByCategory(baseForm.categoryId).then(setCategoryAttributes);
    } else {
      setCategoryAttributes([]);
    }
    // Reset selected attributes when category changes
    setSelectedAttributes({});
  }, [baseForm.categoryId]);

  // --- Actions ---

  const handleCreateBaseProduct = async () => {
    if (!baseForm.name || !baseForm.categoryId || !baseForm.images[0]) {
      toast.error('Name, Category, and Primary Image are required.');
      return;
    }
    if (!baseForm.has_variants) {
      if (baseForm.price <= 0 || baseForm.stockQty < 0) {
        toast.error('Price and Stock are required for simple products.');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        ...baseForm,
        video: baseForm.video || null,
        images: baseForm.images.filter(Boolean),
        details: baseForm.details.filter(d => d.key.trim() || d.value.trim()),
        discountPrice: baseForm.discountPrice || null,
      };
      
      let product;
      if (mode === 'edit' && createdProduct) {
        product = await productService.update(createdProduct.id, payload as any);
        setCreatedProduct(product); // handle generic update response if it wraps in data
        toast.success('Base product updated successfully!');
      } else {
        product = await productService.create(payload);
        setCreatedProduct(product);
        toast.success('Base product created successfully!');
      }
      
      if (baseForm.has_variants) {
        setStep(2);
      } else {
        // Skip variants, jump to pricing or finish
        setStep(4);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCombinations = async () => {
    if (!createdProduct) return;
    const attrCount = Object.keys(selectedAttributes).length;
    if (attrCount === 0 || attrCount > 2) {
      toast.error('Select 1 or 2 attributes to generate variants.');
      return;
    }
    
    // Check if any selected attribute has no values
    for (const [attrId, vals] of Object.entries(selectedAttributes)) {
      if (vals.length === 0) {
        toast.error(`Please select at least one value for each chosen attribute.`);
        return;
      }
    }

    setLoading(true);
    try {
      const result = await productService.generateCombinations(createdProduct.id, selectedAttributes);
      setVariants(result.data.variants || []);
      toast.success('Variants generated successfully!');
      setStep(3);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to generate variants');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateVariants = async () => {
    if (!createdProduct) return;
    setLoading(true);
    try {
      // Typically we'd update them one by one or via a bulk endpoint.
      // Assuming we update one by one for now since spec showed PUT /variants/{id}
      for (const variant of variants) {
        await productService.updateVariant(createdProduct.id, variant.id, {
          weight_grams: variant.weight_grams,
          making_charges: variant.making_charges,
          stock_quantity: variant.stock_quantity,
          is_active: variant.is_active !== false, // default true
        });
      }
      toast.success('Variants updated successfully!');
      setStep(4);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update variants');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    if (!createdProduct) return;
    setLoading(true);
    try {
      if (baseForm.has_variants) {
        // Submit for each variant
        for (const variant of variants) {
          const rows = regionalPricingRows[variant.id];
          if (rows) {
            const payloadPrices = rows
              .filter(r => r.regionId && Number(r.price) > 0)
              .map(r => ({
                region_id: r.regionId,
                price: Number(r.price),
                compare_at_price: r.compare ? Number(r.compare) : null
              }));
            
            if (payloadPrices.length > 0) {
              await productService.bulkUpdatePrices(variant.id, payloadPrices);
            }
          }
        }
      } else {
        // Simple product: submit local_prices to the base product
        const rows = regionalPricingRows['base'];
        if (rows) {
          const localPricesObj: any = {};
          rows.forEach(r => {
            if (r.regionId && Number(r.price) > 0) {
              const region = regions.find(reg => String(reg.id) === String(r.regionId));
              const rCode = region?.currency_code || region?.name || r.regionId;
              localPricesObj[rCode] = {
                price: Number(r.price),
                discountPrice: r.compare ? Number(r.compare) : null
              };
            }
          });
          
          await productService.update(createdProduct.id, {
            ...baseForm,
            images: baseForm.images.filter(Boolean),
            localPrices: localPricesObj
          } as any);
        }
      }
      toast.success('Product setup complete!');
      router.push('/admin/products');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save regional prices');
    } finally {
      setLoading(false);
    }
  };

  // --- Render Steps ---

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Product Name *</Label>
            <Input value={baseForm.name} onChange={e => setBaseForm({ ...baseForm, name: e.target.value })} placeholder="e.g. Classic Solitaire" />
          </div>
          
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select value={baseForm.categoryId} onValueChange={v => setBaseForm({ ...baseForm, categoryId: v })}>
              <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50/50">
            <div>
              <Label className="text-base font-semibold text-slate-800">Has Variants?</Label>
              <p className="text-sm text-slate-500">Toggle on if this product has multiple sizes, colors, etc.</p>
            </div>
            <Switch checked={baseForm.has_variants} onCheckedChange={c => setBaseForm({ ...baseForm, has_variants: c })} />
          </div>

          {!baseForm.has_variants && (
            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-white">
              <div className="space-y-2">
                <Label>Base Price (₹) *</Label>
                <Input type="number" min="0" value={baseForm.price} onChange={e => setBaseForm({ ...baseForm, price: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Discount Price</Label>
                <Input type="number" min="0" value={baseForm.discountPrice} onChange={e => setBaseForm({ ...baseForm, discountPrice: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Stock Quantity *</Label>
                <Input type="number" min="0" value={baseForm.stockQty} onChange={e => setBaseForm({ ...baseForm, stockQty: Number(e.target.value) })} />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Description</Label>
            <div className="bg-white [&_.ql-editor]:min-h-[150px] [&_.ql-toolbar]:rounded-t-md [&_.ql-container]:rounded-b-md">
              <ReactQuill theme="snow" value={baseForm.description} onChange={v => setBaseForm({ ...baseForm, description: v })} />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-semibold text-slate-800">Product Details</Label>
                <p className="text-sm text-slate-500">Add key specifications (e.g. Material: Gold) to show in a table format.</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setBaseForm({ ...baseForm, details: [...baseForm.details, { key: '', value: '' }] })}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Row
              </Button>
            </div>
            <div className="space-y-2 border rounded-md p-4 bg-slate-50/50">
              {baseForm.details.map((detail, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input 
                    placeholder="Feature (e.g. Material)" 
                    value={detail.key}
                    onChange={(e) => {
                      const newDetails = [...baseForm.details];
                      newDetails[index].key = e.target.value;
                      setBaseForm({ ...baseForm, details: newDetails });
                    }}
                  />
                  <Input 
                    placeholder="Value (e.g. 18K Gold)" 
                    value={detail.value}
                    onChange={(e) => {
                      const newDetails = [...baseForm.details];
                      newDetails[index].value = e.target.value;
                      setBaseForm({ ...baseForm, details: newDetails });
                    }}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive shrink-0"
                    onClick={() => {
                      const newDetails = baseForm.details.filter((_, i) => i !== index);
                      setBaseForm({ ...baseForm, details: newDetails });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {baseForm.details.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">No details added. Click "Add Row" to start.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <VideoUpload
            value={baseForm.video || ''}
            onChange={(v) => setBaseForm({ ...baseForm, video: v })}
            label="Product Video"
          />
          <ImageUpload
            value={baseForm.images[0] || ''}
            onChange={(v) => setBaseForm({ ...baseForm, images: [v, ...baseForm.images.slice(1)] })}
            label="Primary Image *"
          />
          <MultiImageUpload
            values={baseForm.images.slice(1)}
            onChange={(urls) => setBaseForm({ ...baseForm, images: [baseForm.images[0] || '', ...urls] })}
            label="Gallery Images"
            maxImages={4}
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleCreateBaseProduct} disabled={loading} size="lg" className="gap-2">
          {loading ? (mode === 'edit' ? 'Updating...' : 'Creating...') : 'Save & Continue'}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-1">Select Variation Axes</h3>
        <p className="text-sm text-blue-700">Choose up to 2 attributes (e.g. Size, Metal Karat) to generate combinations. The options below are based on the selected Category.</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {categoryAttributes.map(ca => {
          const fullAttr = fullAttributes.find(a => a.id === ca.attribute_id);
          if (!fullAttr) return null;
          
          const isSelected = !!selectedAttributes[ca.attribute_id];
          const selectedVals = selectedAttributes[ca.attribute_id] || [];

          return (
            <Card key={ca.id} className={cn("transition-colors", isSelected ? "border-primary ring-1 ring-primary" : "")}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{fullAttr.name}</CardTitle>
                    {ca.is_required && <Badge variant="secondary" className="mt-1">Required</Badge>}
                  </div>
                  <Switch 
                    checked={isSelected}
                    onCheckedChange={(c) => {
                      const newSelected = { ...selectedAttributes };
                      if (c) {
                        if (Object.keys(newSelected).length >= 2) {
                          toast.error("You can only select up to 2 attributes.");
                          return;
                        }
                        newSelected[ca.attribute_id] = [];
                      } else {
                        delete newSelected[ca.attribute_id];
                      }
                      setSelectedAttributes(newSelected);
                    }}
                  />
                </div>
              </CardHeader>
              {isSelected && (
                <CardContent>
                  <Label className="mb-2 block">Select Values:</Label>
                  <div className="flex flex-wrap gap-2">
                    {fullAttr.values?.map(val => (
                      <Badge 
                        key={val.id} 
                        variant={selectedVals.includes(val.id) ? "default" : "outline"}
                        className="cursor-pointer hover:opacity-80 px-3 py-1"
                        onClick={() => {
                          const newSelected = { ...selectedAttributes };
                          if (newSelected[ca.attribute_id].includes(val.id)) {
                            newSelected[ca.attribute_id] = newSelected[ca.attribute_id].filter(id => id !== val.id);
                          } else {
                            newSelected[ca.attribute_id].push(val.id);
                          }
                          setSelectedAttributes(newSelected);
                        }}
                      >
                        {val.value}
                      </Badge>
                    ))}
                    {(!fullAttr.values || fullAttr.values.length === 0) && (
                      <span className="text-sm text-muted-foreground">No values added yet for this attribute.</span>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
        {categoryAttributes.length === 0 && (
          <div className="col-span-2 text-center py-8 text-muted-foreground">
            No attributes mapped to this category. Please map attributes first in the Category Mappings page.
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
        <Button onClick={handleGenerateCombinations} disabled={loading} size="lg" className="gap-2">
          {loading ? 'Generating...' : 'Generate Variants'}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <h3 className="font-medium text-amber-900 mb-1">Configure Combinations</h3>
        <p className="text-sm text-amber-800">Set weights and stock for each generated variant.</p>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b text-slate-700">
            <tr>
              <th className="px-4 py-3 font-semibold">Variant Attributes</th>
              <th className="px-4 py-3 font-semibold w-24">Stock</th>
              <th className="px-4 py-3 font-semibold w-32">Weight (g)</th>
              <th className="px-4 py-3 font-semibold w-32">Making Chg</th>
              <th className="px-4 py-3 font-semibold w-24 text-center">Active</th>
            </tr>
          </thead>
          <tbody className="divide-y bg-white">
            {variants.map((variant, idx) => (
              <tr key={variant.id || idx} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {variant.attribute_value_ids?.map((id: any) => {
                    // Try to find the name of the value
                    const vName = fullAttributes.flatMap(a => a.values).find(v => v?.id == id)?.value || `Value ${id}`;
                    return <Badge key={id} variant="secondary" className="mr-1">{vName}</Badge>;
                  }) || variant.sku}
                </td>
                <td className="px-4 py-2">
                  <Input type="number" min="0" value={variant.stock_quantity || 0} onChange={e => {
                    const newVariants = [...variants];
                    newVariants[idx].stock_quantity = Number(e.target.value);
                    setVariants(newVariants);
                  }} />
                </td>
                <td className="px-4 py-2">
                  <Input type="number" step="0.01" min="0" value={variant.weight_grams || ''} onChange={e => {
                    const newVariants = [...variants];
                    newVariants[idx].weight_grams = e.target.value ? Number(e.target.value) : null;
                    setVariants(newVariants);
                  }} />
                </td>
                <td className="px-4 py-2">
                  <Input type="number" step="0.01" min="0" value={variant.making_charges || ''} onChange={e => {
                    const newVariants = [...variants];
                    newVariants[idx].making_charges = e.target.value ? Number(e.target.value) : null;
                    setVariants(newVariants);
                  }} />
                </td>
                <td className="px-4 py-2 text-center">
                  <Switch checked={variant.is_active !== false} onCheckedChange={c => {
                    const newVariants = [...variants];
                    newVariants[idx].is_active = c;
                    setVariants(newVariants);
                  }} />
                </td>
              </tr>
            ))}
            {variants.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No variants found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
        <Button onClick={handleUpdateVariants} disabled={loading} size="lg" className="gap-2">
          {loading ? 'Saving...' : 'Save Variants'}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
        <h3 className="font-medium text-emerald-900 mb-1">Regional Pricing</h3>
        <p className="text-sm text-emerald-800">Set prices across different regions. This overrides the base price for customers in these regions.</p>
      </div>

      <div className="space-y-6">
        {(!baseForm.has_variants ? [{ id: 'base', label: 'Simple Product Pricing' }] : variants.map(v => ({
          id: v.id,
          label: v.sku || (v.attribute_value_ids?.map((id: any) => fullAttributes.flatMap(a => a.values).find(val => val?.id == id)?.value).join(' - ') || 'Variant')
        }))).map(item => (
          <Card key={item.id} className="border shadow-sm">
            <CardHeader className="bg-slate-50 border-b py-3">
              <CardTitle className="text-sm font-semibold">{item.label}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm text-left">
                <thead className="bg-white border-b text-slate-500">
                  <tr>
                    <th className="px-4 py-2 font-medium">Region</th>
                    <th className="px-4 py-2 font-medium">Price</th>
                    <th className="px-4 py-2 font-medium">Compare At (Discount)</th>
                    <th className="px-4 py-2 font-medium w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y bg-white">
                  {(regionalPricingRows[item.id] || []).map((row, index) => (
                    <tr key={row.id}>
                      <td className="px-4 py-2">
                        <Select 
                          value={row.regionId} 
                          onValueChange={v => {
                            const newRows = [...regionalPricingRows[item.id]];
                            newRows[index].regionId = v;
                            setRegionalPricingRows({ ...regionalPricingRows, [item.id]: newRows });
                          }}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Region" />
                          </SelectTrigger>
                          <SelectContent>
                            {regions.map(r => (
                              <SelectItem key={r.id} value={String(r.id)}>{r.name} ({r.currency_symbol})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-2">
                        <Input type="number" min="0" placeholder="0.00" value={row.price} onChange={e => {
                          const newRows = [...regionalPricingRows[item.id]];
                          newRows[index].price = e.target.value;
                          setRegionalPricingRows({ ...regionalPricingRows, [item.id]: newRows });
                        }} />
                      </td>
                      <td className="px-4 py-2">
                        <Input type="number" min="0" placeholder="0.00" value={row.compare} onChange={e => {
                          const newRows = [...regionalPricingRows[item.id]];
                          newRows[index].compare = e.target.value;
                          setRegionalPricingRows({ ...regionalPricingRows, [item.id]: newRows });
                        }} />
                      </td>
                      <td className="px-4 py-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive"
                          onClick={() => {
                            const newRows = regionalPricingRows[item.id].filter(r => r.id !== row.id);
                            setRegionalPricingRows({ ...regionalPricingRows, [item.id]: newRows });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={4} className="p-3 bg-slate-50/50">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full gap-2 border-dashed border-slate-300 text-slate-500 hover:text-slate-700 hover:border-slate-400"
                        onClick={() => {
                          const newRows = [...(regionalPricingRows[item.id] || [])];
                          newRows.push({ id: crypto.randomUUID(), regionId: '', price: '', compare: '' });
                          setRegionalPricingRows({ ...regionalPricingRows, [item.id]: newRows });
                        }}
                      >
                        <Plus className="h-4 w-4" /> Add Region Row
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={() => setStep(baseForm.has_variants ? 3 : 1)}>Back</Button>
        <Button onClick={handleFinish} disabled={loading} size="lg" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          {loading ? 'Saving...' : 'Finish Setup'}
          {!loading && <CheckCircle2 className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/admin/products')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{mode === 'edit' ? 'Edit Product' : 'Add New Product'}</h1>
          <p className="text-sm text-slate-500">{mode === 'edit' ? 'Update your product and its variants.' : 'Create a product with variants step-by-step.'}</p>
        </div>
      </div>

      {/* Stepper Header */}
      <div className="flex items-center justify-between p-4 bg-white border rounded-xl shadow-sm">
        {(baseForm.has_variants ? STEPS : STEPS.filter(s => s.id === 1 || s.id === 4)).map((s, i, arr) => (
          <React.Fragment key={s.id}>
            <div className={cn("flex flex-col items-center gap-2", step >= s.id ? "text-primary" : "text-slate-400")}>
              <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors",
                step > s.id ? "bg-primary border-primary text-primary-foreground" :
                step === s.id ? "border-primary bg-primary/10" : "border-slate-200 bg-slate-50"
              )}>
                <s.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider">{s.title}</span>
            </div>
            {i < arr.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 mx-4 transition-colors",
                step > s.id ? "bg-primary" : "bg-slate-200"
              )} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <Card className="border-0 shadow-sm ring-1 ring-slate-200">
        <CardContent className="p-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </CardContent>
      </Card>
    </div>
  );
}
