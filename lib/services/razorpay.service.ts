import { apiClient } from '@/lib/api-client';

export interface AddressPayload {
  line1?: string;
  address?: string;
  apartment?: string;
  city: string;
  state: string;
  pincode?: string;
  zip?: string;
  country: string;
}

export interface ShippingAddressPayload extends AddressPayload {
  full_name?: string;
}

export interface CheckoutItemPayload {
  product_id: number;
  quantity: number;
}

export interface CheckoutRequestPayload {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  billing_address: AddressPayload;
  shipping_address?: ShippingAddressPayload;
  notes?: string;
  payment_method: 'razorpay' | 'cod' | string;
  items: CheckoutItemPayload[];
  coupon_code?: string | null;
}

export interface RazorpayPaymentData {
  key: string;
  razorpay_order_id: string;
  amount: number;
  currency: string;
  name?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
}

export interface CheckoutResponseData {
  order_id: number | string;
  subtotal: number;
  discount_amount: number;
  gst_amount: number;
  total_amount: number;
  currency: string;
  payment: RazorpayPaymentData | null;
  message?: string;
}

export interface CheckoutApiResponse {
  success: boolean;
  data: CheckoutResponseData;
  message?: string;
}

export interface RazorpayVerifyPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayVerifyResponse {
  success: boolean;
  message?: string;
  data?: {
    order_id: number | string;
    payment_status: string;
    order_status: string;
  };
}

export interface OpenRazorpayOptions {
  paymentData: RazorpayPaymentData;
  orderId: string | number;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  onSuccess: (verifyResponse: RazorpayVerifyResponse, paymentResponse: RazorpayVerifyPayload) => void;
  onError: (error: any) => void;
  onDismiss?: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

/**
 * Dynamically loads the official Razorpay checkout script (checkout.js)
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      return resolve(false);
    }

    if (window.Razorpay) {
      return resolve(true);
    }

    const existingScript = document.getElementById('razorpay-checkout-js') as HTMLScriptElement | null;
    if (existingScript) {
      if (window.Razorpay) return resolve(true);
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.id = 'razorpay-checkout-js';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay Checkout SDK');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const razorpayService = {
  /**
   * 1. Checkout API
   * POST /public/orders/checkout
   * Creates local order and generates Razorpay Order if payment_method is 'razorpay'
   */
  checkout: async (payload: CheckoutRequestPayload): Promise<CheckoutApiResponse> => {
    const response = await apiClient.post<CheckoutApiResponse>('/public/orders/checkout', payload);
    return response.data;
  },

  /**
   * 2. Verify Payment API
   * POST /public/payments/razorpay/verify
   * Verifies razorpay signature and marks local order as paid
   */
  verifyPayment: async (payload: RazorpayVerifyPayload): Promise<RazorpayVerifyResponse> => {
    const response = await apiClient.post<RazorpayVerifyResponse>('/public/payments/razorpay/verify', payload);
    return response.data;
  },

  /**
   * Helper to load Razorpay script
   */
  loadScript: loadRazorpayScript,

  /**
   * Helper to open the Razorpay Checkout modal and trigger verifyPayment on success
   */
  openRazorpayModal: async ({
    paymentData,
    orderId,
    customer,
    onSuccess,
    onError,
    onDismiss,
  }: OpenRazorpayOptions): Promise<void> => {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded || !window.Razorpay) {
      const err = new Error('Razorpay SDK could not be loaded. Please check your network connection.');
      onError(err);
      return;
    }

    const options = {
      key: paymentData.key,
      amount: paymentData.amount,
      currency: paymentData.currency || 'INR',
      name: paymentData.name || 'Carat Hope',
      description: `Order #${orderId}`,
      order_id: paymentData.razorpay_order_id,
      prefill: {
        name: paymentData.prefill?.name || customer.name,
        email: paymentData.prefill?.email || customer.email,
        contact: paymentData.prefill?.contact || customer.phone,
      },
      theme: {
        color: '#1a1a1a',
      },
      handler: async (response: RazorpayVerifyPayload) => {
        try {
          const verifyResult = await razorpayService.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          onSuccess(verifyResult, response);
        } catch (error) {
          onError(error);
        }
      },
      modal: {
        ondismiss: () => {
          if (onDismiss) onDismiss();
        },
      },
    };

    const rzpInstance = new window.Razorpay(options);

    rzpInstance.on('payment.failed', (failedResponse: any) => {
      onError(failedResponse?.error || new Error('Payment failed'));
    });

    rzpInstance.open();
  },
};
