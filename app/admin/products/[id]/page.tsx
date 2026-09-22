'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productService } from '../../_services/product.service';
import { categoryService } from '../../_services/category.service';
import { regionService } from '../../_services/region.service';
import { attributeService } from '../../_services/attribute.service';
import { processingProfileService } from '../../_services/processing-profile.service';
import { shippingProfileService } from '../../_services/shipping-profile.service';
import { AdminProduct, AdminCategory, AdminRegion, AdminAttribute, AdminProcessingProfile, AdminShippingProfile } from '../../_types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Pencil,
  Package,
  Sparkles,
  Tag,
  Layers,
  Truck,
  Clock,
  DollarSign,
  Globe,
  Info,
  Film,
  Play,
  Sliders,
  Gem,
  Calendar,
  CheckCircle2,
  XCircle,
  Percent,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CustomOptionsManager } from '../_components/custom-options-manager';

export default function ProductViewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [copiedSku, setCopiedSku] = useState(false);

  // Master data lookups
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [regions, setRegions] = useState<AdminRegion[]>([]);
  const [attributes, setAttributes] = useState<AdminAttribute[]>([]);
  const [processingProfiles, setProcessingProfiles] = useState<AdminProcessingProfile[]>([]);
  const [shippingProfiles, setShippingProfiles] = useState<AdminShippingProfile[]>([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    Promise.all([
      productService.getById(id),
      categoryService.getAll().catch(() => []),
      regionService.getAll().catch(() => []),
      attributeService.getAll().catch(() => []),
      processingProfileService.getAll().catch(() => []),
      shippingProfileService.getAll().catch(() => []),
    ])
      .then(([prod, cats, regs, attrs, proc, ship]) => {
        setProduct(prod || null);
        if (cats) setCategories(cats);
        if (regs) setRegions(regs);
        if (attrs) setAttributes(attrs);
        if (proc) setProcessingProfiles(proc);
        if (ship) setShippingProfiles(ship);
      })
      .catch(() => toast.error('Failed to load product details'))
      .finally(() => setLoading(false));
  }, [id]);

  const categoryName = useMemo(() => {
    if (!product) return '—';
    if (product.category?.name) return product.category.name;
    const cat = categories.find((c) => String(c.id) === String(product.categoryId || product.category_id));
    return cat ? cat.name : (product.categoryId || '—');
  }, [product, categories]);

  const processingProfileInfo = useMemo(() => {
    if (!product?.processing_profile_id && !product?.processing_profile) return null;
    if (product.processing_profile) return product.processing_profile;
    return processingProfiles.find((p) => String(p.id) === String(product.processing_profile_id));
  }, [product, processingProfiles]);

  const shippingProfileInfo = useMemo(() => {
    if (!product?.shipping_profile_id && !product?.shipping_profile) return null;
    if (product.shipping_profile) return product.shipping_profile;
    return shippingProfiles.find((p) => String(p.id) === String(product.shipping_profile_id));
  }, [product, shippingProfiles]);

  const getAttributeValueLabel = (valId: string | number) => {
    for (const attr of attributes) {
      const val = attr.values?.find((v) => String(v.id) === String(valId));
      if (val) return { attrName: attr.name, valueName: val.value };
    }
    return { attrName: 'Attribute', valueName: String(valId) };
  };

  const resolveAttributeBadges = (valIds: (string | number)[]) => {
    if (!valIds || valIds.length === 0) return [];
    return valIds.map((id) => getAttributeValueLabel(id));
  };

  const getRegionInfo = (regionId: string | number) => {
    const reg = regions.find((r) => String(r.id) === String(regionId));
    return reg || { name: `Region #${regionId}`, currency_symbol: '₹', currency_code: 'INR' };
  };

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

  const totalStock = useMemo(() => {
    if (!product) return 0;
    if (product.has_variants && product.variants?.length > 0) {
      return product.variants.reduce((acc: number, v: any) => acc + (Number(v.stock_quantity ?? v.stockQuantity) || 0), 0);
    }
    return product.stockQty ?? product.stock_qty ?? 0;
  }, [product]);

  const priceDisplay = useMemo(() => {
    if (!product) return '—';
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
        return min === max ? `₹${min.toLocaleString()}` : `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
      }
      return 'Multiple Variants';
    }
    if (product.prices && product.prices.length > 0) {
      return `₹${(product.prices[0].price || 0).toLocaleString()}`;
    }
    if (product.price) {
      return `₹${Number(product.price).toLocaleString()}`;
    }
    return '₹0';
  }, [product]);

  const copySku = () => {
    if (!product?.sku) return;
    navigator.clipboard.writeText(product.sku);
    setCopiedSku(true);
    setTimeout(() => setCopiedSku(false), 2000);
    toast.success('SKU copied');
  };

  if (loading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="h-8 w-8 text-amber-600 animate-spin" />
        <p className="text-sm font-medium text-slate-600">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-20 text-center space-y-4">
        <p className="text-base text-red-600 font-semibold">Product not found.</p>
        <Button onClick={() => router.push('/admin/products')} variant="outline">
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/products')} className="cursor-pointer">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
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
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5 flex-wrap">
              <span className="font-medium text-slate-700">Category: <span className="text-slate-900 font-semibold">{categoryName}</span></span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <span>SKU: <code className="font-mono text-slate-800 font-semibold">{product.sku || 'N/A'}</code></span>
                {product.sku && (
                  <button onClick={copySku} className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer">
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
          </div>
        </div>

        <Button onClick={() => router.push(`/admin/products/${id}/edit`)} className="gap-2 bg-blue-600 hover:bg-blue-700 cursor-pointer">
          <Pencil className="h-4 w-4" /> Edit Product
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Media & Fast Facts */}
        <div className="lg:col-span-4 space-y-5">
          <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
            <div className="relative aspect-square bg-slate-100 flex items-center justify-center overflow-hidden">
              {allImages.length > 0 ? (
                <img
                  src={allImages[selectedImgIdx] || allImages[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="h-12 w-12 text-slate-300" />
              )}
              {allImages.length > 0 && (
                <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md text-white text-[11px] font-medium px-2 py-0.5 rounded-md">
                  {selectedImgIdx + 1} / {allImages.length}
                </div>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="p-3 bg-slate-50 border-t border-slate-100">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {allImages.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImgIdx(idx)}
                      className={cn(
                        'relative h-14 w-14 shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer',
                        selectedImgIdx === idx ? 'border-amber-600 ring-2 ring-amber-500/20' : 'border-slate-200 opacity-70 hover:opacity-100'
                      )}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.video && (
              <div className="p-3 border-t border-slate-100 bg-amber-50/50 flex items-center justify-between">
                <span className="text-xs text-amber-900 font-medium flex items-center gap-1.5 truncate">
                  <Film className="h-4 w-4 text-amber-600 shrink-0" /> Product Video Available
                </span>
                <a
                  href={product.video}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-amber-700 hover:text-amber-900 font-semibold bg-white border border-amber-200 rounded-md px-2 py-1 flex items-center gap-1 shadow-xs"
                >
                  <Play className="h-3 w-3 fill-current" /> Watch
                </a>
              </div>
            )}
          </Card>

          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-2 pt-4 px-4 border-b border-slate-100">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Info className="h-3.5 w-3.5 text-amber-600" /> Catalog Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Price Display</span>
                <span className="font-bold text-slate-900">{priceDisplay}</span>
              </div>
              {!product.has_variants && product.discountPrice && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Discount Price</span>
                  <span className="font-semibold text-emerald-600">₹{Number(product.discountPrice).toLocaleString()}</span>
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
                  {totalStock > 0 ? `${totalStock} units available` : 'Out of Stock'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Fulfillment */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-2 pt-4 px-4 border-b border-slate-100">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Truck className="h-3.5 w-3.5 text-blue-600" /> Fulfillment & Shipping
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div>
                <span className="text-xs text-slate-500 block mb-1">Processing Timeframe</span>
                {processingProfileInfo ? (
                  <div className="flex items-center gap-2 bg-amber-50/60 border border-amber-200/80 rounded-lg p-2.5 text-xs text-amber-900 font-medium">
                    <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-900 block">{processingProfileInfo.name}</span>
                      <span className="text-slate-600">
                        Dispatch in {processingProfileInfo.min_days === processingProfileInfo.max_days ? `${processingProfileInfo.min_days} days` : `${processingProfileInfo.min_days} - ${processingProfileInfo.max_days} days`}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-slate-600 italic">Default standard processing profile</span>
                )}
              </div>

              <div>
                <span className="text-xs text-slate-500 block mb-1">Shipping Profile</span>
                {shippingProfileInfo ? (
                  <div className="flex items-center gap-2 bg-blue-50/60 border border-blue-200/80 rounded-lg p-2.5 text-xs text-blue-900 font-medium">
                    <Truck className="h-4 w-4 text-blue-600 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-900 block">{shippingProfileInfo.name}</span>
                      {shippingProfileInfo.origin_pincode && (
                        <span className="text-slate-600">Origin Pincode: {shippingProfileInfo.origin_pincode}</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-slate-600 italic">Default standard shipping</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Tabs */}
        <div className="lg:col-span-8 space-y-4">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full grid grid-cols-4 bg-slate-200/70 p-1 rounded-xl">
              <TabsTrigger value="overview" className="text-xs font-semibold py-2 rounded-lg data-[state=active]:bg-white cursor-pointer">
                Overview
              </TabsTrigger>
              <TabsTrigger value="variations" className="text-xs font-semibold py-2 rounded-lg data-[state=active]:bg-white flex items-center justify-center gap-1.5 cursor-pointer">
                Variations {product.has_variants && product.variants?.length ? `(${product.variants.length})` : ''}
              </TabsTrigger>
              <TabsTrigger value="pricing" className="text-xs font-semibold py-2 rounded-lg data-[state=active]:bg-white cursor-pointer">
                Regional Rates
              </TabsTrigger>
              <TabsTrigger value="custom" className="text-xs font-semibold py-2 rounded-lg data-[state=active]:bg-white cursor-pointer">
                Buyer Custom Fields
              </TabsTrigger>
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview" className="mt-4 space-y-4">
              <Card className="border-slate-200 shadow-sm bg-white">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Info className="h-4 w-4 text-amber-600" /> Description
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  {product.description ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: product.description }}
                      className="prose prose-sm max-w-none text-slate-700 leading-relaxed"
                    />
                  ) : (
                    <p className="text-xs text-slate-400 italic">No description provided.</p>
                  )}
                </CardContent>
              </Card>

              {/* Specifications */}
              <Card className="border-slate-200 shadow-sm bg-white">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Gem className="h-4 w-4 text-amber-600" /> Jewelry Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-xs font-semibold text-slate-500 uppercase block">Materials</span>
                      <div className="flex flex-wrap gap-1">
                        {(product.materials_ids || product.materials || []).length > 0 ? (
                          (product.materials_ids || product.materials).map((mId: any, idx: number) => (
                            <Badge key={idx} variant="secondary" className="bg-amber-100 text-amber-900 text-xs">
                              {getAttributeValueLabel(mId).valueName}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">None</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-xs font-semibold text-slate-500 uppercase block">Gold Solidity</span>
                      <div className="flex flex-wrap gap-1">
                        {(product.gold_solidity_ids || product.gold_solidity || []).length > 0 ? (
                          (product.gold_solidity_ids || product.gold_solidity).map((sId: any, idx: number) => (
                            <Badge key={idx} variant="secondary" className="bg-amber-100 text-amber-900 text-xs">
                              {getAttributeValueLabel(sId).valueName}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">None</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-xs font-semibold text-slate-500 uppercase block">Gold Purity</span>
                      <div className="flex flex-wrap gap-1">
                        {(product.gold_purity_ids || product.gold_purity || []).length > 0 ? (
                          (product.gold_purity_ids || product.gold_purity).map((pId: any, idx: number) => (
                            <Badge key={idx} variant="secondary" className="bg-amber-100 text-amber-900 text-xs">
                              {getAttributeValueLabel(pId).valueName}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">None</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Variations */}
            <TabsContent value="variations" className="mt-4 space-y-4">
              {product.has_variants && product.variants && product.variants.length > 0 ? (
                <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                  <CardHeader className="p-4 bg-slate-50 border-b border-slate-200 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Layers className="h-4 w-4 text-indigo-600" /> Variation Combinations ({product.variants.length})
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
                            <th className="px-4 py-3">Variant</th>
                            <th className="px-4 py-3">SKU</th>
                            <th className="px-4 py-3">Attributes</th>
                            <th className="px-4 py-3">Stock</th>
                            <th className="px-4 py-3">Weight / Charges</th>
                            <th className="px-4 py-3 text-right">Prices</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {product.variants.map((v: any, idx: number) => {
                            const attrBadges = resolveAttributeBadges(v.attribute_value_ids || v.attributes || []);
                            const variantImg = v.variant_images?.[0] || v.images?.[0] || allImages[0];
                            const stock = Number(v.stock_quantity ?? v.stockQuantity ?? 0);

                            return (
                              <tr key={v.id || idx} className="hover:bg-slate-50">
                                <td className="px-4 py-3">
                                  <div className="h-10 w-10 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 shrink-0">
                                    {variantImg ? (
                                      <img src={variantImg} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                      <Package className="h-4 w-4 text-slate-400 m-auto" />
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3 font-mono font-medium text-slate-800">
                                  {v.sku || `VAR-${idx + 1}`}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex flex-wrap gap-1">
                                    {attrBadges.map((ab: any, aIdx: number) => (
                                      <Badge key={aIdx} variant="secondary" className="bg-indigo-50 text-indigo-700 text-[11px]">
                                        {ab.attrName}: <b>{ab.valueName}</b>
                                      </Badge>
                                    ))}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <Badge variant={stock > 0 ? 'default' : 'destructive'} className="text-xs">
                                    {stock} qty
                                  </Badge>
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                  {v.weight_grams ? <span>{v.weight_grams} g</span> : '—'}
                                  {v.making_charges ? <span className="block text-[10px] text-slate-500">MC: ₹{v.making_charges}</span> : null}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  {v.prices && v.prices.length > 0 ? (
                                    v.prices.map((pr: any, pIdx: number) => {
                                      const reg = getRegionInfo(pr.region_id);
                                      return (
                                        <div key={pIdx} className="text-xs">
                                          {reg.currency_symbol}{Number(pr.price).toLocaleString()}
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <span>₹{(v.price || 0).toLocaleString()}</span>
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
                  <p className="text-sm font-semibold">Simple Product (No Variations)</p>
                  <p className="text-xs text-slate-500">Single SKU: {product.sku || 'N/A'}, Stock: {totalStock}</p>
                </Card>
              )}
            </TabsContent>

            {/* Regional Rates */}
            <TabsContent value="pricing" className="mt-4 space-y-4">
              <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                <CardHeader className="p-4 bg-slate-50 border-b border-slate-200">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-600" /> Regional Price Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {product.prices && product.prices.length > 0 ? (
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-600 font-semibold border-b">
                        <tr>
                          <th className="px-4 py-3">Region</th>
                          <th className="px-4 py-3">Currency</th>
                          <th className="px-4 py-3">Base Price</th>
                          <th className="px-4 py-3">Compare at Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {product.prices.map((pr: any, idx: number) => {
                          const reg = getRegionInfo(pr.region_id);
                          return (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="px-4 py-3 font-semibold flex items-center gap-2">
                                <Globe className="h-3.5 w-3.5 text-blue-500" /> {reg.name}
                              </td>
                              <td className="px-4 py-3 font-mono">{reg.currency_code} ({reg.currency_symbol})</td>
                              <td className="px-4 py-3 font-bold text-sm">{reg.currency_symbol}{Number(pr.price).toLocaleString()}</td>
                              <td className="px-4 py-3 text-slate-500">
                                {pr.compare_at_price ? `${reg.currency_symbol}${Number(pr.compare_at_price).toLocaleString()}` : '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-2xl font-bold">₹{Number(product.price || 0).toLocaleString()}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Custom Options Manager */}
            <TabsContent value="custom" className="mt-4">
              <CustomOptionsManager productId={id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
