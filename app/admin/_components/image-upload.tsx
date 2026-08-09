'use client';

import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { X, UploadCloud } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
  dimensions?: string; // e.g. "1500x600px"
}

export function ImageUpload({ value, onChange, label = 'Upload Image', className, dimensions }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onChange(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Label className="text-sm font-semibold">{label}</Label>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />

      {!value ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
          className={cn(
            "flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer transition-all duration-200 min-h-[140px]",
            dragActive 
              ? "border-primary bg-primary/5 scale-[0.99]" 
              : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/10 bg-muted/5"
          )}
        >
          <div className="flex flex-col items-center space-y-2 text-center">
            <div className="p-3 bg-background rounded-full shadow-xs border border-muted-foreground/10 text-muted-foreground">
              <UploadCloud className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium">Click to upload or drag & drop</p>
              <p className="text-xs text-muted-foreground mt-1">
                SVG, PNG, JPG or GIF{dimensions ? ` (Recommended: ${dimensions})` : ''}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative mt-2 inline-block group">
          <img
            src={value}
            alt="Uploaded Preview"
            className="h-32 w-56 rounded-lg border object-cover shadow-sm transition-transform duration-200 group-hover:scale-[1.01]"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -right-2.5 -top-2.5 rounded-full bg-destructive p-1.5 text-white shadow-md hover:bg-destructive/90 transition-colors cursor-pointer"
            title="Remove Image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
