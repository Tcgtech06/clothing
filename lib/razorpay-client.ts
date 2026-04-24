// Client-side only - Safe to import in client components

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
