'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Save, Upload, User, IndianRupee, MessageSquareText } from 'lucide-react';

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { BespokeStatusBadge } from '@/components/bespoke/BespokeStatusBadge';
import { UploadDropzone } from '@/components/bespoke/UploadDropzone';
import { CADGallery } from '@/components/bespoke/CADGallery';
import { bespokeService } from '@/lib/api/bespoke';
import { BespokeOrder, BespokeStatus } from '@/types/bespoke';

export default function AdminOrderManagementPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<BespokeOrder | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [status, setStatus] = useState<BespokeStatus>('Pending');
  const [quoteAmount, setQuoteAmount] = useState<string>('');
  const [quoteNotes, setQuoteNotes] = useState<string>('');
  const [internalNotes, setInternalNotes] = useState<string>('');

  const [cadFiles, setCadFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await bespokeService.getOrderDetails(orderId);
        const data = response.data;
        setOrder(data);
        setStatus(data.status);
        if (data.quoteAmount) setQuoteAmount(data.quoteAmount.toString());
        if (data.quoteNotes) setQuoteNotes(data.quoteNotes);
        if (data.productionNotes) setInternalNotes(data.productionNotes.join('\n'));
      } catch (error) {
        console.error("Failed to fetch order", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleSaveStatus = async () => {
    setIsSaving(true);
    try {
      await bespokeService.updateOrderStatus(orderId, status);
      // In a real app, you would show a success toast here
      alert('Status updated successfully');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendQuote = async () => {
    if (!quoteAmount) return;
    setIsSaving(true);
    try {
      await bespokeService.addQuote(orderId, {
        amount: parseFloat(quoteAmount),
        notes: quoteNotes
      });
      // Update local state to reflect quotation sent
      setStatus('Quoted');
      alert('Quote sent to customer successfully');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadCAD = async () => {
    if (cadFiles.length === 0) return;
    setIsSaving(true);
    try {
      // Simulate uploading CAD files
      // await uploadService(cadFiles);
      alert('CAD files uploaded successfully and customer notified');
      setCadFiles([]);
      if(order) {
        setOrder({
           ...order,
           cadImages: [...(order.cadImages || []), ...cadFiles.map(f => URL.createObjectURL(f))]
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-20 flex justify-center">
        <div className="animate-pulse w-8 h-8 rounded-full border-4 border-bespoke-gold border-t-transparent" />
      </div>
    );
  }

  if (!order) return <div className="p-10 text-center">Order not found</div>;

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link href="/admin/bespoke-orders" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
          </Link>
          <div className="flex items-center gap-4 mt-2">
            <h1 className="text-3xl font-serif text-foreground">Order {order.id}</h1>
            <BespokeStatusBadge status={status} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 space-x-6">
              <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent data-[state=active]:border-bespoke-gold data-[state=active]:bg-transparent px-0 py-3">
                Request Details
              </TabsTrigger>
              <TabsTrigger value="cad" className="rounded-none border-b-2 border-transparent data-[state=active]:border-bespoke-gold data-[state=active]:bg-transparent px-0 py-3">
                CAD Management
              </TabsTrigger>
              <TabsTrigger value="quote" className="rounded-none border-b-2 border-transparent data-[state=active]:border-bespoke-gold data-[state=active]:bg-transparent px-0 py-3">
                Quotation
              </TabsTrigger>
            </TabsList>
            
            {/* 1. Request Details Tab */}
            <TabsContent value="details" className="mt-6 space-y-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-medium mb-4 pb-4 border-b">Customer Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase block mb-1">Name</span>
                    <span className="font-medium">{order.customerName}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase block mb-1">Email</span>
                    <span className="font-medium">{order.customerEmail}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase block mb-1">Phone</span>
                    <span className="font-medium">{order.customerPhone}</span>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-medium mb-4 pb-4 border-b">Jewellery Specifications</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase block mb-1">Type</span>
                    <span className="font-medium capitalize">{order.jewelleryType}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase block mb-1">Metal</span>
                    <span className="font-medium">{order.metalType}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase block mb-1">Gemstone</span>
                    <span className="font-medium">{order.gemstone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase block mb-1">Budget</span>
                    <span className="font-medium text-green-600">{order.budgetRange}</span>
                  </div>
                </div>
                
                <div>
                  <span className="text-xs text-muted-foreground uppercase block mb-2">Description / Instructions</span>
                  <p className="bg-accent/10 p-4 rounded-lg text-sm leading-relaxed whitespace-pre-wrap">
                    {order.description}
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* 2. CAD Management Tab */}
            <TabsContent value="cad" className="mt-6 space-y-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-medium mb-4 pb-4 border-b">Upload New CAD Previews</h3>
                <UploadDropzone onFilesChange={setCadFiles} maxFiles={3} />
                
                <div className="mt-6 flex justify-end">
                  <Button 
                    onClick={handleUploadCAD} 
                    disabled={cadFiles.length === 0 || isSaving}
                    className="bg-bespoke-gold text-white hover:bg-bespoke-gold-dark"
                  >
                    <Upload className="w-4 h-4 mr-2" /> Upload & Notify Customer
                  </Button>
                </div>
              </div>

              {order.cadImages && order.cadImages.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="text-lg font-medium mb-4 pb-4 border-b">Existing CAD Previews</h3>
                  <CADGallery images={order.cadImages} />
                </div>
              )}
            </TabsContent>

            {/* 3. Quotation Tab */}
            <TabsContent value="quote" className="mt-6 space-y-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-medium mb-4 pb-4 border-b">Prepare Quotation</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Final Quote Amount (INR)</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        type="number" 
                        className="pl-10 text-lg" 
                        value={quoteAmount}
                        onChange={(e) => setQuoteAmount(e.target.value)}
                        placeholder="e.g. 150000"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Quotation Notes / Terms for Customer</Label>
                    <Textarea 
                      rows={5}
                      value={quoteNotes}
                      onChange={(e) => setQuoteNotes(e.target.value)}
                      placeholder="Explain the breakdown, materials used, timeline, and any special terms..."
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button 
                      onClick={handleSendQuote}
                      disabled={!quoteAmount || isSaving}
                      className="bg-bespoke-gold text-white hover:bg-bespoke-gold-dark"
                    >
                      <Save className="w-4 h-4 mr-2" /> Send Quote to Customer
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

          </Tabs>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-6">
          
          {/* Status Update Card */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-medium mb-4 pb-4 border-b">Update Status</h3>
            <div className="space-y-4">
              <Select value={status} onValueChange={(val) => setStatus(val as BespokeStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Reviewing">Reviewing</SelectItem>
                  <SelectItem value="Quoted">Quoted</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="CAD Design">CAD Design</SelectItem>
                  <SelectItem value="In Production">In Production</SelectItem>
                  <SelectItem value="Stone Setting">Stone Setting</SelectItem>
                  <SelectItem value="Polishing">Polishing</SelectItem>
                  <SelectItem value="Quality Check">Quality Check</SelectItem>
                  <SelectItem value="Shipped">Shipped</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                onClick={handleSaveStatus} 
                disabled={isSaving || status === order.status}
                className="w-full"
              >
                Save Status
              </Button>
            </div>
          </div>

          {/* Internal Notes Card */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b">
              <MessageSquareText className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-medium">Internal Notes (Hidden from customer)</h3>
            </div>
            <div className="space-y-4">
              <Textarea 
                rows={6}
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Add production notes, supplier details, or internal memos..."
                className="resize-none bg-accent/5 text-sm"
              />
              <Button variant="outline" className="w-full">Save Notes</Button>
            </div>
          </div>


          
        </div>
      </div>
    </div>
  );
}
