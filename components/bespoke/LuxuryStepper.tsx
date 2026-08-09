'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export function LuxuryStepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="w-full py-6 mb-8">
      <div className="flex items-center justify-between relative">
        {/* Background Line */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-[2px] bg-border z-0" />
        
        {/* Active Line (Animated) */}
        <motion.div
          className="absolute left-0 top-1/2 transform -translate-y-1/2 h-[2px] bg-bespoke-gold z-0"
          initial={{ width: '0%' }}
          animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />

        {steps.map((step, index) => {
          const isCompleted = currentStep > index;
          const isActive = currentStep === index;

          return (
            <div key={step} className="relative z-10 flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isCompleted || isActive ? 'var(--bespoke-gold)' : 'var(--background)',
                  borderColor: isCompleted || isActive ? 'var(--bespoke-gold)' : 'var(--border)',
                  color: isCompleted || isActive ? 'var(--bespoke-white)' : 'var(--muted-foreground)'
                }}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 bg-background transition-colors duration-300",
                  isActive ? "ring-4 ring-bespoke-gold/20" : ""
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 text-bespoke-black" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </motion.div>
              
              <div className="absolute top-12 whitespace-nowrap text-center">
                <span className={cn(
                  "text-xs font-medium uppercase tracking-wider transition-colors duration-300",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
