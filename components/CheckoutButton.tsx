'use client';

import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';

interface CheckoutButtonProps {
  productName: string;
  productPrice: number;
  productId: number;
  firestoreId?: string;
}

export default function CheckoutButton({ productName, productPrice, productId, firestoreId }: CheckoutButtonProps) {
  // Use firestoreId if available, otherwise use numeric id
  const productLink = firestoreId ? `/product/${firestoreId}` : `/product/${productId}`;
  
  return (
    <Link
      href={productLink}
      className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition font-semibold flex items-center justify-center gap-2 text-sm"
    >
      <ShoppingCart className="w-4 h-4" />
      Buy
    </Link>
  );
}
