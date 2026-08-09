'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface FloatingWhatsAppButtonProps {
  phoneNumber: string; // Including country code, e.g. "1234567890"
  message?: string;
}

export function FloatingWhatsAppButton({ phoneNumber, message = "Hi, I'm interested in crafting a bespoke piece of jewellery." }: FloatingWhatsAppButtonProps) {
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg",
        "bg-[#25D366] hover:bg-[#20bd5a] transition-all duration-300"
      )}
      aria-label="Chat on WhatsApp"
    >
      <div className="relative w-8 h-8 flex items-center justify-center">
        <Image 
          src="/whatsapp.png" 
          alt="WhatsApp" 
          fill
          sizes="32px"
          className="object-contain"
        />
      </div>
      
      {/* Pulse effect */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping -z-10" />
    </motion.a>
  );
}
