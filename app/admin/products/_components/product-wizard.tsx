'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  ArrowLeft, Image as ImageIcon, Package, Tag, Layers, Truck, CheckCircle2, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ProductFormState } from '../../_types';
import { productService } from '../../_services/product.service';
import dynamic from 'next/dynamic';

// Lazy-load preview modal (avoids SSR issues)
const ProductPreviewModal = dynamic(
  () => import('./product-preview-modal').then(m => m.ProductPreviewModal),
  { ssr: false }
);

// Step Components
import { Step1ItemDetails } from './wizard-steps/step1-item-details';
import { Step2Media } from './wizard-steps/step2-media';
import { Step3Variations } from './wizard-steps/step3-variations';
import { Step4Attributes } from './wizard-steps/step4-attributes';
import { Step5Delivery } from './wizard-steps/step5-delivery';

const SECTIONS = [
  { id: 'item-details', title: 'Item Details', icon: Package, subtitle: 'Product name, category, SKU and description' },
  { id: 'media', title: 'Media', icon: ImageIcon, subtitle: 'High resolution images and showcase video' },
  { id: 'variations', title: 'Variations', icon: Layers, subtitle: 'Variation axes and SKU matrix' },
  { id: 'attributes', title: 'Attributes', icon: Tag, subtitle: 'Gold solidity, materials, attributes and tags' },
  { id: 'delivery', title: 'Pricing & Delivery', icon: Truck, subtitle: 'Regional pricing, inventory and shipping profiles' }
];

