'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, IndianRupee, Download } from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimelineTracker } from '@/components/bespoke/TimelineTracker';
import { QuoteCard } from '@/components/bespoke/QuoteCard';
import { CADGallery } from '@/components/bespoke/CADGallery';
import { BespokeStatusBadge } from '@/components/bespoke/BespokeStatusBadge';
import { bespokeService } from '@/lib/api/bespoke';
import { BespokeOrder } from '@/types/bespoke';

export default function CustomerOrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<BespokeOrder | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock fetching data
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await bespokeService.getOrderDetails(orderId);
        // Enriching mock data for demonstration
        setOrder({
          ...response.data,
          status: 'CAD Design',
          quoteAmount: 125000,
          quoteNotes: "Based on your requirements, we recommend 18K gold to ensure durability for the specific setting style you chose.",
          cadImages: [
            "https://images.unsplash.com/photo-1599643478514-4a4e06d51e7d?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1617325247661-675ab03407b3?w=800&auto=format&fit=crop"
          ]
        });
      } catch (error) {
        console.error("Failed to fetch order", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse w-12 h-12 rounded-full border-4 border-bespoke-gold border-t-transparent" />
      </div>
    );
  }

  if (!order) return <div className="p-10 text-center">Order not found</div>;

  return (
    <div className="min-h-screen bg-accent/5 pt-8 pb-24 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link href="/account/bespoke-orders" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
            </Link>
            <h1 className="text-3xl font-serif text-foreground flex items-center gap-4">
              Order {order.id}
              <BespokeStatusBadge status={order.status} className="text-sm font-sans" />
            </h1>
            <p className="text-muted-foreground mt-1 capitalize">
              Bespoke {order.metalType} {order.jewelleryType}
            </p>
          </div>
          
          <a
            href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hi, I would like to chat about my bespoke order ${order.id}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <Button variant="outline" className="border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all duration-300 rounded-xl flex items-center gap-2">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.45 5.518 0 10.005-4.486 10.007-10.007.001-2.673-1.036-5.186-2.922-7.071C16.471 1.64 13.969.602 11.3.602 5.786.602 1.3 5.088 1.298 10.61c0 1.517.406 2.998 1.18 4.314l-.993 3.626 3.715-.975zM17.65 14.8c-.28-.14-1.658-.818-1.915-.912-.256-.093-.443-.14-.63.14-.187.28-.724.912-.887 1.1-.162.186-.325.21-.605.07-.28-.14-1.182-.435-2.251-1.39-.831-.741-1.393-1.656-1.556-1.937-.163-.28-.018-.431.122-.57.125-.127.28-.327.42-.49.14-.164.187-.28.28-.467.094-.187.047-.35-.024-.49-.07-.14-.63-1.517-.862-2.078-.227-.547-.457-.473-.63-.482-.162-.008-.349-.01-.536-.01-.187 0-.49.07-.747.35-.257.28-.98 0.957-.98 2.336 0 1.379 1.004 2.709 1.144 2.9.14.186 1.977 3.018 4.79 4.23.668.289 1.19.462 1.597.592.67.213 1.28.183 1.762.11.537-.08 1.658-.677 1.89-1.332.234-.655.234-1.217.164-1.333-.07-.116-.257-.186-.537-.326z"/>
              </svg>
              Chat on WhatsApp
            </Button>
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Tabs for different sections */}
            <Tabs defaultValue="progress" className="w-full">
              <TabsList className="w-full grid grid-cols-3 h-14 bg-background border border-border rounded-xl p-1">
                <TabsTrigger value="progress" className="rounded-lg text-sm md:text-base data-[state=active]:bg-bespoke-gold/10 data-[state=active]:text-bespoke-gold-dark">Progress</TabsTrigger>
                <TabsTrigger value="cad" className="rounded-lg text-sm md:text-base data-[state=active]:bg-bespoke-gold/10 data-[state=active]:text-bespoke-gold-dark">CAD Previews</TabsTrigger>
                <TabsTrigger value="details" className="rounded-lg text-sm md:text-base data-[state=active]:bg-bespoke-gold/10 data-[state=active]:text-bespoke-gold-dark">Request Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="progress" className="mt-6 bg-card border border-border rounded-2xl p-6 md:p-10 shadow-sm">
                <h3 className="text-xl font-serif mb-8 border-b border-border pb-4">Production Timeline</h3>
                <TimelineTracker currentStatus={order.status} />
              </TabsContent>
              
              <TabsContent value="cad" className="mt-6 bg-card border border-border rounded-2xl p-6 md:p-10 shadow-sm">
                <div className="flex justify-between items-end mb-8 border-b border-border pb-4">
                  <div>
                    <h3 className="text-xl font-serif">3D CAD Previews</h3>
                    <p className="text-sm text-muted-foreground mt-1">Review the digital models of your design.</p>
                  </div>
                  {order.cadImages && order.cadImages.length > 0 && (
                    <Button variant="outline" size="sm" className="hidden md:flex">
                      <Download className="w-4 h-4 mr-2" /> Download All
                    </Button>
                  )}
                </div>
                <CADGallery images={order.cadImages || []} />
              </TabsContent>
              
              <TabsContent value="details" className="mt-6 bg-card border border-border rounded-2xl p-6 md:p-10 shadow-sm">
                <h3 className="text-xl font-serif mb-6 border-b border-border pb-4">Original Request</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Description</h4>
                    <p className="text-foreground leading-relaxed">{order.description}</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4 border-t border-border">
                    <div>
                      <span className="text-xs text-muted-foreground uppercase block mb-1">Budget</span>
                      <span className="font-medium">{order.budgetRange}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground uppercase block mb-1">Metal</span>
                      <span className="font-medium">{order.metalType}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground uppercase block mb-1">Gemstone</span>
                      <span className="font-medium">{order.gemstone || 'Not specified'}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            
            {/* Quote Card */}
            {order.quoteAmount ? (
              <QuoteCard 
                amount={order.quoteAmount}
                notes={order.quoteNotes}
                status={order.status === 'Quoted' ? 'Pending' : (['Approved', 'CAD Design', 'In Production', 'Stone Setting', 'Polishing', 'Quality Check', 'Shipped', 'Delivered'].includes(order.status) ? 'Accepted' : 'Pending')}
                onAccept={() => console.log('Accepted')}
                onReject={() => console.log('Rejected')}
                onDownloadInvoice={() => console.log('Download Invoice')}
              />
            ) : (
              <div className="bg-card border border-border rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IndianRupee className="w-5 h-5 text-muted-foreground" />
                </div>
                <h4 className="font-medium mb-2">Quotation Pending</h4>
                <p className="text-sm text-muted-foreground">
                  Our designers are reviewing your request and will prepare a detailed quotation shortly.
                </p>
              </div>
            )}

            {/* Quick Summary Card */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h4 className="font-medium mb-4 pb-4 border-b border-border">Order Summary</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Order Date</span>
                  <span className="font-medium">May 20, 2024</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Delivery</span>
                  <span className="font-medium">June 15, 2024</span>
                </li>
                <li className="flex justify-between pt-3 mt-3 border-t border-border">
                  <span className="text-muted-foreground">Total Paid</span>
                  <span className="font-medium text-green-600">₹0</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Remaining</span>
                  <span className="font-medium">
                    {order.quoteAmount ? `₹${order.quoteAmount.toLocaleString()}` : 'TBD'}
                  </span>
                </li>
              </ul>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
