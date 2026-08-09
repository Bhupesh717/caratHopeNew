'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { PageHeader } from '@/components/page-header';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { getCurrencySymbol } from '@/lib/utils';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, clearCart, appliedCoupon, applyCoupon, toggleSelection, toggleAllSelection } = useCartStore();
  const [mounted, setMounted] = useState(false);

  // Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Derive the cart's display currency from the first item (all items should be same session)
  const cartCurrency = items.length > 0 ? (items[0].currency || 'US') : 'US';
  const currSymbol = getCurrencySymbol(cartCurrency);

  // Calculations
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

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    try {
      setValidatingCoupon(true);
      const response = await apiClient.post('/public/coupons/validate', {
        code: couponInput.trim(),
      });
      if (response.data && response.data.success) {
        applyCoupon(response.data.data);
        toast.success(`Coupon "${couponInput.toUpperCase()}" applied successfully!`);
      } else {
        toast.error(response.data?.message || 'Invalid coupon code.');
      }
    } catch (err: any) {
      console.error(err);
      if (!err.response) {
        toast.error('Failed to validate coupon code.');
      }
    } finally {
      setValidatingCoupon(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="border-t border-neutral-200">
        <PageHeader
          eyebrow="Your Bag"
          icon={ShoppingBag}
          title="Shopping"
          accentTitle="Cart"
          subtitle="Review your selected pieces before proceeding to checkout."
          imageSrc="/page_heaer.png"
        />

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-6 px-6 py-16">
          <div className="rounded-full bg-neutral-100 p-6">
            <ShoppingBag className="h-12 w-12 text-neutral-400" />
          </div>
          <h2 className="text-2xl font-light text-neutral-900">Your Cart is Empty</h2>
          <p className="text-center text-neutral-600">
            Add items to your cart to see them here.
          </p>
          <Button asChild className="bg-neutral-900 text-white hover:bg-neutral-800">
            <Link href="/shop">
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-neutral-200">
      <PageHeader
        eyebrow="Your Bag"
        icon={ShoppingBag}
        title="Shopping"
        accentTitle="Cart"
        subtitle="Review your selected pieces before proceeding to checkout."
        imageSrc="/page_heaer.png"
      />

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.length > 0 && (
              <div className="flex items-center gap-3 border-b border-neutral-200 pb-2">
                <input
                  type="checkbox"
                  checked={items.every(item => item.selected !== false)}
                  onChange={(e) => toggleAllSelection(e.target.checked)}
                  className="w-4 h-4 accent-emerald-dark shrink-0 cursor-pointer rounded border-neutral-300"
                  id="select-all"
                />
                <label htmlFor="select-all" className="text-sm text-neutral-900 font-medium cursor-pointer uppercase tracking-wider">
                  Select All Items
                </label>
              </div>
            )}
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 border-b border-neutral-200 py-4 items-center">
                <input
                  type="checkbox"
                  checked={item.selected !== false}
                  onChange={() => toggleSelection(item.id)}
                  className="w-4 h-4 accent-emerald-dark shrink-0 cursor-pointer rounded border-neutral-300"
                />
                <Image
                  src={item.image}
                  alt={item.name}
                  width={96}
                  height={96}
                  className="h-24 w-24 object-cover rounded"
                />
                <div className="flex-1">
                  <Link href={`/product/${item.id}`}>
                    <h3 className="font-light text-neutral-900 hover:text-neutral-600">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-neutral-600">{getCurrencySymbol(item.currency || 'US')}{item.price.toLocaleString()}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.id, Math.max(1, item.quantity - 1))
                      }
                      className="h-8 w-8 rounded border border-neutral-200 hover:bg-neutral-100"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(item.id, parseInt(e.target.value) || 1)
                      }
                      className="h-8 w-12 rounded border border-neutral-200 text-center text-sm"
                    />
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                      className="h-8 w-8 rounded border border-neutral-200 hover:bg-neutral-100"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="font-light text-neutral-900">
                    {getCurrencySymbol(item.currency || 'US')}{(item.price * item.quantity).toLocaleString()}
                  </p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="h-fit rounded-lg border border-neutral-200 p-6 bg-muted">
            <h3 className="mb-4 text-lg font-light text-neutral-900">Order Summary</h3>

            {/* Coupon Code Panel */}
            <div className="mb-6 pb-6 border-b border-neutral-200 space-y-2">
              <label className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Promo Code</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter coupon code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  disabled={!!appliedCoupon || validatingCoupon}
                  className="h-10 border-neutral-200 bg-white"
                />
                {appliedCoupon ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      applyCoupon(null);
                      setCouponInput('');
                    }}
                    className="h-10 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 font-sans text-xs tracking-wider"
                  >
                    Remove
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleApplyCoupon}
                    disabled={!couponInput.trim() || validatingCoupon}
                    className="h-10 font-sans text-xs tracking-wider"
                  >
                    {validatingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                  </Button>
                )}
              </div>
              {appliedCoupon && (
                <p className="text-xs text-emerald-600 font-medium">
                  Coupon applied! {appliedCoupon.discount_type === 'percentage' ? `${appliedCoupon.discount_value}%` : `${currSymbol}${appliedCoupon.discount_value}`} discount.
                </p>
              )}
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between text-neutral-600 text-sm">
                <span>Subtotal</span>
                <span>{currSymbol}{subtotal.toLocaleString()}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 text-sm">
                  <span>Discount</span>
                  <span>-{currSymbol}{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600 text-sm">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between text-neutral-600 text-sm">
                <span>Tax (8%)</span>
                <span>{currSymbol}{tax.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="border-t border-neutral-200 pt-3 flex justify-between font-semibold text-lg text-neutral-900">
                <span>Total</span>
                <span>{currSymbol}{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
            </div>
            <Button 
              asChild 
              disabled={items.filter(i => i.selected !== false).length === 0}
              className={`mt-6 w-full py-6 ${items.filter(i => i.selected !== false).length === 0 ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed pointer-events-none' : 'bg-neutral-900 text-white hover:bg-neutral-800'}`}
            >
              <Link href="/checkout" className="block w-full">
                Proceed to Checkout ({items.filter(i => i.selected !== false).length} items)
              </Link>
            </Button>
            <Button asChild variant="outline" className="mt-3 w-full border-neutral-200 bg-white py-6">
              <Link href="/shop" className="block w-full">
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
