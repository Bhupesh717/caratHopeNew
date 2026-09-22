'use client';

import React, { useRef, useState, useMemo } from 'react';
import { ProductFormState } from '../../../_types';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  X, UploadCloud, Film, Image as ImageIcon, Sparkles 
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Step2MediaProps {
  form: ProductFormState;
  setForm: React.Dispatch<React.SetStateAction<ProductFormState>> | ((f: ProductFormState) => void);
}

function SortableImageCard({ id, url, index, onRemove }: { id: string; url: string; index: number; onRemove: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.6 : 1,
  };

  const isPrimary = index === 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group aspect-square rounded-2xl border-2 overflow-hidden bg-slate-50 transition-all duration-200",
        isPrimary ? "border-primary ring-2 ring-primary/20 shadow-md" : "border-slate-200 hover:border-slate-300",
        isDragging && "shadow-2xl border-primary ring-4 ring-primary/30 scale-105"
      )}
    >
      <img
        {...attributes}
        {...listeners}
        src={url}
        alt={`Product visual ${index + 1}`}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-grab active:cursor-grabbing"
      />

      {/* Primary Cover Badge */}
      {isPrimary && (
        <div className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Primary Cover
        </div>
      )}

      {/* Index Tag */}
      {!isPrimary && (
        <div className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur-sm text-white text-[10px] font-mono px-2 py-0.5 rounded-md pointer-events-none">
          #{index + 1}
        </div>
      )}

      {/* Remove Button */}
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-2 right-2 z-20 rounded-full bg-red-500 hover:bg-red-600 text-white p-1 shadow-md transition-all opacity-80 hover:opacity-100 hover:scale-110 cursor-pointer"
        title="Remove Image"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function Step2Media({ form, setForm }: Step2MediaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const images = form.images || [];
  const maxImages = 20;

  const itemsRef = useRef<{ id: string; url: string; originalImg: string | File }[]>([]);

  const items = useMemo(() => {
    const newItems = images.map((img, index) => {
      let url = '';
      if (typeof img === 'string') {
        url = img;
      } else {
        // Attach preview to file to avoid recreating it
        if (!(img as any).preview) {
          (img as any).preview = URL.createObjectURL(img);
        }
        url = (img as any).preview;
      }

      if (itemsRef.current[index]?.url === url) {
        return itemsRef.current[index];
      }
      return { id: `media-${Date.now()}-${Math.random().toString(36).slice(2)}`, url, originalImg: img };
    });

    itemsRef.current = newItems;
    return newItems;
  }, [images]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      itemsRef.current = newItems;
      setForm({ ...form, images: newItems.map((i) => i.originalImg) });
    }
  };

  const processIncomingFiles = (files: FileList | File[]) => {
    const filesArray = Array.from(files);
    if (filesArray.length === 0) return;

    let newImages: File[] = [];
    let newVideo: File | null = null;

    filesArray.forEach((file) => {
      if (file.type.startsWith('video/')) {
        if (file.size > 50 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 50MB limit.`);
          return;
        }
        newVideo = file;
        toast.success(`Video attached: ${file.name}`);
      } else if (file.type.startsWith('image/')) {
        newImages.push(file);
      } else {
        toast.error(`Unsupported file type: ${file.name}`);
      }
    });

    const updatedImages = [...images, ...newImages].slice(0, maxImages);
    if (images.length + newImages.length > maxImages) {
      toast.warning(`Maximum ${maxImages} images allowed. Additional images trimmed.`);
    }
    setForm({
      ...form,
      images: updatedImages,
      video: newVideo !== null ? newVideo : form.video,
    });
    if (newImages.length > 0) {
      toast.success(`Added ${newImages.length} image(s) to gallery.`);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processIncomingFiles(e.target.files);
      e.target.value = '';
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
      processIncomingFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setForm({
      ...form,
      images: images.filter((_, idx) => idx !== indexToRemove),
    });
  };

  const removeVideo = () => {
    setForm({ ...form, video: '' });
    toast.info('Video removed');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Counters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <Label className="text-base font-semibold text-slate-900">Upload Images & Video</Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Drag & drop images (up to 20) and a showcase video together in one single upload zone.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 border border-slate-200">
            <ImageIcon className="w-3.5 h-3.5 text-primary" /> {images.length}/{maxImages} Images
          </span>
          <span className={cn(
            "text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 border",
            form.video 
              ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
              : "bg-slate-100 text-slate-500 border-slate-200"
          )}>
            <Film className="w-3.5 h-3.5 text-emerald-600" /> {form.video ? '1 Video Added' : 'No Video'}
          </span>
        </div>
      </div>

      {/* Hidden Unified File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Single Unified Drag & Drop Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all duration-300 min-h-[160px] text-center",
          dragActive
            ? "border-primary bg-primary/10 scale-[0.99] ring-4 ring-primary/20"
            : "border-slate-200 hover:border-primary/60 hover:bg-slate-50/80 bg-slate-50/40"
        )}
      >
        <div className="flex flex-col items-center space-y-3">
          <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200/80 text-primary">
            <UploadCloud className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Click to browse or drag & drop images and video
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports JPG, PNG, WEBP (up to 20 images) and MP4, WEBM (up to 50MB video)
            </p>
          </div>
        </div>
      </div>

      {/* ── Media Showcase Gallery ── */}
      {(images.length > 0 || form.video) && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-slate-900">Uploaded Media Preview</Label>
            <span className="text-xs text-slate-400">Drag images to reorder (1st image is Primary Cover)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {/* Sortable Images */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
                {items.map((item, index) => (
                  <SortableImageCard
                    key={item.id}
                    id={item.id}
                    url={item.url}
                    index={index}
                    onRemove={() => removeImage(index)}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {/* Video Card (If uploaded) */}
            {form.video && (
              <div className="relative group aspect-square rounded-2xl border-2 border-emerald-500/50 overflow-hidden bg-black shadow-md flex flex-col justify-between">
                <video
                  src={typeof form.video === 'string' ? form.video : (form.video as any).preview || ((form.video as any).preview = URL.createObjectURL(form.video as Blob))}
                  controls
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-2 left-2 z-10 bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                  <Film className="w-3 h-3" /> Video
                </div>
                <button
                  type="button"
                  onClick={removeVideo}
                  className="absolute top-2 right-2 z-20 rounded-full bg-red-500 hover:bg-red-600 text-white p-1 shadow-md transition-all opacity-80 hover:opacity-100 hover:scale-110 cursor-pointer"
                  title="Remove Video"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
