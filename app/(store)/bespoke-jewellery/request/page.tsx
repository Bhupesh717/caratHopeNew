'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

import { LuxuryStepper } from '@/components/bespoke/LuxuryStepper';
import { UploadDropzone } from '@/components/bespoke/UploadDropzone';
import { JewelleryTypeSelector } from '@/components/bespoke/JewelleryTypeSelector';
import { bespokeService } from '@/lib/api/bespoke';
import { BespokeOrderRequestPayload } from '@/types/bespoke';

const steps = ['Details', 'Jewellery', 'Design', 'Images', 'Review'];

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
  country: z.string().optional(),

  jewelleryType: z.string().min(1, "Please select a jewellery type"),
  metalType: z.string().min(1, "Please select a metal type"),
  metalSubType: z.string().optional(),
  goldPurity: z.string().optional(),
  gemstoneSelection: z.string().optional(),
  ringSize: z.string().optional(),
  occasion: z.string().optional(),
  deadline: z.string().optional(),

  description: z.string().min(10, "Please provide a detailed description (min 10 chars)"),
  inspirationText: z.string().optional(),
  engravingText: z.string().optional(),
  additionalNotes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function BespokeRequestPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string>('');

  const {
    register,
    handleSubmit,
    control,
    trigger,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: {
      jewelleryType: '',
      metalType: '',
      metalSubType: '',
    }
  });

  const formData = watch();

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];

    if (currentStep === 0) fieldsToValidate = ['name', 'email', 'phone'];
    if (currentStep === 1) fieldsToValidate = ['jewelleryType', 'metalType'];
    if (currentStep === 2) fieldsToValidate = ['description'];

    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const payload: BespokeOrderRequestPayload = {
        ...data,
        inspirationImages: images,
      };

      const response = await bespokeService.submitCustomOrder(payload);
      setOrderId(response.data.id);
      setIsSuccess(true);
    } catch (error) {
      console.error("Submission failed", error);
      // Handle error (e.g., toast notification)
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-card p-10 rounded-3xl border border-border text-center shadow-xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-bespoke-gold/5" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-bespoke-gold/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-bespoke-gold-dark" />
            </div>
            <h2 className="text-3xl font-serif mb-2">Request Received</h2>
            <p className="text-muted-foreground mb-6">
              Thank you for trusting us with your vision. Your request has been successfully submitted.
            </p>
            <div className="bg-background w-full py-4 rounded-xl border border-border mb-8">
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Order Reference</p>
              <p className="text-xl font-mono font-medium">{orderId}</p>
            </div>
            <Link href={`/account/bespoke-orders/${orderId}`} className="w-full">
              <Button className="w-full bg-bespoke-gold text-white hover:bg-bespoke-gold-dark h-12">
                Track My Request
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif mb-3">Craft Your Bespoke Piece</h1>
          <p className="text-muted-foreground">Let us guide you through the process of bringing your vision to life.</p>
        </div>

        <LuxuryStepper steps={steps} currentStep={currentStep} />

        <div className="bg-card border border-border rounded-3xl p-6 md:p-10 shadow-sm relative overflow-hidden">
          {/* Decorative subtle background */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-bespoke-gold/5 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none" />

          <form onSubmit={handleSubmit(onSubmit)} className="relative z-10">
            <AnimatePresence mode="wait">

              {/* STEP 1: Details */}
              {currentStep === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-2xl font-serif border-b border-border pb-4 mb-6">Personal Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input id="name" {...register('name')} className={errors.name ? 'border-destructive' : ''} />
                      {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input id="email" type="email" {...register('email')} className={errors.email ? 'border-destructive' : ''} />
                      {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-2 md:col-span-1">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input id="phone" type="tel" {...register('phone')} className={errors.phone ? 'border-destructive' : ''} />
                      {errors.phone && <p className="text-destructive text-sm">{errors.phone.message}</p>}
                    </div>
                    <div className="space-y-2 md:col-span-1">
                      <Label htmlFor="country">Country</Label>
                      <Controller
                        name="country"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value ?? ''}>
                            <SelectTrigger id="country">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent className="max-h-52 overflow-y-auto">
                              <SelectItem value="India">India</SelectItem>
                              <SelectItem value="United States">United States</SelectItem>
                              <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                              <SelectItem value="United Arab Emirates">United Arab Emirates</SelectItem>
                              <SelectItem value="Canada">Canada</SelectItem>
                              <SelectItem value="Australia">Australia</SelectItem>
                              <SelectItem value="Singapore">Singapore</SelectItem>
                              <SelectItem value="Malaysia">Malaysia</SelectItem>
                              <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                              <SelectItem value="Qatar">Qatar</SelectItem>
                              <SelectItem value="Kuwait">Kuwait</SelectItem>
                              <SelectItem value="Bahrain">Bahrain</SelectItem>
                              <SelectItem value="Oman">Oman</SelectItem>
                              <SelectItem value="Germany">Germany</SelectItem>
                              <SelectItem value="France">France</SelectItem>
                              <SelectItem value="Italy">Italy</SelectItem>
                              <SelectItem value="Netherlands">Netherlands</SelectItem>
                              <SelectItem value="Switzerland">Switzerland</SelectItem>
                              <SelectItem value="New Zealand">New Zealand</SelectItem>
                              <SelectItem value="South Africa">South Africa</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Jewellery */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <h3 className="text-2xl font-serif border-b border-border pb-4 mb-6">Jewellery Preferences</h3>

                  <div className="space-y-4">
                    <Label className="text-base">What are we creating? *</Label>
                    <Controller
                      name="jewelleryType"
                      control={control}
                      render={({ field }) => (
                        <JewelleryTypeSelector value={field.value} onChange={field.onChange} />
                      )}
                    />
                    {errors.jewelleryType && <p className="text-destructive text-sm">{errors.jewelleryType.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    {/* Metal Type — parent category */}
                    <div className="space-y-2">
                      <Label>Metal Type *</Label>
                      <Controller
                        name="metalType"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={(val) => {
                              field.onChange(val);
                              // reset sub-type when parent changes
                            }}
                            value={field.value}
                          >
                            <SelectTrigger className={errors.metalType ? 'border-destructive' : ''}>
                              <SelectValue placeholder="Select metal" />
                            </SelectTrigger>
                            <SelectContent>

                              <SelectItem value="Gold">Gold</SelectItem>
                              <SelectItem value="Silver">Silver</SelectItem>
                              <SelectItem value="Platinum">Platinum</SelectItem>
                              <SelectItem value="Two-Tone">Two-Tone</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.metalType && <p className="text-destructive text-sm">{errors.metalType.message}</p>}
                    </div>

                    {/* Metal Sub-Type — depends on parent */}
                    {formData.metalType && (
                      <div className="space-y-2">
                        <Label>
                          {formData.metalType === 'Gold' && 'Gold Colour'}
                          {formData.metalType === 'Silver' && 'Silver Grade'}
                          {formData.metalType === 'Platinum' && 'Platinum Purity'}
                          {formData.metalType === 'Two-Tone' && 'Combination'}
                        </Label>
                        <Controller
                          name="metalSubType"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value ?? ''}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select variant" />
                              </SelectTrigger>
                              <SelectContent>
                                {formData.metalType === 'Gold' && (
                                  <>
                                    <SelectItem value="Yellow Gold">Yellow Gold</SelectItem>
                                    <SelectItem value="Rose Gold">Rose Gold</SelectItem>
                                    <SelectItem value="White Gold">White Gold</SelectItem>
                                    <SelectItem value="Green Gold">Green Gold</SelectItem>
                                  </>
                                )}
                                {formData.metalType === 'Silver' && (
                                  <>
                                    <SelectItem value="Sterling Silver (925)">Sterling Silver (925)</SelectItem>
                                    <SelectItem value="Fine Silver (999)">Fine Silver (999)</SelectItem>
                                    <SelectItem value="Argentium Silver">Argentium Silver</SelectItem>
                                  </>
                                )}
                                {formData.metalType === 'Platinum' && (
                                  <>
                                    <SelectItem value="950 Platinum">950 Platinum</SelectItem>
                                    <SelectItem value="900 Platinum">900 Platinum</SelectItem>
                                    <SelectItem value="850 Platinum">850 Platinum</SelectItem>
                                  </>
                                )}
                                {formData.metalType === 'Two-Tone' && (
                                  <>
                                    <SelectItem value="Yellow Gold + White Gold">Yellow Gold + White Gold</SelectItem>
                                    <SelectItem value="Yellow Gold + Platinum">Yellow Gold + Platinum</SelectItem>
                                    <SelectItem value="Rose Gold + White Gold">Rose Gold + White Gold</SelectItem>
                                    <SelectItem value="Gold + Silver">Gold + Silver</SelectItem>
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Primary Gemstone</Label>
                      <Input {...register('gemstoneSelection')} placeholder="e.g. Diamond, Sapphire, None" />
                    </div>

                    {formData.jewelleryType === 'ring' && (
                      <div className="space-y-2">
                        <Label>Ring Size (if known)</Label>
                        <Input {...register('ringSize')} placeholder="e.g. US 6, UK L" />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Design */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-2xl font-serif border-b border-border pb-4 mb-6">Design Requirements</h3>

                  <div className="space-y-2">
                    <Label htmlFor="description">Describe your dream piece *</Label>
                    <Textarea
                      id="description"
                      rows={5}
                      placeholder="Tell us about the design, style (e.g. vintage, minimalist, art deco), and any specific elements you want..."
                      {...register('description')}
                      className={errors.description ? 'border-destructive resize-none' : 'resize-none'}
                    />
                    {errors.description && <p className="text-destructive text-sm">{errors.description.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="occasion">Occasion</Label>
                      <Input id="occasion" {...register('occasion')} placeholder="e.g. Engagement, Anniversary" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deadline">Target Date</Label>
                      <Input id="deadline" type="date" {...register('deadline')} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="engravingText">Engraving Text (Optional)</Label>
                      <Input id="engravingText" {...register('engravingText')} placeholder="Enter text to be engraved" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: Images */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-2xl font-serif border-b border-border pb-4 mb-6">Inspiration</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload any sketches, photos, or references that capture the style you are looking for.
                  </p>

                  <UploadDropzone onFilesChange={setImages} maxFiles={5} />

                  <div className="space-y-2 mt-6">
                    <Label htmlFor="inspirationText">Additional Context for Images</Label>
                    <Textarea
                      id="inspirationText"
                      rows={3}
                      placeholder="e.g. 'I love the setting from image 1, but the band from image 2'"
                      {...register('inspirationText')}
                      className="resize-none"
                    />
                  </div>
                </motion.div>
              )}

              {/* STEP 5: Review */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-2xl font-serif border-b border-border pb-4 mb-6">Review & Submit</h3>

                  <div className="bg-accent/10 rounded-xl p-6 space-y-6 border border-border">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground block mb-1">Name</span>
                        <span className="font-medium">{formData.name}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block mb-1">Contact</span>
                        <span className="font-medium">{formData.email} <br /> {formData.phone}{formData.country ? ` · ${formData.country}` : ''}</span>
                      </div>
                      <div className="col-span-2 border-t border-border pt-4 mt-2">
                        <span className="text-muted-foreground block mb-1">Jewellery Specification</span>
                        <span className="font-medium capitalize">{formData.jewelleryType} — {formData.metalType}{formData.metalSubType ? ` (${formData.metalSubType})` : ''}</span>
                      </div>
                      <div className="col-span-2 border-t border-border pt-4 mt-2">
                        <span className="text-muted-foreground block mb-1">Description</span>
                        <p className="font-medium leading-relaxed">{formData.description}</p>
                      </div>
                      <div className="col-span-2 border-t border-border pt-4 mt-2">
                        <span className="text-muted-foreground block mb-1">Images Attached</span>
                        <span className="font-medium">{images.length} file(s)</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground text-center">
                    By submitting this request, you agree to our terms and conditions for bespoke creations.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Actions */}
            <div className="flex justify-between mt-10 pt-6 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0 || isSubmitting}
                className={currentStep === 0 ? 'invisible' : ''}
              >
                <ChevronLeft className="w-4 h-4 mr-2" /> Back
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-bespoke-gold text-white hover:bg-bespoke-gold-dark"
                >
                  Next Step <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-bespoke-gold text-white hover:bg-bespoke-gold-dark min-w-[140px]"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>Submit Request <CheckCircle2 className="w-4 h-4 ml-2" /></>
                  )}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
