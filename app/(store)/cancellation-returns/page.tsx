'use client';

import { PageHeader } from '@/components/page-header';
import { ArrowLeftRight } from 'lucide-react';

export default function CancellationReturnsPage() {
  return (
    <div className="bg-muted min-h-screen pb-24">
      <PageHeader
        title="Cancellation & Returns"
        eyebrow="Customer Service"
        icon={ArrowLeftRight}
        imageSrc="/page_heaer.png"
      />
      <div className="mx-auto max-w-4xl px-6 pt-16">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-border/60 prose prose-slate prose-a:text-primary max-w-none">
          <h2 className="text-2xl font-serif text-foreground mb-4">1. Order Cancellations</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            You may cancel your order within 24 hours of placement for a full refund. After 24 hours, standard orders may be subject to a restocking fee, and custom orders cannot be canceled as production will have already commenced.
          </p>

          <h2 className="text-2xl font-serif text-foreground mb-4">2. Return Policy</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            We accept returns within 14 days of delivery. To initiate a return, please contact our customer service team to receive a Return Merchandise Authorization (RMA) number and fully insured return shipping label.
          </p>

          <h2 className="text-2xl font-serif text-foreground mb-4">3. Condition of Returned Items</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Returned items must be completely unworn, showing absolutely no signs of wear or alteration. All original grading reports, certificates, and presentation boxes must be included. If a diamond grading certificate is missing, a replacement fee will be deducted from your refund.
          </p>

          <h2 className="text-2xl font-serif text-foreground mb-4">4. Exchanges</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            If you wish to exchange an item for a different size or style, we offer a 30-day exchange window for all non-custom pieces. Please contact us to coordinate the exchange safely.
          </p>
        </div>
      </div>
    </div>
  );
}