export function ProductWizard({ mode = 'create', initialProduct = null }: { mode?: 'create' | 'edit', initialProduct?: any }) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('item-details');
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Centralized Massive Payload State
  const [form, setForm] = useState<ProductFormState>({
    name: '',
    category_id: '',
    description: '',
    status: 'active',
    is_featured: false,
    sku: '',
    images: [], 
    video: '',
    
    has_variants: false,
    prices_vary: false,
    quantities_vary: false,
    skus_vary: false,
    processing_time_varies: false,
    max_variation_axes: 2,
    variation_axis_ids: [],
    
    variants: [],
    
    prices: [],
    total_stock: undefined,
    stock_qty: undefined,
    
    is_global_pricing_enabled: true,
    allow_offers: false,
    max_offer_discount_percent: undefined,
    
    tags: [],
    materials: [],
    gold_solidity: [],
    gold_purity: [],
    listing_attributes: {},
    
    processing_profile_id: undefined,
    shipping_profile_id: undefined,
  });

  // ── Edit mode prefill ──────────────────────────────────────────────────────
  useEffect(() => {
    if (mode === 'edit' && initialProduct) {
      const p = initialProduct;

      const rawMaterials = p.materials_ids || (Array.isArray(p.materials) && typeof p.materials[0] === 'number' ? p.materials : p.listing_attributes?.materials?.attribute_value_ids || []);
      const rawSolidity = p.gold_solidity_ids || (Array.isArray(p.gold_solidity) && typeof p.gold_solidity[0] === 'number' ? p.gold_solidity : p.listing_attributes?.gold_solidity?.attribute_value_ids || []);
      const rawPurity = p.gold_purity_ids || (Array.isArray(p.gold_purity) && typeof p.gold_purity[0] === 'number' ? p.gold_purity : p.listing_attributes?.gold_purity?.attribute_value_ids || []);

      const hasVariants = Boolean(p.has_variants ?? (p.variants && p.variants.length > 0));

      setForm({
        name: p.name || '',
        category_id: p.category_id || p.categoryId || (p.category ? p.category.id : '') || '',
        description: p.description || '',
        status: p.status || 'active',
        is_featured: p.isFeatured ?? p.is_featured ?? false,
        sku: p.sku || '',
        when_was_it_made: p.when_was_it_made || p.whenWasItMade || undefined,

        images: Array.isArray(p.images) ? p.images : (p.product_images || []).map((img: any) => img.image_path || img.url),
        video: p.video || '',

        has_variants: hasVariants,
        prices_vary: p.prices_vary ?? (p.variants && p.variants.some((v: any) => (v.prices && v.prices.length > 0) || v.price)) ?? false,
        quantities_vary: p.quantities_vary ?? (p.variants && p.variants.length > 0) ?? false,
        skus_vary: p.skus_vary ?? (p.variants && p.variants.some((v: any) => Boolean(v.sku))) ?? false,
        processing_time_varies: p.processing_time_varies ?? false,
        max_variation_axes: p.max_variation_axes ?? 2,
        variation_axis_ids: (p.variation_axis_ids && p.variation_axis_ids.length > 0)
          ? p.variation_axis_ids
          : (p.attributes || []).map((a: any) => String(a.id || a.attribute_id)),

        variants: (p.variants || []).map((v: any) => ({
          id: v.id,
          attributes: v.attribute_value_ids || v.attributes || [],
          prices: (v.prices && v.prices.length > 0)
            ? v.prices.map((pr: any) => ({
                region_id: pr.region_id,
                price: pr.price,
                compare_at_price: pr.compare_at_price ?? undefined,
              }))
            : v.price
            ? [{ region_id: 1, price: typeof v.price === 'object' ? v.price.amount : Number(v.price), compare_at_price: v.compare_at_price }]
            : [],
          stock_quantity: v.stock_quantity ?? v.stockQuantity ?? 0,
          sku: v.sku || undefined,
          processing_days: v.processing_days ?? undefined,
          is_active: v.is_active ?? true,
          weight_grams: v.weight_grams ?? undefined,
          making_charges: v.making_charges ?? undefined,
          variant_images: v.variant_images || [],
        })),

        prices: (p.prices || []).map((pr: any) => ({
          region_id: pr.region_id,
          price: pr.price,
          compare_at_price: pr.compare_at_price ?? undefined,
        })),

        total_stock: p.total_stock ?? p.stock_qty ?? p.stockQty ?? undefined,
        stock_qty: p.stock_qty ?? p.stockQty ?? undefined,

        is_global_pricing_enabled: p.is_global_pricing_enabled ?? true,
        allow_offers: p.allow_offers ?? false,
        max_offer_discount_percent: p.max_offer_discount_percent ?? undefined,

        tags: p.tags || [],
        materials: rawMaterials,
        gold_solidity: rawSolidity,
        gold_purity: rawPurity,
        listing_attributes: p.listing_attributes || {},

        processing_profile_id: p.processing_profile_id ?? (p.processing_profile ? p.processing_profile.id : undefined),
        shipping_profile_id: p.shipping_profile_id ?? (p.shipping_profile ? p.shipping_profile.id : undefined),
      });
    }
  }, [mode, initialProduct]);

  // ── On-Scroll Tracking (Scroll Spy) ────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 220; // Offset for sticky topbar + stepper

      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(`section-${SECTIONS[i].id}`);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(SECTIONS[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(`section-${sectionId}`);
    if (el) {
      const headerOffset = 180; // Offset for sticky header & stepper
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      setActiveSection(sectionId);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (mode === 'create') {
        await productService.create(form);
        toast.success('Product created successfully!');
      } else {
        await productService.update(initialProduct.id, form);
        toast.success('Product updated successfully!');
      }
      router.push('/admin/products');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-28">
      {/* Top Title Bar */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/admin/products')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{mode === 'edit' ? 'Edit Product' : 'Add New Product'}</h1>
          <p className="text-sm text-slate-500">Configure your product, media, variations, attributes and pricing on a single page.</p>
        </div>
      </div>

      {/* Sticky Stepper Navigation (Scroll-spy) */}
      <div className="sticky top-14 z-30 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-sm px-6 py-5 transition-all duration-300">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {SECTIONS.map((s, i, arr) => {
            const isActive = activeSection === s.id;
            const activeIndex = SECTIONS.findIndex((x) => x.id === activeSection);
            const isPassed = activeIndex > i;

            return (
              <React.Fragment key={s.id}>
                <button
                  type="button"
                  onClick={() => scrollToSection(s.id)}
                  className={`flex flex-col items-center gap-2 cursor-pointer transition-all duration-300 group shrink-0 ${
                    isActive ? 'text-primary' : isPassed ? 'text-emerald-700' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <div
                    className={`h-11 w-11 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isActive
                        ? 'border-primary bg-primary/10 shadow-sm ring-4 ring-primary/15 text-primary'
                        : isPassed
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 bg-slate-50 text-slate-400 group-hover:border-slate-300 group-hover:bg-slate-100'
                    }`}
                  >
                    <s.icon className="h-5 w-5" />
                  </div>
                  <span className={`text-[11px] sm:text-xs uppercase tracking-wider whitespace-nowrap leading-normal py-0.5 transition-colors ${
                    isActive ? 'text-primary font-bold' : isPassed ? 'text-emerald-700 font-medium' : 'text-slate-500'
                  }`}>
                    {s.title}
                  </span>
                </button>

                {i < arr.length - 1 && (
                  <div
                    className={`flex-1 min-w-4 sm:min-w-10 h-0.5 transition-colors duration-300 self-center mb-6 ${
                      isPassed ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── Single-Page Continuous Form Sections ── */}
      <div className="space-y-8">
        
        {/* Section 1: Item Details */}
        <section id="section-item-details" className="scroll-mt-44">
          <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardHeader className="border-b bg-slate-50/70 py-4 px-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-serif font-semibold text-slate-900">Item Details</CardTitle>
                  <CardDescription className="text-xs text-slate-500 mt-0.5">Product title, category mapping, SKU code, status and rich description</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              <Step1ItemDetails form={form} setForm={setForm} />
            </CardContent>
          </Card>
        </section>

        {/* Section 2: Media */}
        <section id="section-media" className="scroll-mt-44">
          <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardHeader className="border-b bg-slate-50/70 py-4 px-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-serif font-semibold text-slate-900">Media & Visuals</CardTitle>
                  <CardDescription className="text-xs text-slate-500 mt-0.5">High-definition gallery images (up to 20) and product video</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              <Step2Media form={form} setForm={setForm} />
            </CardContent>
          </Card>
        </section>

        {/* Section 3: Variations */}
        <section id="section-variations" className="scroll-mt-44">
          <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-visible bg-white">
            <CardHeader className="border-b bg-slate-50/70 py-4 px-6 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-serif font-semibold text-slate-900">Product Variations</CardTitle>
                  <CardDescription className="text-xs text-slate-500 mt-0.5">Configure variation axes (e.g. Ring Size, Metal Type) and generated SKU matrix</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 overflow-visible">
              <Step3Variations form={form} setForm={setForm} />
            </CardContent>
          </Card>
        </section>

        {/* Section 4: Attributes */}
        <section id="section-attributes" className="scroll-mt-44">
          <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-visible bg-white">
            <CardHeader className="border-b bg-slate-50/70 py-4 px-6 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <Tag className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-serif font-semibold text-slate-900">Attributes & Specifications</CardTitle>
                  <CardDescription className="text-xs text-slate-500 mt-0.5">Gold purity, metal solidity, category attributes, materials and discovery tags</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 overflow-visible">
              <Step4Attributes form={form} setForm={setForm} />
            </CardContent>
          </Card>
        </section>

        {/* Section 5: Pricing & Delivery */}
        <section id="section-delivery" className="scroll-mt-44">
          <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardHeader className="border-b bg-slate-50/70 py-4 px-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-serif font-semibold text-slate-900">Pricing, Stock & Delivery</CardTitle>
                  <CardDescription className="text-xs text-slate-500 mt-0.5">Base & regional prices, inventory stock levels, processing and shipping profiles</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              <Step5Delivery form={form} setForm={setForm} />
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 z-50 flex justify-between items-center px-6 sm:px-10 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] md:pl-72">
        <Button variant="outline" onClick={() => router.push('/admin/products')} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </Button>
        <div className="flex items-center gap-3">
          {/* Preview Product */}
          <Button
            variant="outline"
            className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
            onClick={() => setPreviewOpen(true)}
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          
          <Button onClick={handleSave} disabled={loading} size="lg" className="gap-2 bg-emerald-600 hover:bg-emerald-700 font-medium px-6">
            {loading ? 'Saving...' : mode === 'edit' ? 'Update Product' : 'Create Product'}
            {!loading && <CheckCircle2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Product Preview Modal */}
      {previewOpen && (
        <ProductPreviewModal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          form={form}
        />
      )}
    </div>
  );
}
