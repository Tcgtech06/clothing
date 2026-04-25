'use client';

import { Coins } from 'lucide-react';
import CheckoutButton from './CheckoutButton';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Product {
  id: number;
  name: string;
  price: number;
  images: string[];
  rating: number;
  loyaltyPoints?: number;
  firestoreId?: string;
  poll?: {
    best: number;
    good: number;
    average: number;
    worst: number;
  };
}

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  
  // Use firestoreId if available, otherwise use numeric id
  const productLink = product.firestoreId ? `/product/${product.firestoreId}` : `/product/${product.id}`;
  
  // Debug log
  console.log('ProductCard:', {
    name: product.name,
    id: product.id,
    firestoreId: product.firestoreId,
    link: productLink
  });
  
  // Prefetch on hover for instant navigation
  const handleMouseEnter = () => {
    router.prefetch(productLink);
  };
  
  // Calculate poll percentages
  const totalVotes = product.poll 
    ? product.poll.best + product.poll.good + product.poll.average + product.poll.worst 
    : 0;
  
  const getPercentage = (votes: number) => {
    return totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
  };
  
  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden group"
      onMouseEnter={handleMouseEnter}
    >
      {/* Product Image - Clickable - Full Size */}
      <Link href={productLink}>
        <div className="relative h-80 bg-gray-100 overflow-hidden cursor-pointer">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            loading="lazy"
          />
          {/* Loyalty Points Badge */}
          {product.loyaltyPoints && (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5">
              <Coins className="w-4 h-4" />
              <span>+{product.loyaltyPoints}</span>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link href={productLink}>
          <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-primary transition cursor-pointer">
            {product.name}
          </h3>
        </Link>
        
        {/* Poll Results */}
        <div className="mb-3">
          {/* Always show poll bar - gray if no data */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex-1 flex gap-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              {product.poll && totalVotes > 0 ? (
                <>
                  {product.poll.best > 0 && (
                    <div 
                      className="bg-green-500 transition-all" 
                      style={{ width: `${getPercentage(product.poll.best)}%` }}
                      title={`Best: ${product.poll.best} votes`}
                    />
                  )}
                  {product.poll.good > 0 && (
                    <div 
                      className="bg-blue-500 transition-all" 
                      style={{ width: `${getPercentage(product.poll.good)}%` }}
                      title={`Good: ${product.poll.good} votes`}
                    />
                  )}
                  {product.poll.average > 0 && (
                    <div 
                      className="bg-yellow-500 transition-all" 
                      style={{ width: `${getPercentage(product.poll.average)}%` }}
                      title={`Average: ${product.poll.average} votes`}
                    />
                  )}
                  {product.poll.worst > 0 && (
                    <div 
                      className="bg-red-500 transition-all" 
                      style={{ width: `${getPercentage(product.poll.worst)}%` }}
                      title={`Worst: ${product.poll.worst} votes`}
                    />
                  )}
                </>
              ) : null}
            </div>
          </div>
          {/* Always show color dots and counts */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">{product.poll?.best || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">{product.poll?.good || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-600">{product.poll?.average || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-gray-600">{product.poll?.worst || 0}</span>
              </div>
            </div>
            <span className="text-gray-500 font-medium">{totalVotes} votes</span>
          </div>
        </div>

        {/* Price and Add to Cart */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-primary">₹{product.price.toLocaleString('en-IN')}</p>
          </div>
          <CheckoutButton 
            productName={product.name} 
            productPrice={product.price} 
            productId={product.id}
            firestoreId={product.firestoreId}
          />
        </div>
      </div>
    </div>
  );
}
