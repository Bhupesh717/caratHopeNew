'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Image from 'next/image';

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const verifyRegisterEmail = useAuthStore((state) => state.verifyRegisterEmail);
  const resendRegisterOtp = useAuthStore((state) => state.resendRegisterOtp);

  const [hasSentOtp, setHasSentOtp] = useState(!!initialEmail);
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');

  // Timer state
  const [timeLeft, setTimeLeft] = useState(initialEmail ? 60 : 0);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!email) throw new Error('Please enter your email');
      if (!otp) throw new Error('Please enter the OTP');

      await verifyRegisterEmail(email.trim(), otp);
      router.push('/');
    } catch (err: any) {
      const errMsg = err.message || 'Verification failed. Please check the OTP.';
      setError(errMsg);
      if (err.message === 'Please enter the OTP' || err.message === 'Please enter your email') {
        toast.error(errMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!email) {
      toast.error('Please enter your email to send/resend OTP');
      return;
    }
    setIsResending(true);
    setError('');
    try {
      await resendRegisterOtp(email.trim());
      setHasSentOtp(true);
      setTimeLeft(60);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={(e) => {
      e.preventDefault();
      if (hasSentOtp) {
        handleVerifyOtp(e);
      } else {
        handleSendOtp();
      }
    }}>
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center border border-red-100">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700">Email Address *</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={hasSentOtp}
            className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-[var(--primary)] focus:border-primary bg-slate-50/50 text-sm transition-colors disabled:opacity-60"
            placeholder="Enter your email"
          />
        </div>
      </div>

      {!hasSentOtp ? (
        <div>
          <Button
            type="button"
            onClick={handleSendOtp}
            disabled={isResending || !email}
            className="w-full flex justify-center py-6 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none transition-all duration-300"
          >
            {isResending ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            ) : (
              'Send OTP'
            )}
          </Button>
        </div>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium text-slate-700">Enter OTP *</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-[var(--primary)] focus:border-primary bg-slate-50/50 text-sm transition-colors text-center tracking-widest text-lg"
                placeholder="Please enter OTP"
                maxLength={6}
              />
            </div>
            <div className="mt-2 flex justify-between items-center text-sm">
              <button
                type="button"
                onClick={() => {
                  setHasSentOtp(false);
                  setTimeLeft(0);
                  setOtp('');
                }}
                className="text-slate-500 hover:text-primary transition-colors"
              >
                Change Email
              </button>

              {timeLeft > 0 ? (
                <span className="text-slate-500">Resend OTP in {timeLeft}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isResending}
                  className="text-primary hover:text-primary/90 font-medium disabled:opacity-50 transition-colors"
                >
                  {isResending ? 'Sending...' : 'Resend OTP'}
                </button>
              )}
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={isLoading || !otp}
              className="w-full flex justify-center py-6 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none transition-all duration-300 animate-pulse-subtle"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Verify & Complete Registration
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </div>
        </>
      )}

      <div className="mt-4 text-center">
        <Link
          href="/register"
          className="text-sm text-slate-500 hover:text-primary transition-colors"
        >
          Back to Registration Form
        </Link>
      </div>
    </form>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-muted flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">

        <h2 className="mt-6 text-center text-3xl font-serif text-foreground">
          Verify Email
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Enter the OTP sent to your email to verify your account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white py-10 px-6 shadow-xl shadow-[var(--primary)]/5 rounded-3xl border border-border/60 sm:px-12"
        >
          <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
            <VerifyEmailForm />
          </Suspense>
        </motion.div>
      </div>
    </div>
  );
}
