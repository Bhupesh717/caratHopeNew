'use client';

import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { X, UploadCloud } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface MultiImageUploadProps {
  values: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  maxImages?: number;
  dimensions?: string;
  className?: string;
}

export function MultiImageUpload({
  values = [],
  onChange,
  label = 'Product Gallery',
  maxImages = 5,
  dimensions = '800x800px',
  className
}: MultiImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = (files: FileList) => {
    const currentCount = values.length;
    const incomingCount = files.length;

    if (currentCount + incomingCount > maxImages) {
      toast.error(`You can only upload up to ${maxImages} images in the gallery.`);
      return;
    }

    const newImages: string[] = [];
    let processed = 0;
    const filesArray = Array.from(files);

    if (filesArray.length === 0) return;

    filesArray.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file.`);
        processed++;
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newImages.push(e.target.result as string);
        }
        processed++;
        if (processed === filesArray.length) {
          onChange([...values, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
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
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = (indexToRemove: number) => {
    onChange(values.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">{label}</Label>
        <span className="text-xs text-muted-foreground">
          {values.length} / {maxImages} images
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleChange}
        className="hidden"
        disabled={values.length >= maxImages}
      />

      {/* Grid of uploaded images */}
      {values.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-2">
          {values.map((url, index) => (
            <div key={index} className="relative group aspect-square rounded-lg border overflow-hidden bg-muted/20">
              <img
                src={url}
                alt={`Gallery image ${index + 1}`}
                className="h-full w-full object-cover shadow-sm transition-transform duration-200 group-hover:scale-[1.03]"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-white shadow-md hover:bg-destructive/90 transition-colors cursor-pointer opacity-90 hover:opacity-100"
                title="Remove Image"
              >
                <X className="h-3 w-3" />
              </button>
              <div className="absolute left-1 bottom-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                #{index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Drag and Drop box (only visible if below maxImages) */}
      {values.length < maxImages && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
          className={cn(
            "flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-5 cursor-pointer transition-all duration-200 min-h-[110px]",
            dragActive 
              ? "border-primary bg-primary/5 scale-[0.99]" 
              : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/10 bg-muted/5"
          )}
        >
          <div className="flex items-center gap-3 text-left">
            <div className="p-2.5 bg-background rounded-full shadow-xs border border-muted-foreground/10 text-muted-foreground">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium">Click or drag images to add to gallery</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Upload up to {maxImages - values.length} more {dimensions ? `(${dimensions})` : ''}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
