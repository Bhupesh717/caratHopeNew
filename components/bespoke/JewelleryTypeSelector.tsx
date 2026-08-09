'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Check } from 'lucide-react';

interface TypeOption {
  id: string;
  label: string;
  icon?: string;
  description?: string;
  image?: string;
}

const defaultTypes: TypeOption[] = [
  {
    id: 'ring',
    label: 'Ring',
    description: 'Engagement, Wedding, or Statement rings',
    image: '/images/bespoke/ring.png'
  },
  {
    id: 'necklace',
    label: 'Necklace',
    description: 'Pendants, Chains, or Chokers',
    image: '/images/bespoke/necklace.png'
  },
  {
    id: 'earrings',
    label: 'Earrings',
    description: 'Studs, Hoops, or Drops',
    image: '/images/bespoke/earrings.png'
  },
  {
    id: 'bracelet',
    label: 'Bracelet',
    description: 'Bangles, Chains, or Cuffs',
    image: '/images/bespoke/bracelet.png'
  },
  {
    id: 'other',
    label: 'Other',
    description: 'Brooches, Cufflinks, or unique pieces',
    image: '/images/bespoke/other.png'
  },
];

interface JewelleryTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options?: TypeOption[];
}

export function JewelleryTypeSelector({ value, onChange, options = defaultTypes }: JewelleryTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {options.map((option) => {
        const isSelected = value === option.id;
        const imageUrl = option.image || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&auto=format&fit=crop&q=80';

        return (
          <motion.div
            key={option.id}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(option.id)}
            className={cn(
              "group relative h-56 overflow-hidden cursor-pointer rounded-2xl border p-6 flex flex-col justify-end transition-all duration-500 select-none",
              isSelected
                ? "border-bespoke-gold shadow-[0_12px_24px_rgba(185,122,87,0.25)] ring-2 ring-bespoke-gold/50"
                : "border-slate-100 hover:border-bespoke-gold/40 shadow-sm hover:shadow-md"
            )}
          >
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <Image
                src={imageUrl}
                alt={option.label}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              {/* Dark Luxury Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
            </div>

            {/* Selection Checkmark Icon */}
            <div className={cn(
              "absolute top-4 right-4 z-20 flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-300",
              isSelected
                ? "bg-bespoke-gold border-bespoke-gold text-white scale-100 opacity-100 rotate-0"
                : "border-white/30 text-transparent scale-75 opacity-0 -rotate-45 group-hover:opacity-100 group-hover:scale-100 group-hover:border-white/50"
            )}>
              <Check className="h-4.5 w-4.5 stroke-[3px]" />
            </div>

            {/* Content Area */}
            <div className="relative z-10 space-y-1 transform transition-transform duration-500 group-hover:translate-y-[-2px]">
              {/* Elegant monogram character */}


              <h3 className="text-xl font-serif font-medium text-white tracking-wide">
                {option.label}
              </h3>

              {option.description && (
                <p className="text-xs text-white/70 leading-relaxed font-light line-clamp-2">
                  {option.description}
                </p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
