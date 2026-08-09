'use client';

import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface UploadDropzoneProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
}

export function UploadDropzone({ onFilesChange, maxFiles = 5 }: UploadDropzoneProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (newFiles: FileList | File[]) => {
    const validFiles = Array.from(newFiles).filter(file => file.type.startsWith('image/'));
    const combinedFiles = [...files, ...validFiles].slice(0, maxFiles);
    
    setFiles(combinedFiles);
    onFilesChange(combinedFiles);

    // Create object URLs for previews
    const newPreviewUrls = combinedFiles.map(file => URL.createObjectURL(file));
    
    // Revoke old URLs to prevent memory leaks
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls(newPreviewUrls);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = [...files];
    const updatedPreviews = [...previewUrls];
    
    updatedFiles.splice(index, 1);
    const removedUrl = updatedPreviews.splice(index, 1)[0];
    URL.revokeObjectURL(removedUrl);
    
    setFiles(updatedFiles);
    setPreviewUrls(updatedPreviews);
    onFilesChange(updatedFiles);
  };

  return (
    <div className="w-full">
      <div
        className={cn(
          "relative w-full rounded-xl border-2 border-dashed p-10 flex flex-col items-center justify-center transition-all duration-300 group cursor-pointer",
          isDragging 
            ? "border-bespoke-gold bg-bespoke-gold/5" 
            : "border-border hover:border-bespoke-gold/50 hover:bg-accent/5"
        )}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={onFileChange} 
          className="hidden" 
          multiple 
          accept="image/*"
        />
        
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4 text-muted-foreground group-hover:text-bespoke-gold transition-colors duration-300">
          <UploadCloud className="w-8 h-8" />
        </div>
        
        <h3 className="text-lg font-medium text-foreground mb-1">Upload Inspiration Images</h3>
        <p className="text-sm text-muted-foreground mb-4 text-center">
          Drag and drop your images here, or click to browse.
        </p>
        <p className="text-xs text-muted-foreground/70">
          Supported formats: JPEG, PNG, WEBP (Max {maxFiles} files)
        </p>
      </div>

      <AnimatePresence>
        {previewUrls.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {previewUrls.map((url, index) => (
              <motion.div 
                key={url}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative aspect-square rounded-lg overflow-hidden border border-border group"
              >
                <Image 
                  src={url} 
                  alt={`Upload preview ${index + 1}`} 
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="p-2 bg-destructive/80 text-destructive-foreground rounded-full hover:bg-destructive transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
