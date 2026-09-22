'use client';

import React, { useEffect, useState } from 'react';
import { ProductFormState, AdminAttribute } from '../../_types';
import { attributeService } from '../../_services/attribute.service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Eye,
  ShoppingBag,
  Heart,
  Share2,
  Star,
  Tag,
  Package,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ImageOff,
  Play,
  Truck,
  Sparkles,
  ShieldCheck,
  Gem,
} from 'lucide-react';

interface ProductPreviewModalProps {
  open: boolean;
  onClose: () => void;
  form: ProductFormState;
}

type MediaItem =
  | { type: 'image'; src: string }
  | { type: 'video'; src: string };

export function ProductPreviewModal({ open, onClose, form }: ProductPreviewModalProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [wishlist, setWishlist] = useState(false);
  const [fullAttributes, setFullAttributes] = useState<AdminAttribute[]>([]);

  useEffect(() => {
    if (open) {
      attributeService.getAll().then(setFullAttributes).catch(() => {});
    }
  }, [open]);

  // Build unified media list: images first, then video
  const media: MediaItem[] = [
    ...(form.images || []).map((src): MediaItem => ({ type: 'image', src })),
    ...(form.video ? [{ type: 'video' as const, src: form.video }] : []),
  ];

  const current = media[activeIdx] ?? null;
  const prev = () => setActiveIdx((p) => (p === 0 ? media.length - 1 : p - 1));
  const next = () => setActiveIdx((p) => (p === media.length - 1 ? 0 : p + 1));

  // Dynamic Pricing Calculation (Base price or Variant range)
  const basePrice = form.prices?.[0]?.price;
  const baseCompare = form.prices?.[0]?.compare_at_price;

  const variantPrices = (form.variants || [])
    .flatMap((v) => (v.prices || []).map((p) => p.price).filter((p) => typeof p === 'number' && p > 0)) as number[];
  const variantComparePrices = (form.variants || [])
    .flatMap((v) => (v.prices || []).map((p) => p.compare_at_price).filter((p) => typeof p === 'number' && p > 0)) as number[];

  const minPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : basePrice;
  const maxPrice = variantPrices.length > 0 ? Math.max(...variantPrices) : basePrice;
  const comparePrice = variantComparePrices.length > 0 ? Math.max(...variantComparePrices) : baseCompare;

  const hasRange = minPrice !== undefined && maxPrice !== undefined && minPrice !== maxPrice;

  const discount =
    minPrice && comparePrice && comparePrice > minPrice
      ? Math.round(((comparePrice - minPrice) / comparePrice) * 100)
      : null;

  // Helper to resolve attribute value IDs or objects to human-readable names
  const getAttrValueName = (valId: any): string => {
    if (!valId && valId !== 0) return '';
    if (typeof valId === 'object' && valId !== null) {
      if (Array.isArray(valId.value)) return valId.value.join(', ');
      if (valId.value) return String(valId.value);
      if (valId.name) return String(valId.name);
      if (valId.id) return getAttrValueName(valId.id);
      return '';
    }
    const strId = String(valId);
    for (const attr of fullAttributes) {
      const found = attr.values?.find((v) => String(v.id) === strId || v.value === strId);
      if (found) return found.value;
    }
    // If not a pure number, return the text
    if (isNaN(Number(valId))) return strId;
    return '';
  };

  const resolveNames = (items: any[] | undefined): string[] => {
    if (!items || !Array.isArray(items)) return [];
    return items
      .map((item) => getAttrValueName(item))
      .filter(Boolean);
  };

  const materialNames = resolveNames(form.materials);
  const solidityNames = resolveNames(form.gold_solidity);
  const purityNames = resolveNames(form.gold_purity);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[94vw] max-w-[880px] p-0 overflow-hidden rounded-2xl gap-0 border-0 shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Product Preview</DialogTitle>
        </DialogHeader>

        {/* Top Preview Banner */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 px-5 py-3 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-white shrink-0" />
            <p className="text-white text-xs font-semibold tracking-wide">
              Storefront Customer Preview
            </p>
          </div>
          <span className="text-[11px] text-white/90 bg-black/20 px-2.5 py-0.5 rounded-full font-medium">
            Live Mockup
          </span>
        </div>

        {/* Body: two-column layout */}
        <div className="flex flex-col sm:flex-row overflow-hidden bg-white max-h-[85vh]">

          {/* ── LEFT: Media viewer ───────────────────────────── */}
          <div className="sm:w-[46%] flex flex-col bg-slate-50 border-r border-slate-100 shrink-0" style={{ minHeight: 460 }}>

            {/* Main viewer */}
            <div className="relative flex-1 flex items-center justify-center bg-slate-100/70 overflow-hidden min-h-[300px]">
              {current === null ? (
                <div className="flex flex-col items-center gap-2 text-slate-400 py-12">
                  <ImageOff className="h-10 w-10" />
                  <p className="text-xs">No media uploaded yet</p>
                </div>
              ) : current.type === 'video' ? (
                <video
                  src={current.src}
                  controls
                  className="w-full h-full object-contain bg-black"
                />
              ) : (
                <img
                  src={current.src}
                  alt="Product"
                  className="w-full h-full object-contain"
                />
              )}

              {/* Discount badge */}
              {discount && (
                <div className="absolute top-3 left-3 bg-red-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-md">
                  -{discount}% OFF
                </div>
              )}

              {/* Nav arrows */}
              {media.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4 text-slate-700" />
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4 text-slate-700" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {media.length > 1 && (
              <div className="flex gap-2 p-3 bg-white border-t border-slate-100 overflow-x-auto shrink-0">
                {media.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveIdx(idx)}
                    className={`relative w-12 h-12 rounded-lg border-2 overflow-hidden shrink-0 transition-all cursor-pointer ${
                      activeIdx === idx
                        ? 'border-amber-500 ring-2 ring-amber-200 scale-105'
                        : 'border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {item.type === 'video' ? (
                      <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                        <Play className="h-4 w-4 text-white fill-white" />
                      </div>
                    ) : (
                      <img
                        src={item.src}
                        alt={`media-${idx}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Product details ───────────────────────── */}
          <div className="flex-1 flex flex-col overflow-y-auto p-5 sm:p-6 gap-3.5 bg-white">

            {/* Status & Feature Badges */}
            <div className="flex flex-wrap items-center gap-1.5">
              {form.status === 'active' && (
                <Badge className="text-[11px] h-5.5 px-2 bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">
                  <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" /> Active
                </Badge>
              )}
              {form.is_featured && (
                <Badge className="text-[11px] h-5.5 px-2 bg-amber-50 text-amber-700 border-amber-200 font-medium">
                  <Sparkles className="h-3 w-3 mr-1 text-amber-600" /> Featured
                </Badge>
              )}
              {form.has_variants && (
                <Badge variant="secondary" className="text-[11px] h-5.5 px-2 bg-slate-100 text-slate-700 font-medium">
                  {form.variants?.length || 0} Variants
                </Badge>
              )}
            </div>

            {/* Title & SKU */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 leading-snug font-serif">
                {form.name || (
                  <span className="text-slate-400 font-normal italic text-sm">Product name not specified</span>
                )}
              </h2>
              {form.sku && (
                <p className="text-xs text-slate-400 mt-1 font-mono">SKU: {form.sku}</p>
              )}
            </div>

            {/* Star Rating Simulation */}
            <div className="flex items-center gap-1">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs text-slate-500 font-medium ml-1">5.0 (New Listing)</span>
            </div>

            {/* Pricing Section */}
            <div className="flex items-baseline gap-2.5 pt-1">
              {minPrice ? (
                <>
                  <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif">
                    {hasRange
                      ? `₹${minPrice.toLocaleString('en-IN')} – ₹${maxPrice.toLocaleString('en-IN')}`
                      : `₹${minPrice.toLocaleString('en-IN')}`}
                  </span>
                  {comparePrice && comparePrice > minPrice && (
                    <span className="text-sm text-slate-400 line-through">
                      ₹{comparePrice.toLocaleString('en-IN')}
                    </span>
                  )}
                  {discount && (
                    <span className="text-xs font-bold text-emerald-600">
                      Save {discount}%
                    </span>
                  )}
                </>
              ) : (
                <span className="text-slate-400 italic text-sm">Price not configured</span>
              )}
            </div>

            {/* Search Tags */}
            {(form.tags || []).length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {form.tags!.map((tag) => (
                  <span
                    key={tag}
                    className="bg-slate-100 text-slate-600 text-[11px] px-2.5 py-0.5 rounded-full border border-slate-200/80 font-normal"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            {form.description ? (
              <div
                className="text-xs sm:text-sm text-slate-600 prose prose-sm max-w-none border-t border-slate-100 pt-3 leading-relaxed line-clamp-4"
                dangerouslySetInnerHTML={{ __html: form.description }}
              />
            ) : (
              <p className="text-xs text-slate-400 italic border-t border-slate-100 pt-2">No description added</p>
            )}

            {/* Key Specifications & Info Matrix */}
            <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs text-slate-700">
              <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <Package className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate">
                  {form.has_variants
                    ? `${form.variants?.length || 0} Variant SKUs`
                    : form.stock_qty !== undefined
                    ? `${form.stock_qty} in stock`
                    : 'Stock unconfigured'}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <Tag className="h-4 w-4 text-primary shrink-0" />
                <span>{form.allow_offers ? `Offers allowed (up to ${form.max_offer_discount_percent || 0}%)` : 'Fixed Price'}</span>
              </div>

              {materialNames.length > 0 && (
                <div className="col-span-2 flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="truncate">
                    <strong>Materials:</strong> {materialNames.join(', ')}
                  </span>
                </div>
              )}

              {solidityNames.length > 0 && (
                <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <Gem className="h-4 w-4 text-amber-600 shrink-0" />
                  <span className="truncate">
                    <strong>Solidity:</strong> {solidityNames.join(', ')}
                  </span>
                </div>
              )}

              {purityNames.length > 0 && (
                <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                  <span className="truncate">
                    <strong>Purity:</strong> {purityNames.join(', ')}
                  </span>
                </div>
              )}
            </div>

            {/* Mock CTA buttons */}
            <div className="flex gap-2 mt-auto pt-3 border-t border-slate-100">
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-10 text-sm font-semibold shadow-sm"
                disabled
              >
                <ShoppingBag className="h-4 w-4" /> Add to Cart
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={`h-10 w-10 ${wishlist ? 'border-red-300 text-red-500 bg-red-50' : ''}`}
                onClick={() => setWishlist((w) => !w)}
              >
                <Heart className={`h-4 w-4 ${wishlist ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button variant="outline" size="icon" className="h-10 w-10" disabled>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
