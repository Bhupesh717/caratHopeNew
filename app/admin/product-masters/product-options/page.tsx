'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import {
  List,
  Search,
  ChevronDown,
  Clock,
  Gem,
  Ruler,
  Weight,
  Hash,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { productOptionService } from '../../_services/product-option.service';
import { AdminProductOptionGroup } from '../../_types';

// Icon map for group names
const groupIcons: Record<string, React.ReactNode> = {
  'Made by me': <Clock className="h-5 w-5" />,
  'Vintage': <Gem className="h-5 w-5" />,
};

// Color palette for groups
const groupColors = [
  { bg: 'from-violet-500/10 to-purple-500/10', border: 'border-violet-200', badge: 'bg-violet-100 text-violet-700', icon: 'bg-violet-500/10 text-violet-600', dot: 'bg-violet-500' },
  { bg: 'from-amber-500/10 to-orange-500/10', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700', icon: 'bg-amber-500/10 text-amber-600', dot: 'bg-amber-500' },
  { bg: 'from-emerald-500/10 to-teal-500/10', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700', icon: 'bg-emerald-500/10 text-emerald-600', dot: 'bg-emerald-500' },
  { bg: 'from-sky-500/10 to-blue-500/10', border: 'border-sky-200', badge: 'bg-sky-100 text-sky-700', icon: 'bg-sky-500/10 text-sky-600', dot: 'bg-sky-500' },
  { bg: 'from-rose-500/10 to-pink-500/10', border: 'border-rose-200', badge: 'bg-rose-100 text-rose-700', icon: 'bg-rose-500/10 text-rose-600', dot: 'bg-rose-500' },
];

// Separate type for unit presets
interface UnitPresets {
  [key: string]: string[];
}

export default function ProductOptionsPage() {
  const [data, setData] = useState<AdminProductOptionGroup[]>([]);
  const [unitPresets, setUnitPresets] = useState<UnitPresets>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await productOptionService.getAll();
      setData(response);
      // Expand all groups by default
      setExpandedGroups(new Set(response.map((_, i) => i)));
    } catch (e) {
      toast.error('Failed to load product options');
    }

    // Also try to get unit presets separately
    try {
      const { adminApiClient } = await import('@/lib/api-client');
      const res = await adminApiClient.get('/admin/product-options');
      const resData = res.data?.data || res.data;
      if (resData?.unit_presets) {
        setUnitPresets(resData.unit_presets);
      }
    } catch (e) {
      // Unit presets are optional
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleGroup = (index: number) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();
    return data
      .map((group) => ({
        ...group,
        options: group.options.filter(
          (opt) =>
            opt.label.toLowerCase().includes(q) ||
            opt.value.toLowerCase().includes(q)
        ),
      }))
      .filter((group) => group.options.length > 0 || group.group.toLowerCase().includes(q));
  }, [data, searchQuery]);

  // Stats
  const totalGroups = data.length;
  const totalOptions = data.reduce((sum, g) => sum + g.options.length, 0);
  const totalUnits = Object.values(unitPresets).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white shadow-lg">
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
            <Layers className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Product Options</h1>
            <p className="mt-2 text-slate-300">
              View fixed option lists and unit presets used across products.
            </p>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute -right-10 -top-24 h-64 w-64 rounded-full bg-white/5 blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl"></div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Option Groups', value: totalGroups, icon: <Layers className="h-4 w-4" />, color: 'text-violet-600 bg-violet-50 border-violet-100' },
          { label: 'Total Options', value: totalOptions, icon: <Hash className="h-4 w-4" />, color: 'text-amber-600 bg-amber-50 border-amber-100' },
          { label: 'Unit Presets', value: totalUnits, icon: <Ruler className="h-4 w-4" />, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
        ].map((stat) => (
          <Card key={stat.label} className={`border ${stat.color.split(' ')[2]} shadow-none`}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{loading ? '—' : stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search + Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search options..."
            className="pl-9 bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className="bg-slate-100/80">
            <TabsTrigger value="all" className="text-xs">All Groups</TabsTrigger>
            <TabsTrigger value="units" className="text-xs">Unit Presets</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="border-slate-200 shadow-sm overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((j) => (
                    <Skeleton key={j} className="h-10 rounded-md" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Option Groups Tab */}
      {!loading && activeTab === 'all' && (
        <div className="space-y-4">
          {filteredData.length === 0 ? (
            <Card className="border-dashed border-2 border-slate-200 shadow-none">
              <CardContent className="py-16 flex flex-col items-center justify-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 mb-4">
                  <Search className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-lg font-medium text-slate-600">No options found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchQuery ? 'Try a different search term.' : 'No static option groups available yet.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredData.map((group, index) => {
              const colors = groupColors[index % groupColors.length];
              const isExpanded = expandedGroups.has(index);
              const icon = groupIcons[group.group] || <Sparkles className="h-5 w-5" />;

              return (
                <Card
                  key={index}
                  className={`border ${colors.border} shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md`}
                >
                  {/* Group Header - Clickable */}
                  <button
                    onClick={() => toggleGroup(index)}
                    className={`w-full flex items-center justify-between p-5 bg-gradient-to-r ${colors.bg} transition-colors duration-200 hover:opacity-90`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors.icon}`}>
                        {icon}
                      </div>
                      <div className="text-left">
                        <h3 className="text-base font-semibold text-slate-800">{group.group}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {group.options.length} option{group.options.length !== 1 ? 's' : ''} available
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className={`${colors.badge} border-0 text-xs font-medium`}>
                        {group.options.length}
                      </Badge>
                      <ChevronDown
                        className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {/* Options List - Collapsible */}
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <CardContent className="p-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-100">
                        {group.options.map((opt, i) => (
                          <div
                            key={i}
                            className="bg-white p-4 flex items-center justify-between gap-3 group/item hover:bg-slate-50/80 transition-colors duration-150"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`h-2 w-2 rounded-full ${colors.dot} shrink-0 opacity-60 group-hover/item:opacity-100 transition-opacity`}></div>
                              <span className="text-sm font-medium text-slate-700 truncate">
                                {opt.label}
                              </span>
                            </div>
                            <code className="text-[11px] text-slate-400 font-mono bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md shrink-0 group-hover/item:bg-slate-100 group-hover/item:text-slate-500 transition-colors">
                              {opt.value}
                            </code>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Unit Presets Tab */}
      {!loading && activeTab === 'units' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(unitPresets).length === 0 ? (
            <Card className="col-span-full border-dashed border-2 border-slate-200 shadow-none">
              <CardContent className="py-16 flex flex-col items-center justify-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 mb-4">
                  <Ruler className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-lg font-medium text-slate-600">No unit presets found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Unit presets will appear here when configured.
                </p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(unitPresets).map(([key, units], index) => {
              const colors = groupColors[(index + 2) % groupColors.length];
              const unitIcon = key === 'dimension' ? <Ruler className="h-5 w-5" /> : <Weight className="h-5 w-5" />;

              return (
                <Card key={key} className={`border ${colors.border} shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300`}>
                  <div className={`p-5 bg-gradient-to-r ${colors.bg}`}>
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors.icon}`}>
                        {unitIcon}
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-slate-800 capitalize">{key}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {units.length} unit{units.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {units.map((unit, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className={`${colors.badge} border-0 px-3 py-1.5 text-sm font-medium`}
                        >
                          {unit}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
