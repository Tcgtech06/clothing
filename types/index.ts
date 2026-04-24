// Type definitions for the E-Commerce PWA

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  rating: number;
  description?: string;
  category?: string;
  stock?: number;
  reviews?: number;
}

export interface Category {
  id: number;
  name: string;
  count: number;
  image?: string;
  description?: string;
}

export interface Order {
  id: string;
  date: string;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: number;
  products: string[];
  shippingAddress?: Address;
  trackingNumber?: string;
  deliveredAt?: any;
  returnRequest?: ReturnRequest;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  customerEmail: string;
  customerName: string;
  reason: string;
  paymentMethod: 'upi' | 'bank';
  upiId?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;
  requestedAt: any;
  status: 'pending' | 'approved' | 'rejected' | 'refunded';
  returnStatus?: 'pending' | 'approved' | 'pickup-scheduled' | 'picked-up' | 'return-successful' | 'refund-initiated' | 'refund-completed';
  adminNotes?: string;
  total: number;
  products: string[];
  returnTrackingHistory?: Array<{
    status: string;
    date: string;
    description: string;
  }>;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface LoyaltyReward {
  id: number;
  name: string;
  points: number;
  icon: any; // Lucide icon component
  description?: string;
}

export interface LoyaltyHistory {
  id: number;
  action: string;
  points: number;
  date: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  loyaltyPoints: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  avatar?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}
