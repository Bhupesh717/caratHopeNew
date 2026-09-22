'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';
import { useAuthStore } from '@/store/auth';
import { Heart, ShoppingCart, Menu, X, Search, User, Store, LogOut, ClipboardList, Gem, UserCircle } from 'lucide-react';
import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { apiClient } from '@/lib/api-client';
import { motion, AnimatePresence } from 'framer-motion';

interface NavCategory {
  id: string;
  name: string;
}

const navLinks = [
  { label: 'Shop', href: '/shop', icon: Store },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === '/';
  const cartCount = useCartStore((state) => state.getItemCount());
  const wishlistCount = useWishlistStore((state) => state.getItemCount());
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showTopBar, setShowTopBar] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [categories, setCategories] = useState<NavCategory[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await apiClient.get('/public/categories');
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          setCategories(response.data.data.map((c: any) => ({
            id: String(c.id),
            name: c.name,
          })));
        }
      } catch (err) {
        console.error('Error fetching navbar categories:', err);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHydrated]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  return (
    <>
      <nav className={`sticky w-full top-0 z-50 flex flex-col transition-all duration-500 ${scrolled
        ? 'bg-white/98 backdrop-blur-xl shadow-[0_2px_32px_rgba(0,0,0,0.07)] border-b border-slate-100'
        : 'bg-[#FAF6EE] border-b border-emerald-dark/10 shadow-[0_2px_15px_rgba(0,0,0,0.03)]'
        }`}>

        {/* Top Promotional Bar — home page only */}
        {isHome && (
          <>
            <AnimatePresence>
              {showTopBar && (
                <motion.div
                  initial={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="relative w-full bg-emerald-dark text-gold-light text-center py-2 px-4 text-[7px] sm:text-[11px] tracking-[0.12em] uppercase font-medium">
                    Inspired by luxury, crafted for eternity.&nbsp;
                    <Link href="/shop" className="underline underline-offset-2 hover:text-white transition-colors font-semibold">
                      Shop Now
                    </Link>
                    <button
                      onClick={() => setShowTopBar(false)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gold-light/70 hover:text-white transition-colors"
                      aria-label="Dismiss"
                    >
                      <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Thin separator line */}
            <div className="w-full h-px bg-emerald-dark/10" />
          </>
        )}

        {/* Main Navbar Row */}
        <div className={`relative w-full px-4 sm:px-8 lg:px-12 flex items-center justify-between transition-all duration-500 ${
          scrolled ? 'h-16 sm:h-20' : 'h-20 sm:h-28'
        }`}>

          {/* ── Logo Text: Left on mobile, Centered on tablet & desktop ── */}
          <Link
            href="/"
            aria-label="CaratHope Home"
            className="flex-shrink-0 flex items-center group py-1 sm:absolute sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:pointer-events-auto z-10 text-left sm:text-center"
          >
            <span
              className={`uppercase font-serif drop-shadow-lg tracking-[0.06em] sm:tracking-[0.08em] select-none transition-all duration-500 leading-none ${
                scrolled ? 'text-3xl sm:text-4xl lg:text-5xl' : 'text-4xl sm:text-6xl lg:text-7xl'
              }`}
            >
              <span className="text-[#062119] font-semibold">
                <span className={`${scrolled ? 'text-4xl sm:text-5xl lg:text-6xl' : 'text-5xl sm:text-7xl lg:text-8xl'}`}>C</span>
                aratHope
              </span>
            </span>
          </Link>

          {/* ── RIGHT: Nav Links + Icons ── */}
          <div className="flex items-center gap-3 sm:gap-6 ml-auto z-20">

            {/* Desktop Nav Links — icon only for Shop */}
            <div className="hidden lg:flex items-center gap-7 mr-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    title={link.label}
                    className="group relative text-emerald-dark hover:text-gold-primary transition-colors duration-300"
                  >
                    <Icon className="h-5 w-5 stroke-[1.5]" />
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-px w-0 bg-emerald-dark transition-all duration-300 group-hover:w-full" />
                  </Link>
                );
              })}
            </div>

            {/* Search */}
            <button
              className="text-emerald-dark hover:text-gold-primary transition-colors duration-300"
              aria-label="Search"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="h-4 w-4 sm:h-[17px] sm:w-[17px]" />
            </button>

            {/* Wishlist — Desktop only (Mobile in Drawer) */}
            <Link
              href="/wishlist"
              className="hidden sm:block relative text-emerald-dark hover:text-gold-primary transition-colors duration-300"
              title="Wishlist"
            >
              <Heart className="h-4 w-4 sm:h-[17px] sm:w-[17px]" />
              {isHydrated && wishlistCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold-primary text-[9px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative text-emerald-dark hover:text-gold-primary transition-colors duration-300"
              title="Cart"
            >
              <ShoppingCart className="h-4 w-4 sm:h-[17px] sm:w-[17px]" />
              {isHydrated && cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold-primary text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth — Desktop only (Mobile in Drawer) */}
            <div className="hidden sm:flex items-center">
              {isHydrated ? (
                isAuthenticated ? (
                  /* ── Profile Hover Dropdown ── */
                  <div className="relative group">
                    {/* Trigger icon */}
                    <button
                      aria-label="My Account"
                      className="relative text-emerald-dark group-hover:text-gold-primary transition-colors duration-300 flex items-center"
                    >
                      <User className="h-5 w-5 sm:h-[20px] sm:w-[20px]" />
                    </button>

                    {/* Dropdown — visible on group hover */}
                    <div className="absolute right-0 top-full mt-0 w-52 bg-white border border-slate-100 shadow-[0_8px_32px_rgba(0,0,0,0.10)] z-50
                      opacity-0 invisible translate-y-1
                      group-hover:opacity-100 group-hover:visible group-hover:translate-y-0
                      transition-all duration-200 ease-out pointer-events-none group-hover:pointer-events-auto">

                      {/* User name header */}
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-[10px] tracking-[0.15em] uppercase text-slate-400">Signed in as</p>
                        <p className="text-sm font-semibold text-emerald-dark truncate mt-0.5">{user?.name || 'My Account'}</p>
                      </div>

                      {/* Menu items */}
                      <ul className="py-2">
                        <li>
                          <Link href="/profile"
                            className="flex items-center gap-3 px-4 py-2.5 text-xs tracking-wide text-slate-600 hover:bg-[#FAF6EE] hover:text-emerald-dark transition-colors">
                            <UserCircle className="w-4 h-4 text-slate-400" />
                            Profile Info
                          </Link>
                        </li>
                        <li>
                          <Link href="/orders"
                            className="flex items-center gap-3 px-4 py-2.5 text-xs tracking-wide text-slate-600 hover:bg-[#FAF6EE] hover:text-emerald-dark transition-colors">
                            <ClipboardList className="w-4 h-4 text-slate-400" />
                            Order History
                          </Link>
                        </li>
                        <li>
                          <Link href="/personalised-jewellery"
                            className="flex items-center gap-3 px-4 py-2.5 text-xs tracking-wide text-slate-600 hover:bg-[#FAF6EE] hover:text-emerald-dark transition-colors">
                            <Gem className="w-4 h-4 text-slate-400" />
                            Personalised Orders
                          </Link>
                        </li>
                      </ul>

                      {/* Sign Out */}
                      <div className="border-t border-slate-100 py-2">
                        <button
                          onClick={() => logout()}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-xs tracking-wide text-red-500 hover:bg-red-50 transition-colors">
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    title="Sign In"
                    className="relative text-emerald-dark hover:text-gold-primary transition-colors duration-300"
                  >
                    {/* User + arrow-in SVG */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      className="h-5 w-5 sm:h-[20px] sm:w-[20px]">
                      <circle cx="9" cy="7" r="4" />
                      <path d="M2 21v-1a7 7 0 0 1 10.46-6.08" />
                      <path d="M17 16l3 3-3 3" />
                      <path d="M14 19h6" />
                    </svg>
                  </Link>
                )
              ) : (
                <div className="w-[20px] h-[20px] rounded-full animate-pulse bg-slate-100" />
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden text-gold-primary hover:text-emerald-dark transition-colors duration-300"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Categories Bar (Bottom Row) */}
        {categories.length > 0 && (
          <div className="w-full border-t border-emerald-dark/10">
            <div className="mx-auto max-w-7xl px-4 sm:px-8">
              <div
                className="flex items-center justify-start sm:justify-center gap-5 sm:gap-8 md:gap-10 overflow-x-auto scrollbar-hide py-2 sm:py-2.5 text-[11px] sm:text-xs tracking-[0.16em] uppercase font-serif"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/shop?category=${cat.id}`}
                    className="whitespace-nowrap text-emerald-dark/90 hover:text-gold-primary transition-colors duration-300 relative group py-0.5"
                  >
                    <span>{cat.name}</span>
                    <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-gold-primary transition-all duration-300 group-hover:w-full" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Dropdown */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-slate-100 bg-white"
            >
              <div className="mx-auto max-w-2xl px-6 py-4">
                <div className="flex items-center gap-3 border-b border-slate-200">
                  <Search className="h-4 w-4 shrink-0 text-slate-400" />
                  <input
                    ref={searchRef}
                    type="text"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = e.currentTarget.value.trim();
                        if (val) {
                          setSearchOpen(false);
                          router.push(`/shop?search=${encodeURIComponent(val)}`);
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                    placeholder="Search jewelry, collections…"
                    className="w-full bg-transparent py-3 text-sm tracking-wide outline-none text-slate-800 placeholder:tracking-widest placeholder:uppercase placeholder:text-xs placeholder:text-slate-400"
                  />
                  <button onClick={() => setSearchOpen(false)} className="shrink-0 text-slate-400 hover:text-slate-700">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden bg-white border-t border-slate-100 lg:hidden"
            >
              <div className="flex flex-col px-6 py-6 gap-1">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between py-4 text-sm font-semibold tracking-[0.15em] uppercase text-emerald-dark hover:text-gold-primary transition-colors border-b border-slate-50"
                    >
                      <span className="flex items-center gap-3">
                        <link.icon className="w-4 h-4 stroke-[1.5] text-slate-400" />
                        {link.label}
                      </span>
                    </Link>
                  </motion.div>
                ))}

                {/* Wishlist in Mobile Drawer */}
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  <Link
                    href="/wishlist"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between py-4 text-sm font-semibold tracking-[0.15em] uppercase text-emerald-dark hover:text-gold-primary transition-colors border-b border-slate-50"
                  >
                    <span className="flex items-center gap-3">
                      <Heart className="w-4 h-4 stroke-[1.5] text-slate-400" />
                      Wishlist
                    </span>
                    {isHydrated && wishlistCount > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold-primary text-[10px] font-bold text-white">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                </motion.div>

                {/* Categories in Mobile Drawer */}
                {categories.length > 0 && (
                  <div className="py-4 border-b border-slate-50">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-slate-400 mb-3 px-1 font-semibold">Categories</p>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/shop?category=${cat.id}`}
                          onClick={() => setIsOpen(false)}
                          className="text-xs px-3 py-1.5 rounded-full bg-slate-100 hover:bg-gold-primary/15 hover:text-gold-primary text-emerald-dark transition-colors uppercase tracking-wider"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.07 }}
                >
                  <Link
                    href="/about"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center py-4 text-sm font-semibold tracking-[0.15em] uppercase text-emerald-dark hover:text-gold-primary transition-colors border-b border-slate-50"
                  >
                    About
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="pt-6"
                >
                  {isHydrated && isAuthenticated ? (
                    <Link
                      href="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-2 w-full bg-slate-100 hover:bg-slate-200 text-emerald-dark py-4 text-xs tracking-[0.2em] uppercase font-semibold transition-colors"
                    >
                      <User className="w-4 h-4" />
                      My Account
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-2 w-full bg-emerald-dark hover:bg-emerald-accent text-white py-4 text-xs tracking-[0.2em] uppercase font-semibold transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Sign In
                    </Link>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
