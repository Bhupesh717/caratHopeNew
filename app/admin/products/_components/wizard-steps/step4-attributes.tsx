'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ProductFormState, AdminAttribute } from '../../../_types';
import { categoryAttributeService } from '../../../_services/category-attribute.service';
import { attributeService } from '../../../_services/attribute.service';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Checkbox Multi-Select Dropdown ─────────────────────────────────────────
interface CheckboxMultiSelectProps {
  options: { id: string; value: string }[];
  selected: string[]; // selected IDs or string labels
  onChange: (next: string[]) => void;
  maxSelections?: number;
  placeholder?: string;
}

function CheckboxMultiSelect({ options, selected = [], onChange, maxSelections, placeholder }: CheckboxMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const safeSelected = Array.isArray(selected) ? selected.map(v => typeof v === 'object' && v !== null ? String((v as any).id || (v as any).value || '') : String(v)).filter(Boolean) : [];

  const toggle = (valId: string) => {
    const strId = String(valId);
    if (safeSelected.includes(strId)) {
      onChange(safeSelected.filter(v => v !== strId));
    } else {
      if (maxSelections && safeSelected.length >= maxSelections) return;
      onChange([...safeSelected, strId]);
    }
  };

  const getOptionLabel = (valId: any) => {
    if (typeof valId === 'object' && valId !== null) {
      valId = valId.id || valId.value || '';
    }
    const strId = String(valId);
    const found = options.find(o => String(o.id) === strId || o.value === strId);
    return found ? found.value : strId;
  };

  const placeholderText = maxSelections
    ? placeholder || `Select up to ${maxSelections}`
    : placeholder || 'Select options';

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors',
          'hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          open && 'ring-2 ring-ring ring-offset-2',
          safeSelected.length === 0 && 'text-muted-foreground'
        )}
      >
        <span className="truncate">
          {safeSelected.length === 0
            ? placeholderText
            : safeSelected.length === 1
              ? getOptionLabel(safeSelected[0])
              : `${safeSelected.length} selected`}
        </span>
        <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0', open && 'rotate-180')} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150">
          {maxSelections && (
            <div className="px-3 pt-2 pb-1 text-xs text-muted-foreground border-b border-slate-100">
              Select up to {maxSelections}
              {safeSelected.length > 0 && (
                <span className="ml-1 text-primary font-medium">({safeSelected.length}/{maxSelections} selected)</span>
              )}
            </div>
          )}
          <div className="max-h-[220px] overflow-y-auto p-1">
            {options.map(opt => {
              const isChecked = safeSelected.includes(String(opt.id)) || safeSelected.includes(opt.value);
              const isDisabled = !isChecked && !!maxSelections && safeSelected.length >= maxSelections;
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => toggle(String(opt.id))}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs transition-colors cursor-pointer text-left',
                    isChecked ? 'bg-primary/10 text-primary font-medium' : 'text-slate-700 hover:bg-slate-50',
                    isDisabled && 'opacity-40 cursor-not-allowed'
                  )}
                >
                  <span className={cn(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                    isChecked ? 'border-primary bg-primary' : 'border-slate-300 bg-white'
                  )}>
                    {isChecked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                  </span>
                  <span className="truncate">{opt.value}</span>
                </button>
              );
            })}
          </div>
          {safeSelected.length > 0 && (
            <div className="px-2.5 py-1.5 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[11px] text-slate-400">{safeSelected.length} selected</span>
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs text-red-500 hover:text-red-700 transition-colors font-medium cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}

      {/* Selected badges */}
      {safeSelected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {safeSelected.map(val => (
            <Badge key={typeof val === 'object' ? JSON.stringify(val) : String(val)} variant="secondary" className="gap-1 pr-1.5 text-xs py-0.5 font-normal bg-slate-100 text-slate-700 border border-slate-200">
              {getOptionLabel(val)}
              <button
                type="button"
                onClick={() => toggle(typeof val === 'object' ? String((val as any).id || (val as any).value) : String(val))}
                className="rounded-full hover:bg-slate-300 p-0.5 transition-colors cursor-pointer"
              >
                <X className="h-2.5 w-2.5 text-slate-500" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function Step4Attributes({ form, setForm }: { form: ProductFormState, setForm: (f: ProductFormState) => void }) {
  const [attributes, setAttributes] = useState<any[]>([]);
  const [fullAttributes, setFullAttributes] = useState<AdminAttribute[]>([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (form.category_id) {
      categoryAttributeService.getByCategory(String(form.category_id))
        .then(res => setAttributes(res || []));
    } else {
      setAttributes([]);
    }
    attributeService.getAll().then(setFullAttributes);
  }, [form.category_id]);

  // ── helpers ──────────────────────────────────────────────────────────────
  const getSelectedArray = (slug: string): string[] => {
    const isStandard = ['materials', 'gold_solidity', 'gold_purity'].includes(slug);
    let raw: any = isStandard ? (form[slug as keyof ProductFormState] as any) : form.listing_attributes?.[slug];
    
    // If raw is an object like { attribute_id: 12, attribute_value_ids: [63] }
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      if (Array.isArray(raw.attribute_value_ids)) {
        raw = raw.attribute_value_ids;
      } else if (raw.value) {
        raw = Array.isArray(raw.value) ? raw.value : [raw.value];
      }
    }

    if (Array.isArray(raw)) {
      return raw.map((item: any) => {
        if (typeof item === 'object' && item !== null) {
          return String(item.id || item.value || '');
        }
        return String(item);
      }).filter(Boolean);
    }

    if (raw !== undefined && raw !== null && raw !== '') {
      return [String(raw)];
    }
    return [];
  };

  const setSelectedArray = (slug: string, next: string[], fullAttr?: AdminAttribute) => {
    const isStandard = ['materials', 'gold_solidity', 'gold_purity'].includes(slug);
    const numericIds = next.map(Number).filter((n) => !isNaN(n));
    
    if (isStandard) {
      setForm({ ...form, [slug]: numericIds });
    } else {
      const listing = { ...(form.listing_attributes || {}) };
      if (fullAttr) {
        listing[slug] = {
          attribute_id: fullAttr.id,
          attribute_value_ids: numericIds,
        };
      } else {
        listing[slug] = numericIds;
      }
      setForm({ ...form, listing_attributes: listing });
    }
  };

  const getScalarValue = (slug: string): string => {
    const raw = form.listing_attributes?.[slug];
    if (raw === undefined || raw === null) return '';
    if (typeof raw === 'object') {
      if (raw.value !== undefined) return String(raw.value);
      if (Array.isArray(raw.attribute_value_ids)) return String(raw.attribute_value_ids[0] || '');
      return '';
    }
    return String(raw);
  };

  const setScalarValue = (slug: string, value: any, fullAttr?: AdminAttribute) => {
    const listing = { ...(form.listing_attributes || {}) };
    if (fullAttr && fullAttr.input_type !== 'select') {
      listing[slug] = {
        attribute_id: fullAttr.id,
        value: value,
      };
    } else {
      listing[slug] = value;
    }
    setForm({ ...form, listing_attributes: listing });
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().toLowerCase();
      if (val && !(form.tags || []).includes(val)) {
        if ((form.tags || []).length >= 13) return;
        setForm({ ...form, tags: [...(form.tags || []), val] });
      }
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setForm({ ...form, tags: (form.tags || []).filter(t => t !== tag) });
  };

  // Attributes that are variation axes (chosen in Step 3) — excluded here
  const variationAxisIds = new Set(form.variation_axis_ids?.map(String) || []);

  const nonVariationAttributes = attributes.filter(ca => {
    if (!form.has_variants) return true;
    return !variationAxisIds.has(String(ca.attribute_id));
  });

  return (
    <div className="space-y-8 max-w-4xl">

      {/* ── Search Tags ── */}
      <div className="space-y-3 p-5 bg-slate-50/80 border border-slate-200 rounded-2xl">
        <div>
          <Label className="text-base font-semibold text-slate-900">Search Tags</Label>
          <p className="text-xs text-muted-foreground mt-0.5">Add up to 13 discovery tags for customer search. Press Enter or comma to add.</p>
        </div>
        <Input
          value={tagInput}
          onChange={e => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder="e.g. pendant, gemstone, gold vermeil, gift for her"
          disabled={(form.tags || []).length >= 13}
          className="bg-white"
        />
        <div className="flex flex-wrap gap-1.5">
          {(form.tags || []).map(tag => (
            <Badge key={tag} variant="secondary" className="cursor-pointer gap-1 pr-1.5 py-0.5 text-xs bg-white border border-slate-200 shadow-2xs font-normal" onClick={() => removeTag(tag)}>
              #{tag}
              <X className="h-2.5 w-2.5 text-slate-400 hover:text-slate-700" />
            </Badge>
          ))}
        </div>
      </div>

      {/* ── Product Attributes Grid ── */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold text-slate-900">Specifications & Attributes</Label>
          <p className="text-xs text-slate-500 mt-0.5">Set category-specific properties, materials, purity and features.</p>
        </div>

        {nonVariationAttributes.length === 0 && (
          <p className="text-xs text-slate-400 p-4 bg-slate-50 rounded-xl border border-slate-200">
            No additional attributes required for this category.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {nonVariationAttributes.map(ca => {
            const fullAttr = fullAttributes.find(a => a.id === ca.attribute_id);
            if (!fullAttr) return null;

            return (
              <div key={ca.id} className="space-y-1.5 p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
                <Label className="text-xs font-semibold text-slate-800">{fullAttr.name}{ca.is_required ? ' *' : ''}</Label>

                {fullAttr.input_type === 'select' ? (
                  // ── All select-type → Checkbox Multi-Select ──────────────
                  <CheckboxMultiSelect
                    options={(fullAttr.values || []).map(v => ({ id: String(v.id), value: v.value }))}
                    selected={getSelectedArray(fullAttr.slug)}
                    onChange={next => setSelectedArray(fullAttr.slug, next, fullAttr)}
                    maxSelections={fullAttr.max_selections ?? undefined}
                    placeholder={`Select ${fullAttr.name}`}
                  />

                ) : fullAttr.input_type === 'boolean' ? (
                  // ── Boolean → Switch ─────────────────────────────────────
                  <div className="flex items-center space-x-2 pt-1.5">
                    <Switch
                      checked={getScalarValue(fullAttr.slug) === 'true' || getScalarValue(fullAttr.slug) === '1' || getScalarValue(fullAttr.slug) === true as any}
                      onCheckedChange={c => setScalarValue(fullAttr.slug, c, fullAttr)}
                    />
                    <Label className="text-xs text-slate-600 font-normal">Yes / Included</Label>
                  </div>

                ) : (
                  // ── number / text → Input + optional unit ────────────────
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input
                        type={fullAttr.input_type === 'number' ? 'number' : 'text'}
                        value={getScalarValue(fullAttr.slug)}
                        onChange={e => setScalarValue(fullAttr.slug, e.target.value, fullAttr)}
                        placeholder={`Enter ${fullAttr.name}`}
                        className="h-9 text-xs"
                      />
                    </div>
                    {fullAttr.allowed_units && fullAttr.allowed_units.length > 0 ? (
                      <div className="w-28 shrink-0">
                        <Select
                          value={form.listing_attributes?.[`${fullAttr.slug}_unit`] || fullAttr.allowed_units[0]}
                          onValueChange={v => setScalarValue(`${fullAttr.slug}_unit`, v)}
                        >
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {fullAttr.allowed_units.map((u: string) => (
                              <SelectItem key={u} value={u}>{u}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : fullAttr.unit ? (
                      <span className="text-xs text-muted-foreground pb-2 shrink-0">{fullAttr.unit}</span>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
