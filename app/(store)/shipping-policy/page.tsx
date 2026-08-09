'use client';

import { PageHeader } from '@/components/page-header';
import { Truck } from 'lucide-react';

export default function ShippingPolicyPage() {
  return (
    <div className="bg-muted min-h-screen pb-24">
      <PageHeader
        title="Shipping Policy"
        eyebrow="Customer Service"
        icon={Truck}
        imageSrc="/page_heaer.png"
      />
      <div className="mx-auto max-w-4xl px-6 pt-16">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-border/60 prose prose-slate prose-a:text-primary max-w-none">
          <h2 className="text-2xl font-serif text-foreground mb-4">1. Free Insured Shipping</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            CaratHope is proud to offer free, fully insured global shipping on all orders. Your fine jewelry is securely packaged and requires a direct signature upon delivery to ensure it reaches you safely.
          </p>

          <h2 className="text-2xl font-serif text-foreground mb-4">2. Processing Times</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            In-stock items are typically processed and dispatched within 2-3 business days. Custom orders, bespoke designs, and sized rings may take 3-5 weeks for production before dispatch.
          </p>

          <h2 className="text-2xl font-serif text-foreground mb-4">3. International Shipping & Customs</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            We ship to most countries worldwide. Please note that international shipments may be subject to customs duties, taxes, and import fees levied by the destination country. The customer is responsible for any such fees.
          </p>
        </div>
      </div>
    </div>
  );
}
