'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth';
import { GoogleLogin } from '@react-oauth/google';
import { User, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const loginSendOtp = useAuthStore((state) => state.loginSendOtp);
  const loginVerifyOtp = useAuthStore((state) => state.loginVerifyOtp);
  const googleLogin = useAuthStore((state) => state.googleLogin);

  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [hasSentOtp, setHasSentOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');

  // Timer state
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  const getInputType = (val: string) => val.includes('@') ? 'email' : 'phone';

  const handleSendOtp = async () => {
    if (!identifier) {
      toast.error('Please enter your email or phone number');
      return;
    }
    setIsResending(true);
    setError('');
    try {
      const type = getInputType(identifier);
      await loginSendOtp(identifier.trim(), type);
      setHasSentOtp(true);
      setTimeLeft(60);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!identifier) throw new Error('Please enter your email or phone number');
      if (!otp) throw new Error('Please enter the OTP');

      const type = getInputType(identifier);
      await loginVerifyOtp(identifier.trim(), type, otp);

      router.push('/');
    } catch (err: any) {
      const errMsg = err.message || 'Verification failed. Please check the OTP.';
      setError(errMsg);
      if (err.message === 'Please enter the OTP' || err.message === 'Please enter your email or phone number') {
        toast.error(errMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">

        <h2 className="text-center text-3xl font-serif text-foreground">
          Welcome Back
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Sign in to access your wishlist and exclusive collections.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white py-10 px-6 shadow-xl shadow-[var(--primary)]/5 rounded-3xl border border-border/60 sm:px-12"
        >
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
              <label className="block text-sm font-medium text-slate-700">Email or Phone Number *</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={hasSentOtp}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-[var(--primary)] focus:border-primary bg-slate-50/50 text-sm transition-colors disabled:opacity-60"
                  placeholder="e.g. rahul@example.com or +919876543210"
                />
              </div>
            </div>

            {!hasSentOtp ? (
              <div>
                <Button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isResending || !identifier}
                  className="w-full flex justify-center py-6 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none transition-all duration-300"
                >
                  {isResending ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending OTP...
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
                      Change Email/Phone
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
                        Signing in...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Verify & Sign In
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </div>
              </>
            )}
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-slate-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  if (credentialResponse.credential) {
                    setIsLoading(true);
                    setError('');
                    try {
                      await googleLogin(credentialResponse.credential);
                      router.push('/');
                    } catch (err: any) {
                      setError(err.message || 'Google login failed');
                      toast.error(err.message || 'Google login failed');
                    } finally {
                      setIsLoading(false);
                    }
                  }
                }}
                onError={() => {
                  setError('Google login failed');
                  toast.error('Google login failed');
                }}
                shape="rectangular"
                theme="outline"
                size="large"
                width="100%"
              />
            </div>
          </div>

          <div className="mt-8 text-center text-sm">
            <span className="text-slate-500">Don't have an account? </span>
            <Link href="/register" className="font-medium text-primary hover:text-primary/90 transition-colors relative group">
              Create one
              <span className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-primary transition-all group-hover:w-full"></span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
