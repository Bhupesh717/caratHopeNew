'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, CircleDot, FileText, CheckCircle2, Hammer, Droplets, Sparkles, Send, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BespokeStatus } from '@/types/bespoke';

// Order of statuses and their corresponding icons
const statusFlow: { status: BespokeStatus, icon: React.ElementType, description: string }[] = [
  { status: 'Pending', icon: Clock, description: 'Request received' },
  { status: 'Reviewing', icon: FileText, description: 'Designer is reviewing your request' },
  { status: 'Quoted', icon: CircleDot, description: 'Quotation sent for approval' },
  { status: 'Approved', icon: CheckCircle2, description: 'Quotation approved' },
  { status: 'CAD Design', icon: CircleDot, description: 'Creating 3D CAD models' },
  { status: 'In Production', icon: Hammer, description: 'Crafting your piece' },
  { status: 'Stone Setting', icon: Sparkles, description: 'Setting the gemstones' },
  { status: 'Polishing', icon: Droplets, description: 'Final polishing' },
  { status: 'Quality Check', icon: Check, description: 'Ensuring perfection' },
  { status: 'Shipped', icon: Send, description: 'On its way to you' },
  { status: 'Delivered', icon: Gift, description: 'Delivered' },
];

interface TimelineTrackerProps {
  currentStatus: BespokeStatus;
}

export function TimelineTracker({ currentStatus }: TimelineTrackerProps) {
  const currentIndex = statusFlow.findIndex(s => s.status === currentStatus);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="w-full py-8">
      <div className="relative">
        {/* Continuous Background Line */}
        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2 z-0" />
        
        {/* Animated Active Line */}
        <motion.div
          className="absolute left-6 md:left-1/2 top-0 w-0.5 bg-bespoke-gold -translate-x-1/2 z-0"
          initial={{ height: '0%' }}
          animate={{ height: `${(activeIndex / (statusFlow.length - 1)) * 100}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />

        <div className="flex flex-col gap-8 md:gap-12">
          {statusFlow.map((step, index) => {
            const isCompleted = activeIndex > index;
            const isActive = activeIndex === index;
            const isUpcoming = activeIndex < index;
            
            const Icon = step.icon;

            return (
              <div key={step.status} className="relative z-10 flex items-center md:justify-center w-full group">
                
                {/* Desktop Left Side Text */}
                <div className={cn(
                  "hidden md:block w-1/2 pr-12 text-right transition-opacity duration-300",
                  isUpcoming ? "opacity-40" : "opacity-100"
                )}>
                  <h4 className={cn(
                    "text-lg font-medium",
                    isActive ? "text-bespoke-gold-dark" : "text-foreground"
                  )}>
                    {step.status}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                </div>

                {/* Node Icon */}
                <motion.div
                  className={cn(
                    "w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0 ml-0 md:ml-0 md:absolute md:left-1/2 md:-translate-x-1/2 transition-colors duration-500",
                    isCompleted ? "bg-bespoke-gold border-bespoke-gold text-white" :
                    isActive ? "bg-background border-bespoke-gold text-bespoke-gold ring-4 ring-bespoke-gold/20" :
                    "bg-background border-border text-muted-foreground"
                  )}
                  whileHover={{ scale: 1.1 }}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>

                {/* Mobile / Desktop Right Side Text */}
                <div className={cn(
                  "w-[calc(100%-3rem)] pl-6 md:w-1/2 md:pl-12 md:text-left transition-opacity duration-300",
                  isUpcoming ? "opacity-40" : "opacity-100"
                )}>
                  <h4 className={cn(
                    "text-lg font-medium md:hidden",
                    isActive ? "text-bespoke-gold-dark" : "text-foreground"
                  )}>
                    {step.status}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1 md:hidden">{step.description}</p>
                  
                  {/* Optional: Add timestamps here if data is provided */}
                  {isCompleted && (
                    <span className="text-xs text-muted-foreground hidden md:inline-block mt-2">
                      Completed
                    </span>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
