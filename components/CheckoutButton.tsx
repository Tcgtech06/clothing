'use client';

import { ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CheckoutButtonProps {
  productName: string;
  productPrice: number;
  productId?: number;
}

export default function CheckoutButton({ productName, productPrice, productId }: CheckoutButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (productId) {
      router.push(`/product/${productId}`);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition font-semibold flex items-center justify-center gap-2 text-sm"
    >
      <ShoppingCart className="w-4 h-4" />
      Buy
    </button>
  );
}
