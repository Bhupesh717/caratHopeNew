'use client';

import { motion, Variants, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Testimonials } from '@/components/testimonials';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

export default function AboutPage() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <div className="bg-muted min-h-screen">
      {/* Hero Header */}
      <section className="relative w-full max-h-[570px] bg-emerald-dark flex items-center justify-center overflow-hidden">
        <Image
          src="/images/about/about2.png"
          alt="About CaratHope"
          width={1920}
          height={600}
          priority
          quality={100}
          className="w-full h-auto max-h-[570px] object-cover"
          sizes="100vw"
        />
      </section>



      {/* Story Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, amount: 0.2 }}
              className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-2xl"
            >
              <div className="absolute inset-0 bg-black/5 z-10" />
              <Image
                src="https://images.unsplash.com/photo-1611085583191-a3b181a88401?q=80&w=1200&auto=format&fit=crop"
                alt="CaratHope Craftsmanship"
                fill
                className="object-cover transition-transform duration-1000 hover:scale-105"
              />
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
              className="space-y-8"
            >
              <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-light text-slate-900">
                Our <span className="italic text-primary">Heritage</span>
              </motion.h2>
              <motion.div variants={fadeUp} className="w-12 h-px bg-primary" />
              <motion.p variants={fadeUp} className="leading-relaxed text-slate-600 text-lg font-light">
                Founded with a vision to redefine luxury, CarateHope was born from a passion for creating timeless pieces that celebrate life's most precious moments. Every piece is meticulously shaped by our master artisans using only the finest, ethically sourced materials.
              </motion.p>
              <motion.p variants={fadeUp} className="leading-relaxed text-slate-600 text-lg font-light">
                We believe that jewelry is more than just an accessory—it is a deeply personal reflection of who you are and the memories you hold dear. Our collections are inspired by the beauty of everyday life, designed to be worn, loved, and passed down through generations.
              </motion.p>
              <motion.div variants={fadeUp} className="pt-4">
                <Link href="/shop">
                  <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-none text-xs tracking-[0.2em] uppercase transition-colors">
                    Explore Collections
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Customer Knowledge Section */}
      <section className="relative py-24 overflow-hidden bg-muted">
        {/* Subtle topogaphic-like pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.83v58.34l-.83.83H5.373l-.83-.83V.83l.83-.83h49.254zM53 58V2H7v56h46zM26 14l-2-2v42l2 2V14zm10 0l-2-2v42l2 2V14z' fill='%23000000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")` }} />

        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text side */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
              className="max-w-md lg:ml-8"
            >
              <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-serif text-slate-900 leading-[1.4] uppercase tracking-wide">
                We Know Jewellery –<br />
                & We Know Our Customers
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-8 text-sm md:text-base text-slate-500 font-light leading-relaxed">
                Cenean imperdiet. Proin viverra, ligula sit amet ultrices semper, ligula arcu tristique sapien, a accumsan nisi mauris ac eros. Vestibulum fringilla pede sit amet augue. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Fusce fermentum odio nec arcu.
              </motion.p>
            </motion.div>

            {/* Images side */}
            <div className="relative h-[500px] md:h-[600px] w-full mt-12 lg:mt-0">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                viewport={{ once: true, amount: 0.2 }}
                className="absolute right-0 lg:right-8 top-0 w-[70%] h-[85%] z-10 shadow-lg"
              >
                <Image src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop" alt="Model wearing jewellery" fill className="object-cover" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                viewport={{ once: true, amount: 0.2 }}
                className="absolute left-0 bottom-0 w-[55%] h-[60%] z-20 shadow-2xl border-8 border-[var(--muted)]"
              >
                <Image src="/images/ig-1.png" alt="Gold earrings" fill className="object-cover" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      {/* Values Section */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="text-center mb-16 space-y-4"
          >
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-light text-slate-900">
              The <span className="italic text-primary">Pillars</span> of Our Brand
            </motion.h2>
            <motion.div variants={fadeUp} className="w-12 h-px bg-primary mx-auto" />
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: '✦',
                title: 'Exceptional Quality',
                description: 'We use only the finest materials, brilliant diamonds, and traditional craftsmanship to ensure lasting perfection.',
              },
              {
                icon: '⟡',
                title: 'Sustainable Sourcing',
                description: 'We are deeply committed to ethical sourcing, conflict-free stones, and environmentally conscious practices.',
              },
              {
                icon: '✧',
                title: 'Master Craftsmanship',
                description: 'Every piece is handcrafted with love, precision, and an unwavering attention to detail by seasoned artisans.',
              },
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true, amount: 0.2 }}
                className="group p-10 bg-muted hover:bg-primary transition-colors duration-500 rounded-2xl text-center flex flex-col items-center"
              >
                <div className="text-4xl text-primary group-hover:text-white transition-colors duration-500 mb-6">{value.icon}</div>
                <h3 className="text-xl font-medium text-slate-900 group-hover:text-white transition-colors duration-500 mb-4">{value.title}</h3>
                <p className="text-slate-600 group-hover:text-white/80 transition-colors duration-500 font-light leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="relative py-32 overflow-hidden z-0">
        <div className="absolute inset-0 z-0 bg-[url('/images/gemstone-necklace.jpg')] bg-cover bg-center bg-fixed" />
        <div className="absolute inset-0 z-10 bg-black/70" />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="relative z-20 mx-auto max-w-3xl px-6 text-center space-y-8"
        >
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-light text-white leading-tight">
            Ready to find your <span className="italic text-[#dca68a]">perfect piece?</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-white/70 font-light leading-relaxed max-w-xl mx-auto">
            Browse our curated collections and discover fine jewelry that speaks to your unique style and story.
          </motion.p>
          <motion.div variants={fadeUp} className="pt-8">
            <Link href="/shop">
              <Button className="bg-transparent border border-white/30 text-white hover:bg-white hover:text-slate-900 px-10 py-7 rounded-none text-xs tracking-[0.2em] uppercase transition-all duration-500 backdrop-blur-sm">
                Shop The Collection
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />
    </div>
  );
}
