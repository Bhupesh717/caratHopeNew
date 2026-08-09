'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, Gem, Diamond, Play, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function BespokeLandingPage() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  const processSteps = [
    { title: "Consultation", desc: "Share your vision, inspiration, and requirements with our expert designers." },
    { title: "Design & CAD", desc: "We craft a precise 3D model for your approval, ensuring every detail is perfect." },
    { title: "Craftsmanship", desc: "Our master jewelers bring your design to life using the finest materials." },
    { title: "Delivery", desc: "Your bespoke masterpiece is beautifully packaged and securely delivered." }
  ];

  const faqs = [
    { q: "How long does the bespoke process take?", a: "Typically, a custom piece takes 4-6 weeks from initial consultation to final delivery, depending on the complexity of the design." },
    { q: "Do I need to know exactly what I want?", a: "Not at all! Our designers excel at guiding you through the process, drawing inspiration from your preferences, lifestyle, and story." },
    { q: "Can I provide my own gemstones?", a: "Yes, we often work with heirloom stones. We will need to inspect them first to ensure they are suitable for the new setting." },
    { q: "What is the starting price for bespoke jewellery?", a: "Custom pieces start at ₹50,000, but the final price depends heavily on the materials, stones, and complexity of the design." }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* 1. Cinematic Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div style={{ y }} className="absolute inset-0 z-0 bg-slate-900">
          <div className="absolute inset-0 bg-black/50 z-10" />
          <Image
            src="/bespoke-banner.png"
            alt="Luxury Jewelry Making"
            fill
            className="object-cover"
            priority
          />
        </motion.div>

        <div className="relative z-20 text-center text-white max-w-4xl px-6">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif mb-6 tracking-tight"
          >
            Craft Your <br /><span className="text-bespoke-gold italic">Dream</span> Jewellery
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto font-light"
          >
            Experience the ultimate luxury of creating a one-of-a-kind masterpiece, tailored exclusively for you by our master craftsmen.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/bespoke-jewellery/request">
              <Button size="lg" className="w-full sm:w-auto bg-bespoke-gold text-white hover:bg-bespoke-gold-dark rounded-full px-8 text-base h-14">
                Request Your Order Now
              </Button>
            </Link>
            <Link href="/shop">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-black hover:bg-white/10 rounded-full px-8 text-base h-14">
                Explore Collections
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 text-white/50"
        >
          <div className="w-[1px] h-16 bg-gradient-to-b from-white/50 to-transparent mx-auto mb-2" />
          <span className="text-xs uppercase tracking-widest">Scroll</span>
        </motion.div>
      </section>

      {/* 2. The Bespoke Process */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-sm uppercase tracking-widest text-bespoke-gold mb-3">Our Process</h2>
          <h3 className="text-4xl font-serif text-foreground">From Vision to Reality</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {processSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              className="relative p-6 border border-border/50 rounded-2xl hover:border-bespoke-gold/50 transition-colors group bg-accent/5"
            >
              <div className="text-6xl font-serif text-bespoke-gold/20 absolute top-4 right-6 group-hover:text-bespoke-gold/30 transition-colors">
                0{index + 1}
              </div>
              <h4 className="text-xl font-medium mb-3 mt-8 text-foreground relative z-10">{step.title}</h4>
              <p className="text-muted-foreground leading-relaxed relative z-10">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. CAD Showcase */}
      <section className="py-24 bg-accent/5 text-foreground relative overflow-hidden border-y border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <h2 className="text-sm uppercase tracking-widest text-bespoke-gold mb-3">Precision Engineering</h2>
            <h3 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">Visualize Perfection Before Production</h3>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Using state-of-the-art 3D CAD modeling, we provide photorealistic renderings of your design. This ensures every curve, facet, and dimension meets your exact specifications before a single piece of metal is cast.
            </p>
            <ul className="space-y-4 mb-10 text-foreground">
              <li className="flex items-center gap-3"><Check className="text-bespoke-gold w-5 h-5" /> Photorealistic previews</li>
              <li className="flex items-center gap-3"><Check className="text-bespoke-gold w-5 h-5" /> Unlimited revisions during CAD phase</li>
              <li className="flex items-center gap-3"><Check className="text-bespoke-gold w-5 h-5" /> Exact stone placement mapping</li>
            </ul>
          </div>
          <div className="lg:w-1/2 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative aspect-square rounded-3xl overflow-hidden border border-border"
            >
              <Image
                src="/bespoke-cad.png"
                alt="CAD Jewelry Design"
                fill
                className="object-cover"
              />

            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Materials Showcase */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-sm uppercase tracking-widest text-bespoke-gold mb-3">Finest Materials</h2>
          <h3 className="text-4xl font-serif text-foreground">Ethically Sourced, Masterfully Crafted</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-8 group">
            <div className="w-20 h-20 mx-auto rounded-full bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-bespoke-gold/10 transition-colors">
              <Gem className="w-10 h-10 text-bespoke-gold" />
            </div>
            <h4 className="text-xl font-medium mb-3">Precious Metals</h4>
            <p className="text-muted-foreground">From 18k White Gold to 950 Platinum, we use only the purest alloys for lasting durability and brilliance.</p>
          </div>
          <div className="text-center p-8 group">
            <div className="w-20 h-20 mx-auto rounded-full bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-bespoke-gold/10 transition-colors">
              <Diamond className="w-10 h-10 text-bespoke-gold" />
            </div>
            <h4 className="text-xl font-medium mb-3">Conflict-Free Diamonds</h4>
            <p className="text-muted-foreground">Every diamond is carefully selected for cut, color, clarity, and carat, ensuring maximum fire and ethical origins.</p>
          </div>
          <div className="text-center p-8 group">
            <div className="w-20 h-20 mx-auto rounded-full bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-bespoke-gold/10 transition-colors">
              <Sparkles className="w-10 h-10 text-bespoke-gold" />
            </div>
            <h4 className="text-xl font-medium mb-3">Rare Gemstones</h4>
            <p className="text-muted-foreground">Vibrant sapphires, deep emeralds, and rich rubies sourced globally to add a unique touch of color to your piece.</p>
          </div>
        </div>
      </section>

      {/* 5. FAQs */}
      <section className="py-24 bg-accent/5 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-serif text-foreground">Frequently Asked Questions</h3>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b-border">
                <AccordionTrigger className="text-left text-lg hover:text-bespoke-gold transition-colors">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>


    </div>
  );
}
