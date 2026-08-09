'use client';

import { PageHeader } from '@/components/page-header';
import { RefreshCcw } from 'lucide-react';

export default function RefundPolicyPage() {
  return (
    <div className="bg-muted min-h-screen pb-24">
      <PageHeader
        title="Refund Policy"
        eyebrow="Customer Service"
        icon={RefreshCcw}
        imageSrc="/page_heaer.png"
      />
      <div className="mx-auto max-w-4xl px-6 pt-16">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-border/60 prose prose-slate prose-a:text-primary max-w-none">
          <h2 className="text-2xl font-serif text-foreground mb-4">1. Eligibility for Refunds</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            We want you to be completely satisfied with your purchase. If you are not entirely happy, you may request a refund within 14 days of receiving your item. The jewelry must be unworn, in its original pristine condition, and accompanied by all original packaging, certificates, and tags.
          </p>

          <h2 className="text-2xl font-serif text-foreground mb-4">2. Non-Refundable Items</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Please note that custom-designed pieces, personalized engravings, and items modified to specific requests are final sale and are not eligible for a refund.
          </p>

          <h2 className="text-2xl font-serif text-foreground mb-4">3. Refund Process</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Once your returned item is received and inspected by our quality assurance team, we will notify you of the approval or rejection of your refund. Approved refunds will be processed, and a credit will automatically be applied to your original method of payment within 7-10 business days.
          </p>
        </div>
      </div>
    </div>
  );
}
