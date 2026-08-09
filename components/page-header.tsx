'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import Image from 'next/image';

export interface PageHeaderProps {
  title: string;
  accentTitle?: string;
  subtitle?: string;
  eyebrow?: string;
  icon?: LucideIcon;
  imageSrc: string;
}

export function PageHeader({
  title,
  accentTitle,
  subtitle,
  eyebrow,
  icon: Icon,
  imageSrc,
}: PageHeaderProps) {
  return (
    <section className="relative flex w-full aspect-[3/1] md:aspect-[5/1] lg:aspect-[6/1] items-center justify-center min-h-[250px] text-center px-6 py-14 overflow-hidden bg-slate-900">
      {/* Background Pattern Effects (Optional radial glow for depth) */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-[radial-gradient(ellipse_60%_50%_at_80%_20%,rgba(185,122,87,0.15)_0%,transparent_60%),radial-gradient(ellipse_40%_60%_at_10%_80%,rgba(220,166,138,0.1)_0%,transparent_55%)]" />

      {/* Image Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-cover filter brightness-[0.65] contrast-110"
        />
        {/* Overlay matching the original SCSS linear gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900/20 to-slate-900/70" />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.165, 0.84, 0.44, 1] }}
        className="relative z-20 max-w-3xl mx-auto flex flex-col items-center"
      >
        {/* Eyebrow */}
        {eyebrow && (
          <div className="inline-flex items-center gap-2.5 text-[11px] font-semibold tracking-[0.15em] uppercase text-white mb-6 bg-white/10 backdrop-blur-md px-5 py-1.5 rounded-full border border-white/20">
            {Icon && <Icon className="w-3.5 h-3.5 text-primary" />}
            {eyebrow}
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white leading-tight mb-5 tracking-tight">
          {title} {accentTitle && <span className="italic text-primary font-medium">{accentTitle}</span>}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-sm md:text-base text-white/80 leading-relaxed max-w-2xl font-light">
            {subtitle}
          </p>
        )}
      </motion.div>
    </section>
  );
}
