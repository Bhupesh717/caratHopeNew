'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface DetailField {
  label: string;
  value: React.ReactNode;
}

interface DetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  fields: DetailField[];
}

export function DetailModal({ open, onOpenChange, title, fields }: DetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-3 pr-4">
            {fields.map((f, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-4">
                  <span className="min-w-[130px] text-sm font-medium text-muted-foreground">{f.label}</span>
                  <span className="text-sm flex-1">{f.value}</span>
                </div>
                {i < fields.length - 1 && <Separator />}
              </React.Fragment>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
