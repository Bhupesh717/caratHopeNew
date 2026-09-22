'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Eye,
  Pencil,
  Copy,
  Check,
  Package,
  Sparkles,
  Tag,
  Layers,
  Truck,
  Clock,
  DollarSign,
  Globe,
  Info,
  RefreshCw,
  X,
  Play,
  Film,
  Sliders,
  AlertCircle,
  Gem,
  Calendar,
  CheckCircle2,
  XCircle,
  Percent,
} from 'lucide-react';
import { productService } from '../../_services/product.service';
import { categoryService } from '../../_services/category.service';
import { regionService } from '../../_services/region.service';
import { attributeService } from '../../_services/attribute.service';
import { categoryAttributeService } from '../../_services/category-attribute.service';
import { processingProfileService } from '../../_services/processing-profile.service';
import { shippingProfileService } from '../../_services/shipping-profile.service';
import { productOptionService } from '../../_services/product-option.service';
import {
  AdminCategory,
  AdminRegion,
  AdminAttribute,
  AdminProcessingProfile,
  AdminShippingProfile,
  AdminProductOptionGroup,
} from '../../_types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ProductViewModalProps {
  productId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoriesList?: AdminCategory[];
}

export function ProductViewModal({
  productId,
  open,
  onOpenChange,
  categoriesList = [],
}: ProductViewModalProps) {
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamic Master Lookups
  const [categories, setCategories] = useState<AdminCategory[]>(categoriesList);
  const [regions, setRegions] = useState<AdminRegion[]>([]);
  const [attributes, setAttributes] = useState<AdminAttribute[]>([]);
  const [categoryAttributes, setCategoryAttributes] = useState<any[]>([]);
  const [processingProfiles, setProcessingProfiles] = useState<AdminProcessingProfile[]>([]);
  const [shippingProfiles, setShippingProfiles] = useState<AdminShippingProfile[]>([]);
  const [whenMadeOptions, setWhenMadeOptions] = useState<AdminProductOptionGroup[]>([]);
  const [customOptions, setCustomOptions] = useState<any[]>([]);

  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [copiedSku, setCopiedSku] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Load product and master lookups dynamically when modal opens
  const fetchFullProduct = async (id: string) => {
    setLoading(true);
    setError(null);
    setSelectedImgIdx(0);
    setActiveTab('overview');

    try {
      const [
        prodData,
        catsData,
        regionsData,
        attrsData,
        procData,
        shipData,
        whenMadeData,
        customOptsData,
      ] = await Promise.all([
        productService.getById(id),
        categories.length > 0 ? Promise.resolve(categories) : categoryService.getAll().catch(() => []),
        regionService.getAll().catch(() => []),
        attributeService.getAll().catch(() => []),
        processingProfileService.getAll().catch(() => []),
        shippingProfileService.getAll().catch(() => []),
        productOptionService.getAll('when_was_it_made').catch(() => []),
        productService.getCustomOptions(id).catch(() => ({ data: [] })),
      ]);

      if (!prodData) {
        throw new Error('Product not found on server');
      }

      setProduct(prodData);
      if (catsData?.length) setCategories(catsData);
      if (regionsData?.length) setRegions(regionsData);
      if (attrsData?.length) setAttributes(attrsData);
      if (procData?.length) setProcessingProfiles(procData);
      if (shipData?.length) setShippingProfiles(shipData);
      if (whenMadeData?.length) setWhenMadeOptions(whenMadeData);
      if (customOptsData?.data) setCustomOptions(customOptsData.data);

      // Also fetch category-specific attribute definitions if category exists
      const catId = prodData.categoryId || prodData.category_id || prodData.category?.id;
      if (catId) {
        categoryAttributeService.getByCategory(String(catId))
          .then((res) => setCategoryAttributes(res || []))
          .catch(() => setCategoryAttributes([]));
      }
    } catch (err: any) {
      console.error('Failed to load product details:', err);
      setError(err?.message || 'Failed to fetch product details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && productId) {
      fetchFullProduct(productId);
    } else {
      setProduct(null);
      setError(null);
    }
  }, [open, productId]);

  // Dynamic default currency symbol from regions
  const defaultRegion = useMemo(() => {
    const def = regions.find((r) => r.is_default);
    return def || regions[0] || { currency_symbol: '₹', currency_code: 'INR', name: 'Domestic' };
  }, [regions]);

  // Dynamic Region lookup
  const getRegionInfo = (regionId: string | number) => {
    const reg = regions.find((r) => String(r.id) === String(regionId));
    return reg || {
      name: `Region #${regionId}`,
      currency_symbol: defaultRegion.currency_symbol || '₹',
      currency_code: defaultRegion.currency_code || 'INR',
    };
  };

  // Dynamic Category lookup
  const categoryName = useMemo(() => {
    if (!product) return '—';
    if (product.category?.name) return product.category.name;
    const cat = categories.find((c) => String(c.id) === String(product.categoryId || product.category_id));
    return cat ? cat.name : (product.categoryId || '—');
  }, [product, categories]);

  // Dynamic When Made Label lookup
  const whenMadeLabel = useMemo(() => {
    if (!product) return null;
    const rawVal = product.when_was_it_made || product.whenWasItMade;
    if (!rawVal) return null;

    for (const grp of whenMadeOptions) {
      const opt = grp.options?.find((o) => o.value === rawVal || o.label === rawVal);
      if (opt) return opt.label;
    }
    return String(rawVal);
  }, [product, whenMadeOptions]);

  // Dynamic Processing Profile
  const processingProfileInfo = useMemo(() => {
    if (!product?.processing_profile_id && !product?.processing_profile) return null;
    if (product.processing_profile) return product.processing_profile;
    return processingProfiles.find((p) => String(p.id) === String(product.processing_profile_id));
  }, [product, processingProfiles]);

  // Dynamic Shipping Profile
  const shippingProfileInfo = useMemo(() => {
    if (!product?.shipping_profile_id && !product?.shipping_profile) return null;
    if (product.shipping_profile) return product.shipping_profile;
    return shippingProfiles.find((p) => String(p.id) === String(product.shipping_profile_id));
  }, [product, shippingProfiles]);

  // Dynamic Attribute Value Resolver (maps ID to Attribute Name and Value Label)
  const getAttributeValueLabel = (valId: string | number) => {
    for (const attr of attributes) {
      const val = attr.values?.find((v) => String(v.id) === String(valId));
      if (val) return { attrName: attr.name, valueName: val.value, attrSlug: attr.slug };
    }
    return { attrName: 'Attribute', valueName: String(valId), attrSlug: '' };
  };

  const resolveAttributeBadges = (valIds: (string | number)[]) => {
    if (!valIds || valIds.length === 0) return [];
    return valIds.map((id) => getAttributeValueLabel(id));
  };

  // Group all product attributes dynamically
  const dynamicSpecifications = useMemo(() => {
    if (!product) return [];

    const specs: { label: string; values: string[] }[] = [];

    // Helper to add attribute group
    const addGroup = (label: string, rawIds: any) => {
      let ids: any[] = [];
      if (Array.isArray(rawIds)) {
        ids = rawIds;
      } else if (rawIds && typeof rawIds === 'object') {
        ids = rawIds.attribute_value_ids || [rawIds.id || rawIds.value];
      } else if (rawIds !== undefined && rawIds !== null && rawIds !== '') {
        ids = [rawIds];
      }

      const labels = ids
        .map((id) => {
          if (typeof id === 'object' && id !== null) {
            return id.value || id.name || String(id.id);
          }
          return getAttributeValueLabel(id).valueName;
        })
        .filter(Boolean);

      if (labels.length > 0) {
        specs.push({ label, values: labels });
      }
    };

    // Materials
    if (product.materials_ids || product.materials) {
      addGroup('Materials', product.materials_ids || product.materials);
    }

    // Gold Solidity
    if (product.gold_solidity_ids || product.gold_solidity) {
      addGroup('Gold Solidity', product.gold_solidity_ids || product.gold_solidity);
    }

    // Gold Purity
    if (product.gold_purity_ids || product.gold_purity) {
      addGroup('Gold Purity', product.gold_purity_ids || product.gold_purity);
    }

    // Custom Listing Attributes dynamically
    if (product.listing_attributes && typeof product.listing_attributes === 'object') {
      Object.entries(product.listing_attributes).forEach(([slug, val]: [string, any]) => {
        // Find matching attribute definition if available for pretty name
        const matchedAttr = attributes.find((a) => a.slug === slug || a.name.toLowerCase() === slug.toLowerCase())
          || categoryAttributes.find((ca) => ca.slug === slug || ca.name?.toLowerCase() === slug.toLowerCase());

        const labelName = matchedAttr ? matchedAttr.name : slug.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

        if (typeof val === 'object' && val !== null && val.attribute_value_ids) {
          addGroup(labelName, val.attribute_value_ids);
        } else if (Array.isArray(val)) {
          addGroup(labelName, val);
        } else if (val !== undefined && val !== null && val !== '') {
          specs.push({ label: labelName, values: [String(val)] });
        }
      });
    }

    return specs;
  }, [product, attributes, categoryAttributes]);

  const copySku = () => {
    if (!product?.sku) return;
    navigator.clipboard.writeText(product.sku);
    setCopiedSku(true);
    setTimeout(() => setCopiedSku(false), 2000);
    toast.success('SKU copied to clipboard');
  };

  // Dynamic Product Images Sanitizer
  const allImages = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images.filter(Boolean);
    }
    if (Array.isArray(product.product_images) && product.product_images.length > 0) {
      return product.product_images.map((img: any) => img.image_path || img.url || img).filter(Boolean);
    }
    return [];
  }, [product]);

  // Dynamic Total Stock calculation
  const totalStock = useMemo(() => {
    if (!product) return 0;
    if (product.has_variants && product.variants?.length > 0) {
      return product.variants.reduce((acc: number, v: any) => acc + (Number(v.stock_quantity ?? v.stockQuantity) || 0), 0);
    }
    return product.stockQty ?? product.stock_qty ?? 0;
  }, [product]);

  // Dynamic Price Range / Single Price display
  const priceDisplay = useMemo(() => {
    if (!product) return '—';
    const sym = defaultRegion.currency_symbol || '₹';

    if (product.has_variants && product.variants?.length > 0) {
      const allPrices: number[] = [];
      product.variants.forEach((v: any) => {
        if (v.prices?.length > 0) {
          v.prices.forEach((pr: any) => {
            if (pr.price) allPrices.push(Number(pr.price));
          });
        } else if (v.price) {
          allPrices.push(typeof v.price === 'object' ? Number(v.price.amount) : Number(v.price));
        }
      });
      if (allPrices.length > 0) {
        const min = Math.min(...allPrices);
        const max = Math.max(...allPrices);
        return min === max
          ? `${sym}${min.toLocaleString()}`
          : `${sym}${min.toLocaleString()} - ${sym}${max.toLocaleString()}`;
      }
      return 'Multiple Variants';
    }

    if (product.prices && product.prices.length > 0) {
      const pr = product.prices[0];
      const reg = getRegionInfo(pr.region_id);
      return `${reg.currency_symbol}${(pr.price || 0).toLocaleString()}`;
    }

    if (product.price) {
      return `${sym}${Number(product.price).toLocaleString()}`;
    }

    return `${sym}0`;
  }, [product, defaultRegion]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        showCloseButton={false}
        className="max-w-4xl lg:max-w-5xl w-[95vw] p-0 overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 text-slate-900"
      >
        {/* Header Bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 text-amber-600">
              <Package className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-900 truncate max-w-[380px]">
                  {loading ? 'Loading product...' : (product?.name || 'Product Details')}
                </h2>
                {product && (
                  <>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase',
                        product.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-zinc-100 text-zinc-600 border-zinc-300'
                      )}
                    >
                      {product.status}
                    </Badge>
                    {product.isFeatured && (
                      <Badge className="bg-amber-500 hover:bg-amber-600 text-white gap-1 text-xs">
                        <Sparkles className="h-3 w-3" /> Featured
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-700">
                      {product.has_variants ? 'Multi-Variant' : 'Simple Product'}
                    </Badge>
                  </>
                )}
              </div>
              {product && (
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                  <span className="font-medium text-slate-700">Category: <span className="text-slate-900 font-semibold">{categoryName}</span></span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <span>SKU: <code className="font-mono text-slate-800 font-semibold">{product.sku || 'N/A'}</code></span>
                    {product.sku && (
                      <button
                        onClick={copySku}
                        className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                        title="Copy SKU"
                      >
                        {copiedSku ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      </button>
                    )}
                  </div>
                  {product.createdAt && (
                    <>
                      <span>•</span>
                      <span>Created: {format(new Date(product.createdAt), 'dd MMM yyyy')}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {product && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-blue-600 border-blue-200 hover:bg-blue-50 font-medium cursor-pointer"
                onClick={() => {
                  window.location.href = `/admin/products/${product.id}/edit`;
                }}
              >
                <Pencil className="h-3.5 w-3.5" /> Edit Product
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-slate-500 hover:bg-slate-100 cursor-pointer"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="max-h-[78vh] overflow-y-auto p-6 bg-slate-50">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <RefreshCw className="h-8 w-8 text-amber-600 animate-spin" />
              <p className="text-sm font-medium text-slate-600">Fetching complete product details from server...</p>
            </div>
          ) : error ? (
            <div className="py-12 max-w-md mx-auto text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Failed to Load Product</h3>
              <p className="text-sm text-slate-500">{error}</p>
              <Button
                onClick={() => productId && fetchFullProduct(productId)}
                variant="outline"
                size="sm"
                className="gap-2 cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" /> Try Again
              </Button>
            </div>
          ) : !product ? (
            <div className="py-16 text-center text-slate-500">No product information available.</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Gallery & Highlights (4 Cols) */}
              <div className="lg:col-span-4 space-y-4">
                {/* Image Gallery Showcase */}
                <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                  <div className="relative aspect-square bg-slate-100 flex items-center justify-center overflow-hidden">
                    {allImages.length > 0 ? (
                      <img
                        src={allImages[selectedImgIdx] || allImages[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 gap-2 p-6 text-center">
                        <Package className="h-12 w-12 stroke-[1.5]" />
                        <span className="text-xs">No media uploaded</span>
                      </div>
                    )}
                    {allImages.length > 0 && (
                      <div className="absolute top-2.5 right-2.5 bg-black/70 text-white text-[11px] font-medium px-2 py-0.5 rounded-md">
                        {selectedImgIdx + 1} / {allImages.length}
                      </div>
                    )}
                  </div>

                  {allImages.length > 1 && (
                    <div className="p-2.5 bg-slate-50 border-t border-slate-100">
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {allImages.map((img: string, idx: number) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedImgIdx(idx)}
                            className={cn(
                              'relative h-12 w-12 shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer',
                              selectedImgIdx === idx
                                ? 'border-amber-600 ring-2 ring-amber-500/20'
                                : 'border-slate-200 opacity-70 hover:opacity-100'
                            )}
                          >
                            <img src={img} alt="" className="h-full w-full object-cover" />
                            {idx === 0 && (
                              <span className="absolute bottom-0 inset-x-0 bg-amber-600 text-[7px] font-bold text-white text-center py-0.2 uppercase">
                                Main
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {product.video && (
                    <div className="p-2.5 border-t border-slate-100 bg-amber-50/60 flex items-center justify-between">
                      <span className="text-xs text-amber-900 font-medium flex items-center gap-1.5 truncate">
                        <Film className="h-4 w-4 text-amber-600 shrink-0" /> Video Available
                      </span>
                      <a
                        href={product.video}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-amber-700 hover:text-amber-900 font-semibold bg-white border border-amber-200 rounded px-2 py-0.5 flex items-center gap-1 shadow-xs"
                      >
                        <Play className="h-3 w-3 fill-current" /> Watch
                      </a>
                    </div>
                  )}
                </Card>

                {/* Key Metrics Card */}
                <Card className="border-slate-200 shadow-sm bg-white">
                  <CardHeader className="pb-2 pt-3 px-4 border-b border-slate-100">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      <Info className="h-3.5 w-3.5 text-amber-600" /> Catalog Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Price Display</span>
                      <span className="font-bold text-slate-900">{priceDisplay}</span>
                    </div>

                    {!product.has_variants && product.discountPrice && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Discount Price</span>
                        <span className="font-semibold text-emerald-600">
                          {defaultRegion.currency_symbol}{Number(product.discountPrice).toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Inventory Status</span>
                      <Badge
                        variant={totalStock > 0 ? 'default' : 'destructive'}
                        className={cn(
                          'text-xs font-semibold px-2 py-0.5 rounded-full',
                          totalStock > 5
                            ? 'bg-emerald-100 text-emerald-800'
                            : totalStock > 0
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        )}
                      >
                        {totalStock > 0 ? `${totalStock} units in stock` : 'Out of Stock'}
                      </Badge>
                    </div>

                    {product.has_variants && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Variants</span>
                        <Badge variant="outline" className="bg-slate-50 font-semibold text-slate-800">
                          {product.variants?.length || 0} variations
                        </Badge>
                      </div>
                    )}

                    {product.allow_offers !== undefined && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Allow Offers</span>
                        <span className="font-medium text-slate-800 flex items-center gap-1">
                          {product.allow_offers ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              <span>Yes {product.max_offer_discount_percent ? `(Max ${product.max_offer_discount_percent}%)` : ''}</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3.5 w-3.5 text-slate-400" />
                              <span>No</span>
                            </>
                          )}
                        </span>
                      </div>
                    )}

                    {product.is_global_pricing_enabled !== undefined && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Global Pricing</span>
                        <span className="font-medium text-slate-800">
                          {product.is_global_pricing_enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Dynamic Fulfillment */}
                {(processingProfileInfo || shippingProfileInfo) && (
                  <Card className="border-slate-200 shadow-sm bg-white">
                    <CardHeader className="pb-2 pt-3 px-4 border-b border-slate-100">
                      <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                        <Truck className="h-3.5 w-3.5 text-blue-600" /> Fulfillment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      {processingProfileInfo && (
                        <div>
                          <span className="text-xs text-slate-500 block mb-1 font-medium">Processing Time</span>
                          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-900 font-medium">
                            <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                            <div>
                              <span className="font-semibold text-slate-900 block">{processingProfileInfo.name}</span>
                              <span className="text-slate-600">
                                Dispatch in {processingProfileInfo.min_days === processingProfileInfo.max_days ? `${processingProfileInfo.min_days} days` : `${processingProfileInfo.min_days} - ${processingProfileInfo.max_days} days`}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {shippingProfileInfo && (
                        <div>
                          <span className="text-xs text-slate-500 block mb-1 font-medium">Shipping Profile</span>
                          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-xs text-blue-900 font-medium">
                            <Truck className="h-4 w-4 text-blue-600 shrink-0" />
                            <div>
                              <span className="font-semibold text-slate-900 block">{shippingProfileInfo.name}</span>
                              {shippingProfileInfo.origin_pincode && (
                                <span className="text-slate-600 block">Origin: {shippingProfileInfo.origin_pincode} {shippingProfileInfo.origin_country_code ? `(${shippingProfileInfo.origin_country_code})` : ''}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column: Tabbed Information (8 Cols) */}
              <div className="lg:col-span-8 space-y-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full grid grid-cols-4 bg-slate-200/80 p-1 rounded-xl">
                    <TabsTrigger value="overview" className="text-xs font-semibold py-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm cursor-pointer">
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="variations" className="text-xs font-semibold py-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center justify-center gap-1.5 cursor-pointer">
                      Variations {product.has_variants && product.variants?.length ? `(${product.variants.length})` : ''}
                    </TabsTrigger>
                    <TabsTrigger value="pricing" className="text-xs font-semibold py-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm cursor-pointer">
                      Regional Rates {product.prices?.length ? `(${product.prices.length})` : ''}
                    </TabsTrigger>
                    <TabsTrigger value="specifications" className="text-xs font-semibold py-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm cursor-pointer">
                      Specifications
                    </TabsTrigger>
                  </TabsList>

                  {/* ──────────────── TAB 1: OVERVIEW ──────────────── */}
                  <TabsContent value="overview" className="mt-4 space-y-4">
                    <Card className="border-slate-200 shadow-sm bg-white">
                      <CardHeader className="pb-3 border-b border-slate-100">
                        <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <Info className="h-4 w-4 text-amber-600" /> Description
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        {product.description ? (
                          <div
                            dangerouslySetInnerHTML={{ __html: product.description }}
                            className="prose prose-sm max-w-none text-slate-700 leading-relaxed font-sans"
                          />
                        ) : (
                          <p className="text-xs text-slate-400 italic">No description provided.</p>
                        )}
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {product.tags && product.tags.length > 0 && (
                        <Card className="border-slate-200 shadow-sm bg-white">
                          <CardHeader className="pb-2 border-b border-slate-100">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                              <Tag className="h-3.5 w-3.5 text-amber-600" /> Tags ({product.tags.length})
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-4">
                            <div className="flex flex-wrap gap-1.5">
                              {product.tags.map((tag: string, idx: number) => (
                                <Badge key={idx} variant="secondary" className="bg-slate-100 text-slate-800 border text-xs font-normal">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {whenMadeLabel && (
                        <Card className="border-slate-200 shadow-sm bg-white">
                          <CardHeader className="pb-2 border-b border-slate-100">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-blue-600" /> When was it made?
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-4">
                            <p className="text-sm font-semibold text-slate-900">{whenMadeLabel}</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>

                  {/* ──────────────── TAB 2: VARIATIONS ──────────────── */}
                  <TabsContent value="variations" className="mt-4 space-y-4">
                    {product.has_variants && product.variants && product.variants.length > 0 ? (
                      <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                        <CardHeader className="p-4 bg-slate-50 border-b border-slate-200 flex flex-row items-center justify-between">
                          <div>
                            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                              <Layers className="h-4 w-4 text-indigo-600" /> Variations Matrix ({product.variants.length})
                            </CardTitle>
                          </div>
                          <Badge variant="outline" className="bg-white font-mono text-xs">
                            Total: {totalStock} in stock
                          </Badge>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left border-collapse">
                              <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                                <tr>
                                  <th className="px-3 py-2.5">Variant</th>
                                  <th className="px-3 py-2.5">SKU</th>
                                  <th className="px-3 py-2.5">Attributes</th>
                                  <th className="px-3 py-2.5">Stock</th>
                                  <th className="px-3 py-2.5">Weight / MC</th>
                                  <th className="px-3 py-2.5 text-right">Prices</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {product.variants.map((v: any, idx: number) => {
                                  const attrBadges = resolveAttributeBadges(v.attribute_value_ids || v.attributes || []);
                                  const variantImg = v.variant_images?.[0] || v.images?.[0] || allImages[0];
                                  const stock = Number(v.stock_quantity ?? v.stockQuantity ?? 0);

                                  return (
                                    <tr key={v.id || idx} className="hover:bg-slate-50">
                                      <td className="px-3 py-2.5">
                                        <div className="h-9 w-9 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 shrink-0">
                                          {variantImg ? (
                                            <img src={variantImg} alt="" className="h-full w-full object-cover" />
                                          ) : (
                                            <div className="h-full w-full flex items-center justify-center text-slate-400">
                                              <Package className="h-4 w-4" />
                                            </div>
                                          )}
                                        </div>
                                      </td>

                                      <td className="px-3 py-2.5 font-mono font-medium text-slate-800">
                                        {v.sku || `VAR-${idx + 1}`}
                                      </td>

                                      <td className="px-3 py-2.5">
                                        <div className="flex flex-wrap gap-1 max-w-xs">
                                          {attrBadges.length > 0 ? (
                                            attrBadges.map((ab: any, aIdx: number) => (
                                              <Badge
                                                key={aIdx}
                                                variant="secondary"
                                                className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[11px] py-0.5 px-1.5 font-medium"
                                              >
                                                {ab.attrName}: <b className="ml-1">{ab.valueName}</b>
                                              </Badge>
                                            ))
                                          ) : (
                                            <span className="text-slate-400 italic">—</span>
                                          )}
                                        </div>
                                      </td>

                                      <td className="px-3 py-2.5">
                                        <Badge
                                          variant={stock > 0 ? 'default' : 'destructive'}
                                          className={cn(
                                            'text-xs font-semibold px-2 py-0.5 rounded-full',
                                            stock > 5
                                              ? 'bg-emerald-100 text-emerald-800'
                                              : stock > 0
                                              ? 'bg-amber-100 text-amber-800'
                                              : 'bg-red-100 text-red-800'
                                          )}
                                        >
                                          {stock} qty
                                        </Badge>
                                      </td>

                                      <td className="px-3 py-2.5 text-slate-600">
                                        {v.weight_grams ? <span>{v.weight_grams}g</span> : <span className="text-slate-400">—</span>}
                                        {v.making_charges ? (
                                          <span className="block text-[10px] text-slate-500 font-medium">MC: {defaultRegion.currency_symbol}{v.making_charges}</span>
                                        ) : null}
                                      </td>

                                      <td className="px-3 py-2.5 text-right">
                                        {v.prices && v.prices.length > 0 ? (
                                          <div className="space-y-0.5">
                                            {v.prices.map((pr: any, pIdx: number) => {
                                              const reg = getRegionInfo(pr.region_id);
                                              return (
                                                <div key={pIdx} className="text-xs font-medium text-slate-800">
                                                  <span className="text-slate-400 text-[10px] mr-1">{reg.currency_code}:</span>
                                                  {reg.currency_symbol}{Number(pr.price).toLocaleString()}
                                                </div>
                                              );
                                            })}
                                          </div>
                                        ) : v.price ? (
                                          <span className="font-semibold text-slate-800">
                                            {defaultRegion.currency_symbol}{(typeof v.price === 'object' ? v.price.amount : v.price).toLocaleString()}
                                          </span>
                                        ) : (
                                          <span className="text-slate-400 italic">—</span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card className="border-slate-200 shadow-sm bg-white p-8 text-center space-y-2">
                        <Package className="h-8 w-8 text-slate-400 mx-auto" />
                        <h4 className="text-sm font-semibold text-slate-900">Simple Product (No Variations)</h4>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          Single SKU ({product.sku || 'N/A'}) with {totalStock} units in stock.
                        </p>
                      </Card>
                    )}
                  </TabsContent>

                  {/* ──────────────── TAB 3: REGIONAL PRICING ──────────────── */}
                  <TabsContent value="pricing" className="mt-4 space-y-4">
                    <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                      <CardHeader className="p-4 bg-slate-50 border-b border-slate-200">
                        <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-emerald-600" /> Regional Rates Breakdown
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        {product.prices && product.prices.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left border-collapse">
                              <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                                <tr>
                                  <th className="px-4 py-3">Region</th>
                                  <th className="px-4 py-3">Currency</th>
                                  <th className="px-4 py-3">Base Price</th>
                                  <th className="px-4 py-3">Compare at Price</th>
                                  <th className="px-4 py-3 text-right">Savings</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {product.prices.map((pr: any, idx: number) => {
                                  const reg = getRegionInfo(pr.region_id);
                                  const price = Number(pr.price || 0);
                                  const comparePrice = pr.compare_at_price ? Number(pr.compare_at_price) : null;
                                  const discountPercent = comparePrice && comparePrice > price
                                    ? Math.round(((comparePrice - price) / comparePrice) * 100)
                                    : null;

                                  return (
                                    <tr key={idx} className="hover:bg-slate-50">
                                      <td className="px-4 py-3 font-semibold text-slate-800 flex items-center gap-2">
                                        <Globe className="h-3.5 w-3.5 text-blue-500" />
                                        {reg.name}
                                      </td>
                                      <td className="px-4 py-3 font-mono text-slate-600">
                                        {reg.currency_code} ({reg.currency_symbol})
                                      </td>
                                      <td className="px-4 py-3 font-bold text-slate-900 text-sm">
                                        {reg.currency_symbol}{price.toLocaleString()}
                                      </td>
                                      <td className="px-4 py-3 text-slate-500">
                                        {comparePrice ? (
                                          <span className="line-through">
                                            {reg.currency_symbol}{comparePrice.toLocaleString()}
                                          </span>
                                        ) : (
                                          <span className="text-slate-400">—</span>
                                        )}
                                      </td>
                                      <td className="px-4 py-3 text-right">
                                        {discountPercent ? (
                                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold gap-1">
                                            <Percent className="h-3 w-3" /> Save {discountPercent}%
                                          </Badge>
                                        ) : (
                                          <span className="text-slate-400 text-[11px]">Regular</span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="p-8 text-center space-y-2">
                            <p className="text-sm font-semibold text-slate-700">Default Base Price</p>
                            <p className="text-2xl font-bold text-slate-900">
                              {defaultRegion.currency_symbol}{Number(product.price || 0).toLocaleString()}
                            </p>
                            {product.discountPrice && (
                              <p className="text-xs text-emerald-600 font-medium">
                                Discounted Price: {defaultRegion.currency_symbol}{Number(product.discountPrice).toLocaleString()}
                              </p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* ──────────────── TAB 4: SPECIFICATIONS & CUSTOM OPTIONS ──────────────── */}
                  <TabsContent value="specifications" className="mt-4 space-y-4">
                    {/* Dynamic Specifications */}
                    <Card className="border-slate-200 shadow-sm bg-white">
                      <CardHeader className="pb-3 border-b border-slate-100">
                        <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <Gem className="h-4 w-4 text-amber-600" /> Specifications & Attributes
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4">
                        {dynamicSpecifications.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {dynamicSpecifications.map((spec, idx) => (
                              <div key={idx} className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
                                <span className="text-xs font-semibold text-slate-500 uppercase block">{spec.label}</span>
                                <div className="flex flex-wrap gap-1">
                                  {spec.values.map((v, vIdx) => (
                                    <Badge key={vIdx} variant="secondary" className="bg-amber-100/90 text-amber-900 text-xs">
                                      {v}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">No attributes configured for this product.</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Dynamic Buyer Personalization Fields */}
                    {customOptions.length > 0 && (
                      <Card className="border-slate-200 shadow-sm bg-white">
                        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                          <div>
                            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                              <Sliders className="h-4 w-4 text-purple-600" /> Buyer Personalization Fields
                            </CardTitle>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {customOptions.length} field(s)
                          </Badge>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="divide-y divide-slate-100">
                            {customOptions.map((opt: any, idx: number) => (
                              <div key={opt.id || idx} className="py-2.5 flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-xs text-slate-900">{opt.label}</p>
                                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                                    <span className="capitalize px-1.5 py-0.5 bg-slate-100 rounded border">Type: {opt.type}</span>
                                    {opt.is_required ? <span className="text-amber-600 font-medium">Required</span> : <span>Optional</span>}
                                    {opt.max_length && <span>Max: {opt.max_length} chars</span>}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
