import React from 'react';
import { cn } from '@/lib/utils';
import { BespokeStatus } from '@/types/bespoke';
import { Clock, FileText, CheckCircle2, Hammer, Droplets, Sparkles, Send, Gift, CircleDot } from 'lucide-react';

interface BespokeStatusBadgeProps {
  status: BespokeStatus;
  className?: string;
}

const statusConfig: Record<BespokeStatus, { color: string; bg: string; icon: React.ElementType }> = {
  'Pending': { color: 'text-amber-600', bg: 'bg-amber-500/10 border-amber-200', icon: Clock },
  'Reviewing': { color: 'text-blue-600', bg: 'bg-blue-500/10 border-blue-200', icon: FileText },
  'Quoted': { color: 'text-indigo-600', bg: 'bg-indigo-500/10 border-indigo-200', icon: CircleDot },
  'Approved': { color: 'text-emerald-600', bg: 'bg-emerald-500/10 border-emerald-200', icon: CheckCircle2 },
  'CAD Design': { color: 'text-purple-600', bg: 'bg-purple-500/10 border-purple-200', icon: CircleDot },
  'In Production': { color: 'text-orange-600', bg: 'bg-orange-500/10 border-orange-200', icon: Hammer },
  'Stone Setting': { color: 'text-pink-600', bg: 'bg-pink-500/10 border-pink-200', icon: Sparkles },
  'Polishing': { color: 'text-cyan-600', bg: 'bg-cyan-500/10 border-cyan-200', icon: Droplets },
  'Quality Check': { color: 'text-teal-600', bg: 'bg-teal-500/10 border-teal-200', icon: CheckCircle2 },
  'Shipped': { color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-200', icon: Send },
  'Delivered': { color: 'text-green-600', bg: 'bg-green-500/10 border-green-200', icon: Gift },
};

export function BespokeStatusBadge({ status, className }: BespokeStatusBadgeProps) {
  const config = statusConfig[status];
  
  if (!config) return <span className={className}>{status}</span>;
  
  const Icon = config.icon;

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
      config.bg,
      config.color,
      className
    )}>
      <Icon className="w-3.5 h-3.5" />
      {status}
    </span>
  );
}
