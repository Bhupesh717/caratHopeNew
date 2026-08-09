'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CADGalleryProps {
  images: string[];
}

export function CADGallery({ images }: CADGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!images || images.length === 0) {
    return (
      <div className="w-full p-8 border border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-accent/5">
        <p>CAD previews are not available yet.</p>
        <p className="text-sm mt-1">You will be notified once they are uploaded.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((img, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02 }}
            className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer border border-border/50 shadow-sm"
            onClick={() => setSelectedImage(img)}
          >
            <Image
              src={img}
              alt={`CAD Design ${index + 1}`}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white gap-2">
              <Maximize2 className="w-6 h-6" />
              <span className="text-sm font-medium">View Full Screen</span>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-6 right-6 text-white hover:bg-white/20 rounded-full h-12 w-12"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-6 h-6" />
            </Button>
            
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
              <Button 
                className="bg-bespoke-gold text-white hover:bg-bespoke-gold-dark"
                onClick={(e) => {
                  e.stopPropagation();
                  // Simulate download or open in new tab
                  window.open(selectedImage, '_blank');
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Original
              </Button>
            </div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl aspect-video md:aspect-[16/10] rounded-xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedImage}
                alt="CAD Design Fullscreen"
                fill
                className="object-contain"
                quality={100}
                priority
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
