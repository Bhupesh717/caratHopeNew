'use client';

import Link from 'next/link';
import { Mail, MapPin, Phone, Facebook, Instagram, Twitter, Calendar } from 'lucide-react';
import { Logo } from '@/components/logo';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="w-full mt-auto">

      {/* Main Footer Section */}
      <div className="bg-emerald-dark pt-16 pb-8 px-6 text-slate-300">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8 mb-16">
            {/* Brand Column */}
            <div className="space-y-2">
              <Link href="/" className="inline-block">
                <Image
                  src="/logoOld.png"
                  alt="CaratHope Logo"
                  width={270}
                  height={270}
                  className="object-contain h-32 w-auto"
                  priority
                />
              </Link>
              <p className="text-sm leading-relaxed text-slate-400">
                Where timeless craftsmanship meets the rarest gems — jewelry created to be cherished for generations.
              </p>

              <div className="pt-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">We Accept</p>
                <div className="flex flex-wrap gap-3 items-center">
                  <Image src="/visa.png" alt="Visa" width={90} height={36} className="h-9 w-auto rounded object-contain bg-white px-1.5 py-1" />
                  <Image src="/card.png" alt="Mastercard" width={90} height={36} className="h-9 w-auto rounded object-contain bg-white px-1.5 py-1" />
                  <Image src="/paypal.png" alt="PayPal" width={90} height={36} className="h-9 w-auto rounded object-contain bg-white px-1.5 py-1" />
                  <Image src="/apple-pay.png" alt="Apple Pay" width={90} height={36} className="h-9 w-auto rounded object-contain bg-white px-1.5 py-1" />
                  <Image src="/stripe.png" alt="Stripe" width={90} height={36} className="h-9 w-auto rounded object-contain bg-white px-1.5 py-1" />
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-base font-semibold text-white mb-6">Quick Links</h3>
              <ul className="space-y-4 text-sm">
                {/* <li><Link href="/" className="text-slate-400 hover:text-white transition-colors">Home</Link></li> */}
                <li><Link href="/shop" className="text-slate-400 hover:text-white transition-colors">Shop</Link></li>
                <li><Link href="/personalised-jewellery" className="text-slate-400 hover:text-white transition-colors">Personalised</Link></li>
                <li><Link href="/about" className="text-slate-400 hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="text-slate-400 hover:text-white transition-colors">Contact</Link></li>

              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h3 className="text-base font-semibold text-white mb-6">Customer Service</h3>
              <ul className="space-y-4 text-sm">
                <li><Link href="/track-order" className="text-slate-400 hover:text-white transition-colors">Track Your Order</Link></li>
                <li><Link href="/refund-policy" className="text-slate-400 hover:text-white transition-colors">Refund Policy</Link></li>
                <li><Link href="/shipping-policy" className="text-slate-400 hover:text-white transition-colors">Shipping Policy</Link></li>
                <li><Link href="/cancellation-returns" className="text-slate-400 hover:text-white transition-colors">Cancellation & Returns</Link></li>


              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-base font-semibold text-white mb-6">Contact Info</h3>
              <ul className="space-y-4 text-sm">
                {/* Book Appointment — top */}
                <li>
                  <Link
                    href="/book-appointment"
                    className="inline-flex items-center gap-2 border border-[#c9a96e]/60 text-[#c9a96e] hover:bg-[#c9a96e] hover:text-white px-4 py-2 text-[10px] tracking-[0.18em] uppercase font-semibold transition-colors duration-300"
                  >
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    Book an Appointment
                  </Link>
                </li>

                <li>
                  <a
                    href="https://www.google.com/maps/search/10%2F523+Malviya+Nagar+Road+Jaipur+302017"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2.5 text-slate-400 hover:text-white transition-colors group"
                  >
                    <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-[#c9a96e] group-hover:text-white transition-colors" />
                    <span className="text-xs leading-relaxed">10/523 Malviya Nagar Road, Jaipur 302017</span>
                  </a>
                </li>
                <li>
                  <a href="tel:+918824700161" className="flex items-center gap-2.5 text-slate-400 hover:text-white transition-colors group">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-[#c9a96e] group-hover:text-white transition-colors" />
                    <span className="text-xs">+91 (882) 470-0161</span>
                  </a>
                </li>
                <li>
                  <a href="mailto:hello@carathope.in" className="flex items-center gap-2.5 text-slate-400 hover:text-white transition-colors group">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-[#c9a96e] group-hover:text-white transition-colors" />
                    <span className="text-xs">hello@carathope.in</span>
                  </a>
                </li>

                {/* Social Icons */}
                <li>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-3 font-semibold">Follow Us</p>
                  <div className="flex items-center gap-3">
                    <a href="#" aria-label="Facebook"
                      className="w-8 h-8 flex items-center justify-center border border-white/10 text-slate-400 hover:border-[#c9a96e] hover:text-[#c9a96e] transition-all duration-300">
                      <Facebook className="h-3.5 w-3.5" />
                    </a>
                    <a href="https://instagram.com/carathope" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                      className="w-8 h-8 flex items-center justify-center border border-white/10 text-slate-400 hover:border-[#c9a96e] hover:text-[#c9a96e] transition-all duration-300">
                      <Instagram className="h-3.5 w-3.5" />
                    </a>
                    <a href="#" aria-label="Twitter / X"
                      className="w-8 h-8 flex items-center justify-center border border-white/10 text-slate-400 hover:border-[#c9a96e] hover:text-[#c9a96e] transition-all duration-300">
                      <Twitter className="h-3.5 w-3.5" />
                    </a>
                    <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
                      className="w-8 h-8 flex items-center justify-center border border-white/10 text-slate-400 hover:border-[#25D366] hover:text-[#25D366] transition-all duration-300">
                      {/* WhatsApp SVG */}
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </a>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#c9a96e] to-transparent"></div>
          {/* Bottom Bar */}
          <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
            <p>&copy; 2025 CaratHope LLP. All rights reserved.</p>
            <div className="flex space-x-6">
              <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms And Conditions</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
