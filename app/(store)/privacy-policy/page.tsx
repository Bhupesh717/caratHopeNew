'use client';

import { PageHeader } from '@/components/page-header';
import { ShieldCheck } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-muted min-h-screen pb-24">
      <PageHeader
        title="Privacy Policy"
        eyebrow="Legal"
        icon={ShieldCheck}
        imageSrc="/page_heaer.png"
      />
      <div className="mx-auto max-w-4xl px-6 pt-16">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-border/60 prose prose-slate prose-a:text-primary max-w-none">
          <h2 className="text-2xl font-serif text-foreground mb-4">1. Information We Collect</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            At CaratHope, we collect personal information such as your name, email address, shipping address, and payment details when you place an order or register on our site. We also collect non-personal data such as browser type and interaction metrics to improve your shopping experience.
          </p>

          <h2 className="text-2xl font-serif text-foreground mb-4">2. How We Use Your Information</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Your information is strictly used to process your orders, communicate with you regarding your purchases, and provide personalized jewelry recommendations. We do not sell your personal information to third parties.
          </p>

          <h2 className="text-2xl font-serif text-foreground mb-4">3. Data Security</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            We implement state-of-the-art encryption and security measures to protect your personal and payment information. All transactions are processed through secure gateway providers and are not stored on our servers.
          </p>

          <h2 className="text-2xl font-serif text-foreground mb-4">4. Cookies</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            We use cookies to enhance your browsing experience, remember your preferences, and analyze site traffic. You can choose to disable cookies through your browser settings, though some features of our site may not function properly as a result.
          </p>
        </div>
      </div>
    </div>
  );
}
