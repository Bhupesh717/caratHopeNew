'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { ProductFormState, AdminAttribute, ProductVariantFormState } from '../../../_types';
import { attributeService } from '../../../_services/attribute.service';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ChevronDown, Check, X, Search } from 'lucide-react';

// ─── Variation Checkbox Multi-Select Dropdown ───────────────────────────────
interface VariationMultiSelectProps {
  options: { id: string; value: string }[];
  selected: string[]; // array of selected IDs
  onChange: (next: string[]) => void;
  placeholder?: string;
  onOpenChange?: (open: boolean) => void;
}

function VariationMultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select options',
  onOpenChange,
}: VariationMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSetOpen = (next: boolean | ((prev: boolean) => boolean)) => {
    setOpen((prev) => {
      const val = typeof next === 'function' ? next(prev) : next;
      onOpenChange?.(val);
      return val;
    });
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleSetOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((v) => v !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter((o) => o.value.toLowerCase().includes(q));
  }, [options, search]);

  return (
    <div ref={containerRef} className="relative w-full space-y-2">
      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => handleSetOpen((p) => !p)}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors',
          'hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          open && 'ring-2 ring-ring ring-offset-2',
          selected.length === 0 && 'text-muted-foreground'
        )}
      >
        <span className="truncate text-left font-normal">
          {selected.length === 0
            ? placeholder
            : `${selected.length} value(s) selected`}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0 ml-2',
            open && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-2xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150 p-2">
          {/* Search box if more than 4 options */}
          {options.length > 4 && (
            <div className="relative mb-2 px-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search values..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          <div className="max-h-[220px] overflow-y-auto space-y-0.5">
            {filteredOptions.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No matching values</p>
            ) : (
              filteredOptions.map((opt) => {
                const isChecked = selected.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggle(opt.id);
                    }}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs transition-colors cursor-pointer text-left',
                      isChecked
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                        isChecked ? 'border-primary bg-primary' : 'border-slate-300 bg-white'
                      )}
                    >
                      {isChecked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                    </span>
                    <span className="truncate">{opt.value}</span>
                  </button>
                );
              })
            )}
          </div>

          {selected.length > 0 && (
            <div className="flex justify-between items-center px-2 pt-2 mt-1 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">{selected.length} selected</span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange([]);
                }}
                className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}

      {/* Selected badges display */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {selected.map((valId) => {
            const label = options.find((o) => o.id === valId)?.value || valId;
            return (
              <Badge
                key={valId}
                variant="secondary"
                className="gap-1 pr-1.5 bg-slate-100 text-slate-900 border border-slate-300 text-xs py-0.5 font-semibold"
              >
                {label}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggle(valId);
                  }}
                  className="rounded-full hover:bg-slate-300 p-0.5 transition-colors cursor-pointer"
                >
                  <X className="h-2.5 w-2.5 text-slate-500" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Step3Variations({ form, setForm }: { form: ProductFormState, setForm: (f: ProductFormState) => void }) {
  const [variationAttributes, setVariationAttributes] = useState<AdminAttribute[]>([]);
  const [fullAttributes, setFullAttributes] = useState<AdminAttribute[]>([]);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Track selected axes (attrId -> selected value IDs[])
  const [selectedAxes, setSelectedAxes] = useState<Record<string, string[]>>({});

  const prevCategoryRef = useRef<string | number | undefined>(form.category_id);

  useEffect(() => {
    if (prevCategoryRef.current !== form.category_id) {
      prevCategoryRef.current = form.category_id;
      setSelectedAxes({});
      setOpenDropdownId(null);
    }

    if (form.category_id) {
      attributeService.getAll({ can_be_variation: true })
        .then(res => setVariationAttributes(res))
        .catch(() => toast.error('Failed to load variation axes'));
    } else {
      setVariationAttributes([]);
    }
    attributeService.getAll().then(setFullAttributes);
  }, [form.category_id]);

  // Restore selectedAxes from form.variants and fullAttributes in edit mode
  useEffect(() => {
    if (
      fullAttributes.length > 0 &&
      form.variants &&
      form.variants.length > 0 &&
      Object.keys(selectedAxes).length === 0
    ) {
      const restored: Record<string, string[]> = {};

      for (const variant of form.variants) {
        const valIds = variant.attributes || (variant as any).attribute_value_ids || [];
        for (const valId of valIds) {
          const strValId = String(valId);
          // Find which attribute this value belongs to
          const ownerAttr = fullAttributes.find((a) =>
            a.values?.some((v) => String(v.id) === strValId)
          );
          if (ownerAttr) {
            const axisId = String(ownerAttr.id);
            if (!restored[axisId]) {
              restored[axisId] = [];
            }
            if (!restored[axisId].includes(strValId)) {
              restored[axisId].push(strValId);
            }
          }
        }
      }

      // If form.variation_axis_ids exists and has axes that had no variants
      if (form.variation_axis_ids && form.variation_axis_ids.length > 0) {
        for (const axisId of form.variation_axis_ids) {
          if (!restored[axisId]) {
            restored[axisId] = [];
          }
        }
      }

      if (Object.keys(restored).length > 0) {
        setSelectedAxes(restored);
        setForm({
          ...form,
          variation_axis_ids: Object.keys(restored),
        });
      }
    }
  }, [fullAttributes, form.variants]);

  const handleToggleAxis = (attrId: string, checked: boolean) => {
    const newAxes = { ...selectedAxes };
    if (checked) {
      newAxes[attrId] = [];
    } else {
      delete newAxes[attrId];
    }
    setSelectedAxes(newAxes);
    // Always keep variation_axis_ids in sync so Step 4 can filter correctly
    setForm({ ...form, variation_axis_ids: Object.keys(newAxes) });
  };

  const generateGrid = () => {
    const activeAxesKeys = Object.keys(selectedAxes).filter(k => selectedAxes[k].length > 0);

    if (activeAxesKeys.length === 0) {
      toast.error('Please select at least one value from a variation axis.');
      return;
    }

    // Cartesian product of selected values
    const generateCombinations = (arrays: string[][]): string[][] => {
      if (arrays.length === 0) return [[]];
      const result: string[][] = [];
      const rest = generateCombinations(arrays.slice(1));
      for (const item of arrays[0]) {
        for (const r of rest) {
          result.push([item, ...r]);
        }
      }
      return result;
    };

    const combinations = generateCombinations(activeAxesKeys.map(k => selectedAxes[k]));

    const newVariants: ProductVariantFormState[] = combinations.map(combo => ({
      attributes: combo,
      is_active: true,
      prices: form.prices_vary ? [] : undefined,
      stock_quantity: form.quantities_vary ? 0 : undefined,
      sku: form.skus_vary ? '' : undefined,
      processing_days: form.processing_time_varies ? 0 : undefined,
    }));

    setForm({
      ...form,
      variants: newVariants,
      variation_axis_ids: activeAxesKeys,
    });
    toast.success(`Generated ${newVariants.length} variant(s)!`);
  };

  const getValueLabel = (valId: string | number) => {
    for (const attr of fullAttributes) {
      const val = attr.values?.find(v => String(v.id) === String(valId));
      if (val) return val.value;
    }
    return String(valId);
  };

  // Only show attributes that have actual selectable values
  const usableVariationAttributes = variationAttributes.filter(attr => {
    return attr.values && attr.values.length > 0;
  });

  return (
    <div className="space-y-8 max-w-4xl">

      {/* Behavior Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-slate-50/80 border border-slate-200 rounded-2xl">
        <div className="sm:col-span-2 mb-2">
          <Label className="text-lg font-semibold text-slate-900">Variation Behavior</Label>
          <p className="text-xs text-slate-500 mt-0.5">Define how variations behave for this product.</p>
        </div>

        <div className="flex items-start space-x-3">
          <Switch
            id="has_variants"
            checked={form.has_variants}
            onCheckedChange={c => {
              if (!c) setSelectedAxes({});
              setForm({
                ...form,
                has_variants: c,
                variants: c ? form.variants : [],
                variation_axis_ids: c ? form.variation_axis_ids : [],
              });
            }}
          />
          <div>
            <Label htmlFor="has_variants" className="font-semibold text-sm text-slate-900">Has Variations</Label>
            <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">Enable if this product comes in different options like sizes or colours.</p>
          </div>
        </div>

        {form.has_variants && (
          <>
            <div className="flex items-start space-x-3">
              <Switch
                id="prices_vary"
                checked={form.prices_vary}
                onCheckedChange={c => setForm({ ...form, prices_vary: c })}
              />
              <div>
                <Label htmlFor="prices_vary" className="font-semibold text-sm text-slate-900">Prices vary</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Each variant carries its own price.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Switch
                id="quantities_vary"
                checked={form.quantities_vary}
                onCheckedChange={c => setForm({ ...form, quantities_vary: c })}
              />
              <div>
                <Label htmlFor="quantities_vary" className="font-semibold text-sm text-slate-900">Quantities vary</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Track stock separately per variant.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Switch
                id="skus_vary"
                checked={form.skus_vary}
                onCheckedChange={c => setForm({ ...form, skus_vary: c })}
              />
              <div>
                <Label htmlFor="skus_vary" className="font-semibold text-sm text-slate-900">SKUs vary</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Each variant has its own SKU.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Switch
                id="processing_time_varies"
                checked={form.processing_time_varies}
                onCheckedChange={c => setForm({ ...form, processing_time_varies: c })}
              />
              <div>
                <Label htmlFor="processing_time_varies" className="font-semibold text-sm text-slate-900">Processing time varies</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Variants take different times to make.</p>
              </div>
            </div>
          </>
        )}
      </div>

      {form.has_variants && (
        <>
          {/* Axis Picker — with Checkbox Multi-Select Dropdown */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold text-slate-900">Select Variation Type(s)</Label>
              <p className="text-xs text-slate-500 mt-0.5">
                Pick which attribute(s) define your variants (e.g. Gemstone, Primary colour). Select values from the dropdown.
              </p>
            </div>

            {usableVariationAttributes.length === 0 && fullAttributes.length > 0 ? (
              <p className="text-sm text-amber-600 p-4 bg-amber-50 rounded-xl border border-amber-200">
                No selectable variation attributes found for this category. Please add predefined values to variation attributes in Product Masters → Attributes.
              </p>
            ) : usableVariationAttributes.length === 0 ? (
              <p className="text-sm text-slate-400 p-4 bg-slate-50 rounded-xl">Loading variation options...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {usableVariationAttributes.map(fullAttr => {
                  const attrIdStr = String(fullAttr.id);
                  const isSelected = attrIdStr in selectedAxes;
                  const selectedVals = selectedAxes[attrIdStr] || [];
                  const displayValues = fullAttr.values || [];
                  const isDropdownOpen = openDropdownId === attrIdStr;

                  return (
                    <Card
                      key={fullAttr.id}
                      className={cn(
                        "transition-all border rounded-2xl overflow-visible",
                        isDropdownOpen ? "z-30 relative ring-2 ring-primary/40 border-primary" : isSelected ? "border-primary shadow-sm ring-1 ring-primary/30 bg-white" : "border-slate-200 bg-white hover:border-slate-300"
                      )}
                    >
                      <CardHeader className="py-3 px-5 flex flex-row items-center justify-between space-y-0 border-b bg-slate-50/50 rounded-t-2xl">
                        <CardTitle className="text-sm font-semibold text-slate-900">{fullAttr.name}</CardTitle>
                        <Switch
                          checked={isSelected}
                          onCheckedChange={(c) => handleToggleAxis(attrIdStr, c)}
                        />
                      </CardHeader>
                      {isSelected && (
                        <CardContent className="p-4 space-y-2 overflow-visible">
                          <p className="text-xs text-slate-500">Select values to include in variant matrix:</p>
                          <VariationMultiSelect
                            options={displayValues.map((v: any) => ({ id: String(v.id), value: v.value }))}
                            selected={selectedVals}
                            onChange={(next) => {
                              const newAxes = { ...selectedAxes, [attrIdStr]: next };
                              setSelectedAxes(newAxes);
                            }}
                            onOpenChange={(isOpen) => setOpenDropdownId(isOpen ? attrIdStr : null)}
                            placeholder={`Select ${fullAttr.name}...`}
                          />
                          {selectedVals.length === 0 && (
                            <p className="text-xs text-amber-600 font-medium">Select at least one value from the dropdown above.</p>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}

            {Object.keys(selectedAxes).length > 0 && (
              <Button onClick={generateGrid} className="w-full mt-4 gap-2 bg-primary hover:bg-primary/90" size="lg">
                Generate Variant Matrix
              </Button>
            )}
          </div>

          {/* Generated Variant Grid */}
          {form.variants && form.variants.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold text-slate-900">Generated Variant Matrix ({form.variants.length})</Label>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Variant</th>
                      {form.quantities_vary && <th className="px-4 py-3 font-semibold w-28">Stock</th>}
                      {form.skus_vary && <th className="px-4 py-3 font-semibold w-44">SKU</th>}
                      {form.processing_time_varies && <th className="px-4 py-3 font-semibold w-28">Proc. Days</th>}
                      <th className="px-4 py-3 font-semibold w-24 text-center">Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {form.variants.map((variant, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {variant.attributes.map(id => (
                            <span
                              key={id}
                              className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800 text-white shadow-xs mr-1.5"
                            >
                              {getValueLabel(id)}
                            </span>
                          ))}
                        </td>
                        {form.quantities_vary && (
                          <td className="px-4 py-2">
                            <Input
                              type="number" min="0"
                              value={variant.stock_quantity ?? ''}
                              onChange={e => {
                                const newVars = [...(form.variants || [])];
                                newVars[idx] = { ...newVars[idx], stock_quantity: e.target.value ? Number(e.target.value) : undefined };
                                setForm({ ...form, variants: newVars });
                              }}
                              placeholder="0"
                              className="h-9"
                            />
                          </td>
                        )}
                        {form.skus_vary && (
                          <td className="px-4 py-2">
                            <Input
                              value={variant.sku || ''}
                              placeholder="SKU code"
                              onChange={e => {
                                const newVars = [...(form.variants || [])];
                                newVars[idx] = { ...newVars[idx], sku: e.target.value || undefined };
                                setForm({ ...form, variants: newVars });
                              }}
                              className="h-9 font-mono text-xs"
                            />
                          </td>
                        )}
                        {form.processing_time_varies && (
                          <td className="px-4 py-2">
                            <Input
                              type="number" min="0"
                              value={variant.processing_days ?? ''}
                              onChange={e => {
                                const newVars = [...(form.variants || [])];
                                newVars[idx] = { ...newVars[idx], processing_days: e.target.value ? Number(e.target.value) : undefined };
                                setForm({ ...form, variants: newVars });
                              }}
                              placeholder="Days"
                              className="h-9"
                            />
                          </td>
                        )}
                        <td className="px-4 py-2 text-center">
                          <Switch
                            checked={variant.is_active !== false}
                            onCheckedChange={c => {
                              const newVars = [...(form.variants || [])];
                              newVars[idx] = { ...newVars[idx], is_active: c };
                              setForm({ ...form, variants: newVars });
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {form.prices_vary && (
                <p className="text-xs text-blue-700 p-3 bg-blue-50/80 rounded-xl border border-blue-200">
                  Since <strong>Prices vary</strong> is enabled, you can configure individual prices per variant in Section 5 (Pricing &amp; Delivery).
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
