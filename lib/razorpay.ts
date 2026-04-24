import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay instance (server-side only)
export const razorpayInstance = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Create Razorpay order
export async function createRazorpayOrder(amount: number, currency: string = 'INR') {
  try {
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise (1 INR = 100 paise)
      currency: currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        description: 'E-Commerce Purchase',
      },
    };

    const order = await razorpayInstance.orders.create(options);
    return order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
}

// Verify Razorpay payment signature
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  try {
    const text = `${orderId}|${paymentId}`;
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest('hex');

    return generatedSignature === signature;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

// Load Razorpay script in browser
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    // Check if script already loaded
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// Open Razorpay payment modal
export async function openRazorpayModal(
  options: {
    orderId: string;
    amount: number;
    currency: string;
    name: string;
    email: string;
    phone: string;
    description?: string;
  },
  onSuccess: (response: any) => void,
  onFailure: (error: any) => void
) {
  // Load Razorpay script
  const scriptLoaded = await loadRazorpayScript();
  
  if (!scriptLoaded) {
    alert('Failed to load Razorpay SDK. Please check your internet connection.');
    return;
  }

  const razorpayOptions = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    amount: options.amount * 100, // Amount in paise
    currency: options.currency,
    name: 'E-Shop', // Your business name
    description: options.description || 'Purchase from E-Shop',
    order_id: options.orderId,
    prefill: {
      name: options.name,
      email: options.email,
      contact: options.phone,
    },
    theme: {
      color: '#8B5CF6', // Your primary color
    },
    handler: function (response: any) {
      // Payment successful
      onSuccess(response);
    },
    modal: {
      ondismiss: function () {
        // User closed the modal
        onFailure({ error: 'Payment cancelled by user' });
      },
    },
  };

  const razorpay = new (window as any).Razorpay(razorpayOptions);
  
  razorpay.on('payment.failed', function (response: any) {
    // Payment failed
    onFailure(response.error);
  });

  razorpay.open();
}
