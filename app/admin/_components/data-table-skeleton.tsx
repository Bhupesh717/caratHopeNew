'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface DataTableSkeletonProps {
  columns?: number;
  rows?: number;
}

export function DataTableSkeleton({ columns = 5, rows = 8 }: DataTableSkeletonProps) {
  return (
    <div className="w-full space-y-3">
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`h-${i}`} className="h-4 flex-1" />
        ))}
      </div>
      {/* Data rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-3 px-4 py-3">
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={`${r}-${c}`} className="h-4 flex-1" style={{ maxWidth: c === 0 ? '40px' : undefined }} />
          ))}
        </div>
      ))}
    </div>
  );
}
