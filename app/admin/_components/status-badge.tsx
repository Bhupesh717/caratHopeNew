'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  inactive: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  processing: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  shipped: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400',
  delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
  paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  unpaid: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
  refunded: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize',
        statusStyles[status] || 'bg-zinc-100 text-zinc-600',
        className
      )}
    >
      {status}
    </span>
  );
}
