'use client';

import { PageHeader } from '@/components/page-header';
import { FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="bg-muted min-h-screen pb-24">
      <PageHeader
        title="Terms And Conditions"
        eyebrow="Legal"
        icon={FileText}
        imageSrc="/page_heaer.png"
      />
      <div className="mx-auto max-w-4xl px-6 pt-16">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-border/60 prose prose-slate prose-a:text-primary max-w-none">
          <h2 className="text-2xl font-serif text-foreground mb-4">1. Acceptance of Terms</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            By accessing and using the CaratHope website, you agree to comply with and be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our website.
          </p>

          <h2 className="text-2xl font-serif text-foreground mb-4">2. Product Information and Pricing</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            We strive to display our jewelry as accurately as possible. However, exact colors and sizes may vary depending on your monitor. All prices are subject to change without notice. In the event of a pricing error, we reserve the right to cancel any orders placed for the item at the incorrect price.
          </p>

          <h2 className="text-2xl font-serif text-foreground mb-4">3. Intellectual Property</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            All content on this site, including but not limited to text, graphics, logos, images, and software, is the property of CaratHope and is protected by international copyright laws.
          </p>

          <h2 className="text-2xl font-serif text-foreground mb-4">4. Custom Orders</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Bespoke and custom-made jewelry pieces require a non-refundable deposit. Once production has begun, custom orders cannot be canceled or modified.
          </p>
        </div>
      </div>
    </div>
  );
}
