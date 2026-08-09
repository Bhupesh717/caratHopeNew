'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuoteCardProps {
  amount: number;
  notes?: string;
  onAccept?: () => void;
  onReject?: () => void;
  onDownloadInvoice?: () => void;
  status: 'Pending' | 'Accepted' | 'Rejected';
}

export function QuoteCard({ amount, notes, onAccept, onReject, onDownloadInvoice, status }: QuoteCardProps) {
  // Format currency
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-bespoke-gold/30 rounded-2xl p-6 shadow-[0_10px_40px_-15px_rgba(212,175,55,0.15)] relative overflow-hidden"
    >
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-bespoke-gold/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-bespoke-gold/10 flex items-center justify-center text-bespoke-gold-dark">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-medium">Official Quotation</h3>
            <p className="text-sm text-muted-foreground">Please review your bespoke order quote</p>
          </div>
        </div>

        {status === 'Accepted' && (
          <span className="px-3 py-1 bg-green-500/10 text-green-600 border border-green-200 rounded-full text-xs font-medium uppercase tracking-wider">
            Accepted
          </span>
        )}
        {status === 'Rejected' && (
          <span className="px-3 py-1 bg-red-500/10 text-red-600 border border-red-200 rounded-full text-xs font-medium uppercase tracking-wider">
            Declined
          </span>
        )}
      </div>

      <div className="mt-8 mb-6 pb-6 border-b border-border relative z-10">
        <div className="flex justify-between items-end">
          <span className="text-muted-foreground uppercase text-xs font-semibold tracking-wider">Total Amount</span>
          <span className="text-4xl font-serif font-medium text-foreground tracking-tight">{formattedAmount}</span>
        </div>
      </div>

      {notes && (
        <div className="mb-8 relative z-10">
          <h4 className="text-sm font-medium mb-2 text-foreground">Designer Notes</h4>
          <p className="text-sm text-muted-foreground leading-relaxed p-4 bg-accent/30 rounded-xl italic">
            "{notes}"
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 relative z-10">
        {status === 'Pending' ? (
          <>
            <Button 
              onClick={onAccept} 
              className="flex-1 bg-bespoke-gold hover:bg-bespoke-gold-dark text-white transition-colors"
            >
              <Check className="w-4 h-4 mr-2" />
              Accept Quote
            </Button>
            <Button 
              variant="outline" 
              onClick={onReject}
              className="flex-1 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30"
            >
              <X className="w-4 h-4 mr-2" />
              Decline
            </Button>
          </>
        ) : status === 'Accepted' ? (
          <Button 
            variant="outline" 
            onClick={onDownloadInvoice}
            className="w-full border-bespoke-gold/30 hover:bg-bespoke-gold/5"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Invoice
          </Button>
        ) : null}
      </div>
    </motion.div>
  );
}
