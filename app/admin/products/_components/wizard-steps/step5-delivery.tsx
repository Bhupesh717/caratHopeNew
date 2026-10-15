'use client';

import React, { useEffect, useState } from 'react';
import { ProductFormState, AdminRegion, AdminProcessingProfile, AdminShippingProfile } from '../../../_types';
import { regionService } from '../../../_services/region.service';
import { attributeService } from '../../../_services/attribute.service';
import { processingProfileService } from '../../../_services/processing-profile.service';
import { shippingProfileService } from '../../../_services/shipping-profile.service';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tag, Truck, Globe, DollarSign, Percent, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function Step5Delivery({ form, setForm }: { form: ProductFormState, setForm: React.Dispatch<React.SetStateAction<ProductFormState>> }) {
  const [regions, setRegions] = useState<AdminRegion[]>([]);
  const [fullAttributes, setFullAttributes] = useState<any[]>([]);
  const [processingProfiles, setProcessingProfiles] = useState<AdminProcessingProfile[]>([]);
  const [shippingProfiles, setShippingProfiles] = useState<AdminShippingProfile[]>([]);

  useEffect(() => {
    regionService.getAll().then((data) => {
      setRegions(data);

      // Auto-populate default GST rates from regions if currently empty
      // IMPORTANT: Use functional updater to avoid stale closure wiping edit-mode data
      setForm((prev) => {
        if (prev.gst_rates && prev.gst_rates.length > 0) return prev;
        const initialGst = data.map((r) => {
          const rule = r.tax_rules?.[0] || r.taxRules?.[0];
          let defaultRate = 0;
          if (rule && rule.tax_percentage !== undefined) {
            defaultRate = Number(rule.tax_percentage);
          } else if (r.name.toLowerCase().includes('india')) {
            defaultRate = 3; // Standard 3% GST on jewellery in India
          }
          return {
            region_id: Number(r.id),
            gst_percentage: defaultRate,
          };
        });
        return { ...prev, gst_rates: initialGst };
      });
    });

    attributeService.getAll().then(setFullAttributes);
    processingProfileService.getAll().then(setProcessingProfiles).catch(() => { });
    shippingProfileService.getAll().then(setShippingProfiles).catch(() => { });
  }, []);

  const getAttributeNameFromValueId = (valId: string | number) => {
    for (const attr of fullAttributes) {
      const val = attr.values?.find((v: any) => String(v.id) === String(valId));
      if (val) return val.value;
    }
    return valId;
  };

  const handlePriceUpdate = (variantIndex: number | null, regionId: number, field: 'price' | 'compare_at_price', value: string) => {
    const numericValue = value ? Number(value) : undefined;

    if (variantIndex === null) {
      // Top-level pricing
      const currentPrices = [...(form.prices || [])];
      const existingIdx = currentPrices.findIndex(p => String(p.region_id) === String(regionId));

      if (existingIdx >= 0) {
        currentPrices[existingIdx] = { ...currentPrices[existingIdx], [field]: numericValue };
      } else {
        currentPrices.push({ region_id: regionId, [field]: numericValue } as any);
      }
      setForm({ ...form, prices: currentPrices.filter(p => p.price !== undefined || p.compare_at_price !== undefined) });
    } else {
      // Variant-level pricing
      const newVariants = [...(form.variants || [])];
      const newVariant = { ...newVariants[variantIndex] };
      const currentPrices = [...(newVariant.prices || [])];
      const existingIdx = currentPrices.findIndex(p => String(p.region_id) === String(regionId));

      if (existingIdx >= 0) {
        currentPrices[existingIdx] = { ...currentPrices[existingIdx], [field]: numericValue };
      } else {
        currentPrices.push({ region_id: regionId, [field]: numericValue } as any);
      }

      newVariant.prices = currentPrices.filter(p => p.price !== undefined || p.compare_at_price !== undefined);
      newVariants[variantIndex] = newVariant;
      setForm({ ...form, variants: newVariants });
    }
  };

  // GST rate update handlers
  const handleGstUpdate = (regionId: number | string, value: string | number) => {
    const currentRates = [...(form.gst_rates || [])];
    const existingIdx = currentRates.findIndex(g => String(g.region_id) === String(regionId));

    if (value === '' || value === undefined || value === null) {
      if (existingIdx >= 0) {
        currentRates.splice(existingIdx, 1);
      }
    } else {
      const numVal = Number(value);
      if (existingIdx >= 0) {
        currentRates[existingIdx] = { ...currentRates[existingIdx], gst_percentage: numVal };
      } else {
        currentRates.push({ region_id: Number(regionId), gst_percentage: numVal });
      }
    }

    setForm({ ...form, gst_rates: currentRates });
  };

  const getGstValue = (regionId: number | string): string | number => {
    const found = (form.gst_rates || []).find(g => String(g.region_id) === String(regionId));
    if (found && found.gst_percentage !== undefined && found.gst_percentage !== null) {
      return found.gst_percentage;
    }
    return '';
  };

  const renderPricingGrid = (title: string, prices: any[], variantIndex: number | null = null) => {
    // Only show default region if global pricing is off
    const displayRegions = form.is_global_pricing_enabled ? regions : regions.filter(r => r.is_default);

    return (
      <Card className="border border-slate-200 shadow-sm rounded-xl mb-4 overflow-hidden" key={title}>
        <CardHeader className="bg-slate-50/80 border-b py-2.5 px-4">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-800">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-xs sm:text-sm text-left">
            <thead className="bg-white border-b border-slate-100 text-slate-500 font-medium">
              <tr>
                <th className="px-4 py-2.5">Region</th>
                <th className="px-4 py-2.5">Price</th>
                <th className="px-4 py-2.5">Compare At (Original)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {displayRegions.map(r => {
                const priceObj = prices.find(p => String(p.region_id) === String(r.id)) || { price: '', compare_at_price: '' };
                return (
                  <tr key={r.id} className="hover:bg-slate-50/40">
                    <td className="px-4 py-2 font-medium text-slate-700">
                      {r.name} ({r.currency_symbol} {r.currency_code})
                      {r.is_default && <Badge variant="secondary" className="ml-2 text-[10px] bg-slate-100">Default</Badge>}
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        type="number" min="0"
                        placeholder="0.00"
                        value={priceObj.price ?? ''}
                        onChange={e => handlePriceUpdate(variantIndex, Number(r.id), 'price', e.target.value)}
                        className="h-8 text-xs"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        type="number" min="0"
                        placeholder="0.00"
                        value={priceObj.compare_at_price ?? ''}
                        onChange={e => handlePriceUpdate(variantIndex, Number(r.id), 'compare_at_price', e.target.value)}
                        className="h-8 text-xs"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* LEFT COLUMN: Pricing */}
        <div className="space-y-6">
          <div className="mb-2">
            <Label className="text-lg font-semibold flex items-center gap-2 text-slate-900">
              <DollarSign className="h-5 w-5 text-primary" /> Pricing Options
            </Label>
            <p className="text-xs text-slate-500 mt-0.5">Configure base or per-variant regional pricing.</p>
          </div>

          <div className="flex items-start space-x-3 p-4 border border-slate-200 rounded-xl bg-slate-50/70">
            <Switch
              id="is_global_pricing_enabled"
              checked={form.is_global_pricing_enabled !== false}
              onCheckedChange={c => {
                setForm({ ...form, is_global_pricing_enabled: c });
              }}
            />
            <div>
              <Label htmlFor="is_global_pricing_enabled" className="font-semibold text-sm text-slate-900">Domestic & Global Pricing</Label>
              <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">If ON, you can set prices for all regions. If OFF, only default region price is used.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border border-slate-200 rounded-xl bg-slate-50/70">
            <Switch
              id="allow_offers"
              checked={form.allow_offers === true}
              onCheckedChange={c => setForm({ ...form, allow_offers: c })}
            />
            <div className="flex-1">
              <Label htmlFor="allow_offers" className="font-semibold text-sm text-slate-900">Allow Buyer Offers</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Allow buyers to make price offers on this product.</p>
              {form.allow_offers && (
                <div className="mt-3">
                  <Label className="text-xs text-slate-600 mb-1 block">Maximum offer discount percent (1-100%)</Label>
                  <Input
                    type="number" min="1" max="100"
                    value={form.max_offer_discount_percent || ''}
                    onChange={e => setForm({ ...form, max_offer_discount_percent: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="e.g. 15"
                    className="h-8 text-xs max-w-[140px]"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="pt-2">
            <Label className="text-base font-semibold block mb-3 text-slate-900">Regional Price Matrix</Label>
            {!form.has_variants || !form.prices_vary ? (
              // Shared/Base Pricing
              renderPricingGrid("Base Product Pricing", form.prices || [])
            ) : (
              // Variant Pricing
              <div>
                <p className="text-xs text-slate-500 mb-3">Since "Prices vary" is ON, please enter price per variant below:</p>
                {(form.variants || []).map((v, idx) => {
                  const label = v.attributes.map(id => getAttributeNameFromValueId(id)).join(' - ');
                  return renderPricingGrid(`Variant: ${label}`, v.prices || [], idx);
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Stock & Delivery */}
        <div className="space-y-6">
          <div className="mb-2">
            <Label className="text-lg font-semibold flex items-center gap-2 text-slate-900">
              <Truck className="h-5 w-5 text-primary" /> Inventory & Delivery
            </Label>
            <p className="text-xs text-slate-500 mt-0.5">Stock quantities and shipping fulfillment profiles.</p>
          </div>

          {/* Stock Rendering */}
          <div className="space-y-4 p-4 border border-slate-200 rounded-xl bg-white shadow-xs">
            <Label className="text-sm font-semibold border-b pb-2 block text-slate-900">Inventory Level</Label>

            {!form.has_variants ? (
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-600">Stock Quantity *</Label>
                <Input
                  type="number" min="0"
                  value={form.stock_qty ?? ''}
                  onChange={e => setForm({ ...form, stock_qty: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="e.g. 25"
                  className="h-9 text-xs"
                />
              </div>
            ) : form.has_variants && !form.quantities_vary ? (
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-600">Total Shared Stock across all variants *</Label>
                <Input
                  type="number" min="0"
                  value={form.total_stock ?? ''}
                  onChange={e => setForm({ ...form, total_stock: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="e.g. 50"
                  className="h-9 text-xs"
                />
                <p className="text-[11px] text-muted-foreground mt-1">Quantities vary is OFF, so all variants share this pool.</p>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                Stock is managed individually per variant in <strong>Section 3 (Variations)</strong>.
              </div>
            )}
          </div>

          {/* Fulfillment & Profiles */}
          <div className="space-y-4 p-4 border border-slate-200 rounded-xl bg-white shadow-xs">
            <Label className="text-sm font-semibold border-b pb-2 block text-slate-900">Fulfillment Profiles</Label>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-600">Processing Profile</Label>
              {processingProfiles.length > 0 ? (
                <Select
                  value={form.processing_profile_id ? String(form.processing_profile_id) : 'default'}
                  onValueChange={(val) => setForm({ ...form, processing_profile_id: val === 'default' ? undefined : Number(val) })}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select processing profile" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Profile</SelectItem>
                    {processingProfiles.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name} {p.min_days != null && p.max_days != null ? `(${p.min_days === p.max_days ? `${p.min_days} days` : `${p.min_days}-${p.max_days} days`})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type="number"
                  value={form.processing_profile_id ?? ''}
                  onChange={e => setForm({ ...form, processing_profile_id: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="Profile ID (Optional)"
                  className="h-9 text-xs"
                />
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-600">Shipping Profile</Label>
              {shippingProfiles.length > 0 ? (
                <Select
                  value={form.shipping_profile_id ? String(form.shipping_profile_id) : 'default'}
                  onValueChange={(val) => setForm({ ...form, shipping_profile_id: val === 'default' ? undefined : Number(val) })}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select shipping profile" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Profile</SelectItem>
                    {shippingProfiles.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type="number"
                  value={form.shipping_profile_id ?? ''}
                  onChange={e => setForm({ ...form, shipping_profile_id: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="Profile ID (Optional)"
                  className="h-9 text-xs"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FULL WIDTH SECTION: Regional GST & Tax Configuration */}
      <div className="border border-slate-200 rounded-2xl bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/60">
              <Percent className="h-5 w-5" />
            </div>
            <div>
              <Label className="text-base font-semibold text-slate-900 flex items-center gap-2">
                Regional GST & Tax Configuration
                <Badge variant="outline" className="text-[10px] text-amber-700 border-amber-300 bg-amber-50">
                  Tax Rates
                </Badge>
              </Label>
              <p className="text-xs text-slate-500 mt-0.5">
                Set region-specific GST / Tax percentages (India, United States, and Rest of World). These rates are applied during checkout.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {regions.map((r) => {
            const currentGst = getGstValue(r.id);
            const isIndia = r.name.toLowerCase().includes('india') || r.currency_code === 'INR';
            const isUS = r.name.toLowerCase().includes('united states') || r.name.toLowerCase().includes('us');

            return (
              <div
                key={r.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-sm text-slate-900 flex items-center gap-1.5">
                      {r.name}
                      {r.is_default && (
                        <Badge variant="secondary" className="text-[9px] bg-slate-200/80 text-slate-700 px-1.5 py-0">
                          Default
                        </Badge>
                      )}
                    </span>
                    <Badge variant="outline" className="text-xs font-mono bg-white font-medium">
                      {r.currency_symbol} {r.currency_code}
                    </Badge>
                  </div>
                  {/* <p className="text-[11px] text-muted-foreground leading-snug">
                    {isIndia
                      ? 'Indian Jewelry GST (Standard 3% CGST+SGST / IGST).'
                      : isUS
                      ? 'United States Sales tax (0% if export / origin-based).'
                      : 'International VAT / Customs tax rate.'}
                  </p> */}
                </div>

                <div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-medium text-slate-700">GST / Tax Percentage</Label>
                    <div className="relative flex items-center">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="0"
                        value={currentGst}
                        onChange={(e) => handleGstUpdate(r.id, e.target.value)}
                        className="pr-8 h-9 text-xs font-semibold bg-white"
                      />
                      <span className="absolute right-3 text-xs text-muted-foreground font-bold pointer-events-none">%</span>
                    </div>
                  </div>

                  {/* Preset Buttons */}
                  {/* <div className="flex gap-1 flex-wrap mt-2.5">
                    {[0, 3, 5, 12, 18].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => handleGstUpdate(r.id, pct)}
                        className={`px-2 py-0.5 text-[10px] rounded border transition-colors cursor-pointer ${
                          Number(currentGst) === pct
                            ? 'bg-primary text-primary-foreground border-primary font-semibold shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        {pct}% {pct === 3 && '(Jewelry)'}
                      </button>
                    ))}
                  </div> */}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-start gap-2 p-3 bg-blue-50/70 border border-blue-200/70 rounded-xl text-xs text-blue-800">
          <Info className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
          <span>
            <strong>Automatic Checkout Calculation:</strong> The backend calculates GST based on the customer's detected region. For customers ordering from India, the India GST % configured above will be charged automatically on the discounted item subtotal.
          </span>
        </div>
      </div>
    </div>
  );
}
