'use client';

import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function CtaAppointment() {
  return (
    <section className="relative w-full overflow-hidden bg-[#f9f5ef]">

      {/* Top thin gold rule */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-[#c9a96e] to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:py-28 flex flex-col lg:flex-row items-center justify-between gap-12">

        {/* Left — text block */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex-1 text-left max-w-xl"
        >
          {/* Eyebrow */}
          <p className="text-[10px] tracking-[0.3em] uppercase font-semibold text-[#c9a96e] mb-4">
            Private Consultation
          </p>

          <h2 className="font-serif text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.1] text-emerald-dark mb-6">
            Discover Jewelry<br />
            <span className="italic font-light">Made for You</span>
          </h2>

          <div className="h-px w-16 bg-[#c9a96e]/60 mb-6" />

          <p className="text-slate-500 text-sm leading-relaxed tracking-wide max-w-sm">
            Step into our studio for an exclusive, one-on-one session with our master jewelers.
            Whether choosing from our collections or crafting something entirely bespoke — your vision, perfected.
          </p>
        </motion.div>

        {/* Right — decorative card + CTA */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="flex-shrink-0 flex flex-col items-center lg:items-end gap-6"
        >
          {/* Decorative pill badges */}
          <div className="flex flex-wrap justify-center lg:justify-end gap-2 text-[10px] tracking-[0.15em] uppercase">
            {['Personalized', 'Complimentary', 'In-Studio'].map((tag) => (
              <span
                key={tag}
                className="border border-emerald-dark text-emerald-dark px-3 py-1"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* CTA Button */}
          <Link
            href="/book-appointment"
            className="group inline-flex items-center gap-3 bg-emerald-dark text-white px-8 py-4 text-xs tracking-[0.2em] uppercase font-semibold hover:bg-[#c9a96e] transition-colors duration-500"
          >
            <Calendar className="w-4 h-4 shrink-0" />
            Book an Appointment
            <ArrowRight className="w-4 h-4 shrink-0 -translate-x-1 group-hover:translate-x-0 transition-transform duration-300" />
          </Link>

          <p className="text-[10px] text-slate-400 tracking-widest uppercase">
            No charge · Any occasion
          </p>
        </motion.div>

      </div>

      {/* Bottom thin gold rule */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-[#c9a96e] to-transparent" />

    </section>
  );
}
