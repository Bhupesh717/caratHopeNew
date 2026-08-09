"use client";

import React, { useState, useEffect } from 'react';
import { PackageSearch, Mail, KeyRound, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function TrackOrderPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoOtpMessage, setDemoOtpMessage] = useState('');

  const { sendOtp, verifyOtp, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/orders');
    }
  }, [isAuthenticated, router]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');

    setLoading(true);
    try {
      const response = await sendOtp(email);
      setStep(2);
      toast.success('OTP sent to your email');
      // Show demo OTP for easy testing
      if (response && response.toString().length === 6) {
        setDemoOtpMessage(`[DEMO MODE] Your OTP is: ${response}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return toast.error('Please enter the OTP');

    setLoading(true);
    try {
      await verifyOtp(email, otp);
      toast.success('Verified successfully!');
      router.push('/orders');
    } catch (err: any) {
      toast.error(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-20 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
            <PackageSearch className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-serif text-foreground mb-4">Track Your Orders</h1>
          <p className="text-muted-foreground leading-relaxed">
            Enter the email address you used during checkout to view your order history and track recent purchases.
          </p>
        </div>

        <div className="bg-card border border-border p-8 rounded-2xl shadow-sm">
          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your billing email"
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                    required
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full h-12">
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                Send Access Code
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              {demoOtpMessage && (
                <div className="bg-amber-50 text-amber-800 p-4 rounded-md text-sm font-medium border border-amber-200">
                  {demoOtpMessage}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">6-Digit Code</label>
                <p className="text-xs text-muted-foreground mb-3">
                  We've sent a one-time code to <strong>{email}</strong>
                </p>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full pl-10 pr-4 py-3 text-lg tracking-widest border border-border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow text-center font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full h-12 group">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <>
                    Verify & View Orders
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
              
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground mt-4"
              >
                Use a different email
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
