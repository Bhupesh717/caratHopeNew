'use client';

import React, { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChevronLeft, ChevronRight, Search, Plus } from 'lucide-react';
import { DataTableSkeleton } from './data-table-skeleton';
import { EmptyState } from './empty-state';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface DTColumn<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export interface DTFilter {
  key: string;
  label: string;
  options: { label: string; value: string }[];
}

interface DataTableProps<T extends { id: string }> {
  columns: DTColumn<T>[];
  data: T[];
  filters?: DTFilter[];
  loading?: boolean;
  /** Render action buttons per row */
  actions?: (row: T) => React.ReactNode;
  onAdd?: () => void;
  addLabel?: string;
  searchPlaceholder?: string;
  /** Which fields to search over (defaults to all string fields) */
  searchKeys?: (keyof T)[];
  pageSize?: number;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function DataTable<T extends { id: string }>({
  columns,
  data,
  filters = [],
  loading,
  actions,
  onAdd,
  addLabel = 'Add New',
  searchPlaceholder = 'Search…',
  searchKeys,
  pageSize: defaultPageSize = 10,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // ---- Filter + search ----
  const filtered = useMemo(() => {
    let result = data;

    // Apply search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((row) => {
        const keys = searchKeys || (Object.keys(row as object) as (keyof T)[]);
        return keys.some((k) => {
          const v = row[k];
          return typeof v === 'string' && v.toLowerCase().includes(q);
        });
      });
    }

    // Apply filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value && value !== '__all__') {
        result = result.filter((row) => String((row as any)[key]) === value);
      }
    });

    return result;
  }, [data, search, activeFilters, searchKeys]);

  // ---- Pagination ----
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const clamped = Math.min(page, totalPages);
  const paginated = filtered.slice((clamped - 1) * pageSize, clamped * pageSize);

  // Reset to page 1 when filters/search change
  React.useEffect(() => { setPage(1); }, [search, activeFilters, pageSize]);

  if (loading) return <DataTableSkeleton columns={columns.length + (actions ? 1 : 0)} />;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {filters.map((f) => (
            <Select
              key={f.key}
              value={activeFilters[f.key] || '__all__'}
              onValueChange={(v) => setActiveFilters((p) => ({ ...p, [f.key]: v }))}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={f.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All {f.label}</SelectItem>
                {f.options.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>
        {onAdd && (
          <Button onClick={onAdd} size="sm" className="shrink-0">
            <Plus className="mr-1 h-4 w-4" /> {addLabel}
          </Button>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No results found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col.key} className={col.className}>{col.header}</TableHead>
                ))}
                {actions && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      {col.render ? col.render(row) : String((row as any)[col.key] ?? '')}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {actions(row)}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            Showing {(clamped - 1) * pageSize + 1}–{Math.min(clamped * pageSize, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
              <SelectTrigger className="w-[80px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={clamped <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-[80px] text-center text-sm">
                {clamped} / {totalPages}
              </span>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={clamped >= totalPages} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
