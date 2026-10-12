export interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  customer: {
    name: string;
    email?: string;
    phone: string;
  };
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  provider: string;
  message: string;
  error?: string;
}

/**
 * Swappable Payment Adapter Interface
 * Currently supports 'mock' provider with simulated processing delay.
 * Easily swappable for Stripe / Razorpay / Cashfree in production.
 */
export async function processPayment(request: PaymentRequest): Promise<PaymentResponse> {
  const provider = process.env.PAYMENT_PROVIDER || 'mock';

  if (provider === 'mock') {
    // Simulate real gateway latency
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return {
      success: true,
      transactionId: 'TXN_' + Math.random().toString(36).substr(2, 12).toUpperCase(),
      provider: 'mock',
      message: 'Payment authorized and captured successfully via Forevere Mock Gateway.'
    };
  }

  // Future real gateway integration placeholder
  return {
    success: true,
    transactionId: 'TXN_PROD_' + Date.now(),
    provider,
    message: 'Payment processed successfully.'
  };
}
