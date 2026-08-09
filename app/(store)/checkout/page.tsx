"use client";

import React, { useEffect, useState } from 'react';
import { Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Country, State, City } from 'country-state-city';
import { getCurrencySymbol } from '@/lib/utils';

export default function CheckoutPage() {
  const { items, getTotal, clearCart, appliedCoupon } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  const selectedItems = items.filter(item => item.selected !== false);
  const cartCurrency = selectedItems.length > 0 ? (selectedItems[0].currency || 'US') : 'US';
  const currSymbol = getCurrencySymbol(cartCurrency);

  // Form State
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('+91');
  const [country, setCountry] = useState('US');
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Prefill data if user exists
  useEffect(() => {
    if (user && isAuthenticated) {
      if (!email) setEmail(user.email);
      if (!fullName) setFullName(user.name);
      if (!phone && user.phone) setPhone(user.phone);
      
      try {
        if (user.permanentAddress) {
          const billing = JSON.parse(user.permanentAddress);
          if (billing.country) setCountry(billing.country);
          if (billing.address) setAddress(billing.address);
          if (billing.apartment) setApartment(billing.apartment);
          if (billing.city) setCity(billing.city);
          if (billing.state) setState(billing.state);
          if (billing.zip) setZip(billing.zip);
        }
      } catch (e) {
        // Ignore if not JSON
      }

      try {
        if (user.shippingAddress && user.shippingAddress !== user.permanentAddress) {
          const shipping = JSON.parse(user.shippingAddress);
          setShipToDifferentAddress(true);
          if (shipping.fullName) setShippingFullName(shipping.fullName);
          if (shipping.country) setShippingCountry(shipping.country);
          if (shipping.address) setShippingAddress(shipping.address);
          if (shipping.apartment) setShippingApartment(shipping.apartment);
          if (shipping.city) setShippingCity(shipping.city);
          if (shipping.state) setShippingState(shipping.state);
          if (shipping.zip) setShippingZip(shipping.zip);
        }
      } catch (e) {
        // Ignore if not JSON
      }
    }
  }, [user, isAuthenticated]);

  // Shipping State
  const [shipToDifferentAddress, setShipToDifferentAddress] = useState(false);
  const [shippingFullName, setShippingFullName] = useState('');
  const [shippingCountry, setShippingCountry] = useState('US');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingApartment, setShippingApartment] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingState, setShippingState] = useState('');
  const [shippingZip, setShippingZip] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // Derived state for Country-State-City
  const billingStates = country ? State.getStatesOfCountry(country) : [];
  const billingCities = state ? City.getCitiesOfState(country, state) : [];
  
  const shippingStates = shippingCountry ? State.getStatesOfCountry(shippingCountry) : [];
  const shippingCities = shippingState ? City.getCitiesOfState(shippingCountry, shippingState) : [];

  // Submission State
  const [submittingCheckout, setSubmittingCheckout] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Prevent hydration errors with persisted state
  }

  const subtotal = getTotal();
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === 'percentage') {
      discountAmount = (subtotal * appliedCoupon.discount_value) / 100;
    } else {
      discountAmount = appliedCoupon.discount_value;
    }
  }
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const tax = taxableAmount * 0.08;
  const total = taxableAmount + tax;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!termsAccepted) {
      toast.error('Please accept the terms and conditions.');
      return;
    }

    if (selectedItems.length === 0) {
      toast.error('You have no items selected for checkout.');
      return;
    }

    try {
      setSubmittingCheckout(true);
      const checkoutPayload = {
        customer_name: fullName.trim() || email.split('@')[0],
        customer_email: email,
        customer_phone: `${phoneCountryCode}${phone}`,
        billing_address: {
          address, apartment, city, state, zip, country
        },
        shipping_address: shipToDifferentAddress ? {
          full_name: shippingFullName,
          address: shippingAddress,
          apartment: shippingApartment,
          city: shippingCity,
          state: shippingState,
          zip: shippingZip,
          country: shippingCountry
        } : undefined,
        notes,
        items: selectedItems.map((item) => ({
          product_id: Number(item.id),
          quantity: item.quantity,
        })),
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        payment_method: paymentMethod,
      };

      const response = await apiClient.post('/public/orders/checkout', checkoutPayload);
      if (response.data && response.data.success) {
        const orderId = response.data.data.order_id;
        setPlacedOrderId(String(orderId));

        // Save order details to localStorage history so guest customer can view it under /orders
        const orderHistoryItem = {
          id: `ORD-${orderId}`,
          date: new Date().toISOString().split('T')[0],
          total: total,
          status: 'Pending',
          items: selectedItems.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            image: item.image,
          })),
        };

        const existingOrders = JSON.parse(localStorage.getItem('caratehope-orders') || '[]');
        localStorage.setItem(
          'caratehope-orders',
          JSON.stringify([orderHistoryItem, ...existingOrders])
        );

        // Success state changes
        setCheckoutSuccess(true);
        useCartStore.getState().clearSelectedCart();
        toast.success('Order placed successfully!');
      } else {
        toast.error(response.data?.message || 'Failed to place checkout order.');
      }
    } catch (err: any) {
      console.error(err);
      if (!err?.response) {
        toast.error('Checkout failed. Please check your items stock.');
      }
    } finally {
      setSubmittingCheckout(false);
    }
  };

  if (checkoutSuccess) {
    return (
      <div className="min-h-screen bg-background py-20 px-4">
        <div className="flex flex-col items-center justify-center text-center py-16 max-w-lg mx-auto bg-card border border-border rounded-3xl p-8 shadow-sm">
          <div className="rounded-full bg-emerald-100 p-4 mb-6">
            <CheckCircle2 className="h-12 w-12 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-serif text-foreground mb-2">Order Confirmed!</h2>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            Thank you for your purchase. Your order <span className="font-mono font-semibold text-foreground">ORD-{placedOrderId}</span> has been placed successfully and is now being processed.
          </p>
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-md mb-6 w-full text-center">
            <span className="font-semibold">Note:</span> This is a dummy order. T&C are applied. It is not a real order and no actual products will be shipped.
          </div>
          <div className="flex flex-col gap-3 w-full">
            <Button asChild className="w-full py-6">
              <Link href={isAuthenticated ? "/orders" : "/track-order"} className="w-full">
                Track Order History
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full py-6">
              <Link href="/shop" className="w-full">
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <h1 className="text-3xl font-bold text-foreground mb-10">Checkout</h1>
        
        <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column - Forms */}
          <div className="lg:col-span-7 space-y-10">
            
            {/* Customer Information */}
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">Customer information</h2>
              <div>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address *" 
                  className="w-full px-4 py-3 border border-border rounded-md bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground transition-shadow"
                />
              </div>
            </section>
            
            {/* Billing Details */}
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">Billing details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full name *" 
                    className="w-full px-4 py-3 border border-border rounded-md bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground transition-shadow" 
                  />
                  <div className="flex w-full">
                    <div className="relative w-[110px] shrink-0 border border-border border-r-0 rounded-l-md bg-muted focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-shadow">
                      <select 
                        required
                        value={phoneCountryCode}
                        onChange={(e) => setPhoneCountryCode(e.target.value)}
                        className="w-full h-full px-2 py-3 bg-transparent focus:outline-none text-foreground appearance-none text-sm"
                      >
                        <option value="+91">+91 (IN)</option>
                        <option value="+1">+1 (US/CA)</option>
                        <option value="+44">+44 (UK)</option>
                        <option value="+61">+61 (AU)</option>
                        <option value="+81">+81 (JP)</option>
                        <option value="+971">+971 (AE)</option>
                        <option value="+49">+49 (DE)</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-foreground">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                    <input 
                      type="tel" 
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="Phone *" 
                      className="flex-1 w-full px-4 py-3 border border-border rounded-r-md bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground transition-shadow" 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <select 
                      required
                      value={country}
                      onChange={(e) => {
                        setCountry(e.target.value);
                        setState('');
                        setCity('');
                      }}
                      className="w-full px-4 py-3 border border-border rounded-md bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground appearance-none transition-shadow"
                    >
                      <option value="" disabled className="text-muted-foreground">Country / Region *</option>
                      {Country.getAllCountries().map(c => (
                        <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-foreground">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <select 
                      required
                      value={state}
                      onChange={(e) => {
                        setState(e.target.value);
                        setCity('');
                      }}
                      disabled={!country || billingStates.length === 0}
                      className="w-full px-4 py-3 border border-border rounded-md bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground appearance-none transition-shadow disabled:opacity-50"
                    >
                      <option value="" disabled className="text-muted-foreground">State / Province *</option>
                      {billingStates.map(s => (
                        <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-foreground">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
                
                <input 
                  type="text" 
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House number and street name *" 
                  className="w-full px-4 py-3 border border-border rounded-md bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground transition-shadow" 
                />
                <input 
                  type="text" 
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  placeholder="Apartment, suite, unit, etc. (optional)" 
                  className="w-full px-4 py-3 border border-border rounded-md bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground transition-shadow" 
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {billingCities.length > 0 || !state ? (
                    <div className="relative">
                      <select 
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        disabled={!state}
                        className="w-full px-4 py-3 border border-border rounded-md bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground appearance-none transition-shadow disabled:opacity-50"
                      >
                        <option value="" disabled className="text-muted-foreground">Town / City *</option>
                        {billingCities.map(c => (
                          <option key={c.name} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-foreground">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  ) : (
                    <input 
                      type="text" 
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Town / City *" 
                      className="w-full px-4 py-3 border border-border rounded-md bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground transition-shadow" 
                    />
                  )}
                  
                  <input 
                    type="text" 
                    required
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="ZIP Code *" 
                    className="w-full px-4 py-3 border border-border rounded-md bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground transition-shadow" 
                  />
                </div>
              </div>
            </section>
            
            {/* Ship to different address */}
            <section className="space-y-6">
              <label className="flex items-center space-x-3 cursor-pointer group w-fit">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    checked={shipToDifferentAddress}
                    onChange={(e) => setShipToDifferentAddress(e.target.checked)}
                    className="peer appearance-none w-5 h-5 border-2 border-border rounded-sm bg-card checked:bg-primary checked:border-primary transition-colors cursor-pointer" 
                  />
                  <svg className="absolute w-3 h-3 text-primary-foreground pointer-events-none opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <span className="font-bold text-foreground text-lg">Ship to a different address?</span>
              </label>

              {shipToDifferentAddress && (
                <div className="space-y-4 pt-4 border-t border-border animate-in fade-in slide-in-from-top-4">
                  <input 
                    type="text" 
                    required={shipToDifferentAddress}
                    value={shippingFullName}
                    onChange={(e) => setShippingFullName(e.target.value)}
                    placeholder="Full name *" 
                    className="w-full px-4 py-3 border border-border rounded-md bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground transition-shadow" 
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <select 
                        required={shipToDifferentAddress}
                        value={shippingCountry}
                        onChange={(e) => {
                          setShippingCountry(e.target.value);
                          setShippingState('');
                          setShippingCity('');
                        }}
                        className="w-full px-4 py-3 border border-border rounded-md bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground appearance-none transition-shadow"
                      >
                        <option value="" disabled className="text-muted-foreground">Country / Region *</option>
                        {Country.getAllCountries().map(c => (
                          <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-foreground">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <select 
                        required={shipToDifferentAddress}
                        value={shippingState}
                        onChange={(e) => {
                          setShippingState(e.target.value);
                          setShippingCity('');
                        }}
                        disabled={!shippingCountry || shippingStates.length === 0}
                        className="w-full px-4 py-3 border border-border rounded-md bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground appearance-none transition-shadow disabled:opacity-50"
                      >
                        <option value="" disabled className="text-muted-foreground">State / Province *</option>
                        {shippingStates.map(s => (
                          <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-foreground">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                  
                  <input 
                    type="text" 
                    required={shipToDifferentAddress}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="House number and street name *" 
                    className="w-full px-4 py-3 border border-border rounded-md bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground transition-shadow" 
                  />
                  <input 
                    type="text" 
                    value={shippingApartment}
                    onChange={(e) => setShippingApartment(e.target.value)}
                    placeholder="Apartment, suite, unit, etc. (optional)" 
                    className="w-full px-4 py-3 border border-border rounded-md bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground transition-shadow" 
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {shippingCities.length > 0 || !shippingState ? (
                      <div className="relative">
                        <select 
                          required={shipToDifferentAddress}
                          value={shippingCity}
                          onChange={(e) => setShippingCity(e.target.value)}
                          disabled={!shippingState}
                          className="w-full px-4 py-3 border border-border rounded-md bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground appearance-none transition-shadow disabled:opacity-50"
                        >
                          <option value="" disabled className="text-muted-foreground">Town / City *</option>
                          {shippingCities.map(c => (
                            <option key={c.name} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-foreground">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    ) : (
                      <input 
                        type="text" 
                        required={shipToDifferentAddress}
                        value={shippingCity}
                        onChange={(e) => setShippingCity(e.target.value)}
                        placeholder="Town / City *" 
                        className="w-full px-4 py-3 border border-border rounded-md bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground transition-shadow" 
                      />
                    )}
                    
                    <input 
                      type="text" 
                      required={shipToDifferentAddress}
                      value={shippingZip}
                      onChange={(e) => setShippingZip(e.target.value)}
                      placeholder="ZIP Code *" 
                      className="w-full px-4 py-3 border border-border rounded-md bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground transition-shadow" 
                    />
                  </div>
                </div>
              )}
            </section>

            {/* Additional Information */}
            <section className="space-y-4">
              <textarea 
                placeholder="Notes about your order, e.g. special notes for delivery." 
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-md bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground resize-y transition-shadow"
              ></textarea>
            </section>
            
            {/* Payment Section */}
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4 border-b border-border pb-2">Payment</h2>
              
              <div className="space-y-4 mt-6">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value="cod" 
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="peer appearance-none w-5 h-5 border-2 border-border rounded-full bg-card checked:border-primary transition-colors cursor-pointer" 
                    />
                    <div className="absolute w-2.5 h-2.5 rounded-full bg-primary pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                  </div>
                  <span className="text-foreground font-medium">Cash on delivery</span>
                </label>
                
                {paymentMethod === 'cod' && (
                  <div className="ml-8 p-4 bg-muted border border-border rounded-md text-sm text-foreground/80">
                    Pay with cash upon delivery.
                  </div>
                )}
                
                <label className="flex items-center space-x-3 cursor-pointer mt-4">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value="online" 
                      checked={paymentMethod === 'online'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="peer appearance-none w-5 h-5 border-2 border-border rounded-full bg-card checked:border-primary transition-colors cursor-pointer" 
                    />
                    <div className="absolute w-2.5 h-2.5 rounded-full bg-primary pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                  </div>
                  <span className="text-foreground font-medium flex items-center flex-wrap gap-2">
                    UPI/Credit Card/Debit Card/NetBanking 
                    <span className="text-xs font-bold italic text-blue-600 flex items-center ml-1">
                      <span className="w-3 h-3 inline-block bg-blue-600 mr-1 rounded-[2px]" style={{ clipPath: 'polygon(0 0, 100% 0, 70% 100%, 0% 100%)' }}></span>
                      Pay by Razorpay
                    </span>
                  </span>
                </label>
              </div>
              
              <div className="mt-8 space-y-6">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <div className="relative flex items-center justify-center mt-1">
                    <input 
                      type="checkbox" 
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="peer appearance-none w-4 h-4 border-2 border-border rounded-sm bg-card checked:bg-primary checked:border-primary transition-colors cursor-pointer" 
                    />
                    <svg className="absolute w-2.5 h-2.5 text-primary-foreground pointer-events-none opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <span className="text-sm text-foreground/80">
                    I have read and agree to the website terms and conditions <span className="text-destructive">*</span>
                  </span>
                </label>
                
                <button 
                  type="submit" 
                  disabled={submittingCheckout || items.length === 0}
                  className="w-full bg-primary hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed text-primary-foreground font-bold py-4 px-8 rounded-md transition-colors flex items-center justify-center space-x-2 shadow-sm"
                >
                  {submittingCheckout ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  <span>Place Order {currSymbol}{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </button>
              </div>
            </section>
          </div>
          
          {/* Right Column - Order Summary */}
          <div className="lg:col-span-5">
            <div className="border border-border p-6 sm:p-8 rounded-md bg-card shadow-sm sticky top-28">
              <h2 className="text-xl font-bold text-foreground mb-6">Your order</h2>
              
              <div className="w-full">
                {/* Table Header */}
                <div className="flex justify-between items-center border-b border-border pb-3 mb-4">
                  <span className="font-bold text-foreground">Product</span>
                  <span className="font-bold text-foreground">Subtotal</span>
                </div>
                
                {/* Dynamic Cart Items */}
                {selectedItems.length === 0 ? (
                  <div className="py-4 text-center text-muted-foreground text-sm">
                    Your cart is empty.
                  </div>
                ) : (
                  selectedItems.map((item) => (
                    <div key={item.id} className="flex justify-between py-4 border-b border-border gap-4">
                      <div className="flex flex-col gap-3">
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-muted rounded-md overflow-hidden shrink-0 border border-border">
                          <Image 
                            src={item.image} 
                            alt={item.name} 
                            fill
                            sizes="(max-width: 640px) 5rem, 6rem"
                            className="object-cover" 
                          />
                        </div>
                        <div className="text-sm text-foreground/90 leading-relaxed max-w-[200px]">
                          {item.name}
                          <div className="mt-1 font-bold text-foreground">x {item.quantity}</div>
                        </div>
                      </div>
                      <div className="text-foreground text-sm mt-1 shrink-0 font-medium">
                        {getCurrencySymbol(item.currency || 'US')}{(item.price * item.quantity).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  ))
                )}
                
                {/* Subtotal */}
                <div className="flex justify-between items-center py-4 border-b border-border text-sm">
                  <span className="text-foreground/80 font-medium">Subtotal</span>
                  <span className="text-foreground font-medium">{currSymbol}{subtotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
                
                {/* Discount (if applicable) */}
                {appliedCoupon && (
                  <div className="flex justify-between items-center py-4 border-b border-border text-sm text-emerald-600">
                    <span className="font-medium">Discount ({appliedCoupon.code})</span>
                    <span className="font-medium">-{currSymbol}{discountAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                
                {/* Tax */}
                <div className="flex justify-between items-center py-4 border-b border-border text-sm">
                  <span className="text-foreground/80 font-medium">Tax (8%)</span>
                  <span className="text-foreground font-medium">{currSymbol}{tax.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
                
                {/* Shipping */}
                <div className="flex justify-between items-start py-4 border-b border-border text-sm">
                  <span className="text-foreground/80 font-medium">Shipping</span>
                  <span className="text-right text-foreground/80 max-w-[150px]">
                    Free
                  </span>
                </div>
                
                {/* Total */}
                <div className="flex justify-between items-center pt-4 text-sm">
                  <span className="text-foreground font-bold">Total</span>
                  <span className="text-primary font-bold text-xl">{currSymbol}{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
          
        </form>
      </div>
    </div>
  );
}
