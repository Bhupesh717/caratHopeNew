'use client';

import { motion, Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { PageHeader } from '@/components/page-header';

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

export default function ContactPage() {
    return (
        <div className="bg-muted min-h-screen">
            <PageHeader
                eyebrow="Get In Touch"
                icon={Mail}
                title="Contact"
                accentTitle="Us"
                subtitle="We would love to hear from you. Reach out to us for any inquiries, custom orders, or assistance."
                imageSrc="/page_heaer.png"
            />

            {/* Contact Content */}
            <section className="py-24">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">

                        {/* Contact Information */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.2 }}
                            variants={staggerContainer}
                            className="space-y-12"
                        >
                            <div>
                                <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-serif text-slate-900 leading-snug">
                                    Our <span className="italic text-primary">Store</span>
                                </motion.h2>
                                <motion.div variants={fadeUp} className="w-12 h-px bg-primary mt-6" />
                                <motion.p variants={fadeUp} className="mt-6 text-slate-500 font-light leading-relaxed">
                                    Visit our flagship store to explore our exclusive collections in person, or contact our customer service team for online assistance.
                                </motion.p>
                            </div>

                            <div className="space-y-8">
                                <motion.div variants={fadeUp} className="flex items-start gap-4">
                                    <div className="bg-white p-3 rounded-full shadow-sm text-primary shrink-0">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-slate-900 mb-1">Address</h3>
                                        <p className="text-slate-500 font-light leading-relaxed">
                                            10/523 Malviya Nagar Road<br />
                                            Jaipur, Rajasthan 302017<br />
                                            India
                                        </p>
                                    </div>
                                </motion.div>

                                <motion.div variants={fadeUp} className="flex items-start gap-4">
                                    <div className="bg-white p-3 rounded-full shadow-sm text-primary shrink-0">
                                        <Phone className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-slate-900 mb-1">Phone</h3>
                                        <p className="text-slate-500 font-light">
                                            +91 (882) 470-0161
                                        </p>
                                    </div>
                                </motion.div>

                                <motion.div variants={fadeUp} className="flex items-start gap-4">
                                    <div className="bg-white p-3 rounded-full shadow-sm text-primary shrink-0">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-slate-900 mb-1">Email</h3>
                                        <p className="text-slate-500 font-light">
                                            hello@carathope.in
                                        </p>
                                    </div>
                                </motion.div>

                                <motion.div variants={fadeUp} className="flex items-start gap-4">
                                    <div className="bg-white p-3 rounded-full shadow-sm text-primary shrink-0">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-slate-900 mb-1">Business Hours</h3>
                                        <p className="text-slate-500 font-light leading-relaxed">
                                            Monday - Saturday: 10:00 AM - 8:00 PM<br />
                                            Sunday: Closed
                                        </p>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Contact Form */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.2 }}
                            variants={staggerContainer}
                            className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-100"
                        >
                            <motion.h3 variants={fadeUp} className="text-2xl font-serif text-slate-900 mb-8">
                                Send us a message
                            </motion.h3>
                            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="firstName" className="text-sm font-medium text-slate-700">First Name</label>
                                        <input type="text" id="firstName" className="w-full px-4 py-3 bg-muted border-transparent focus:bg-white focus:border-primary focus:ring-1 focus:ring-[var(--primary)] rounded-md outline-none transition-all text-slate-800" placeholder="John" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="lastName" className="text-sm font-medium text-slate-700">Last Name</label>
                                        <input type="text" id="lastName" className="w-full px-4 py-3 bg-muted border-transparent focus:bg-white focus:border-primary focus:ring-1 focus:ring-[var(--primary)] rounded-md outline-none transition-all text-slate-800" placeholder="Doe" required />
                                    </div>
                                </motion.div>

                                <motion.div variants={fadeUp} className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</label>
                                    <input type="email" id="email" className="w-full px-4 py-3 bg-muted border-transparent focus:bg-white focus:border-primary focus:ring-1 focus:ring-[var(--primary)] rounded-md outline-none transition-all text-slate-800" placeholder="john@example.com" required />
                                </motion.div>

                                <motion.div variants={fadeUp} className="space-y-2">
                                    <label htmlFor="subject" className="text-sm font-medium text-slate-700">Subject</label>
                                    <input type="text" id="subject" className="w-full px-4 py-3 bg-muted border-transparent focus:bg-white focus:border-primary focus:ring-1 focus:ring-[var(--primary)] rounded-md outline-none transition-all text-slate-800" placeholder="How can we help?" required />
                                </motion.div>

                                <motion.div variants={fadeUp} className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-medium text-slate-700">Message</label>
                                    <textarea id="message" rows={5} className="w-full px-4 py-3 bg-muted border-transparent focus:bg-white focus:border-primary focus:ring-1 focus:ring-[var(--primary)] rounded-md outline-none transition-all text-slate-800 resize-none" placeholder="Write your message here..." required></textarea>
                                </motion.div>

                                <motion.div variants={fadeUp} className="pt-2">
                                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white py-6 rounded-none text-xs tracking-[0.2em] uppercase transition-colors flex items-center justify-center gap-2">
                                        Send Message
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </motion.div>
                            </form>
                        </motion.div>

                    </div>
                </div>
            </section>
        </div>
    );
}
