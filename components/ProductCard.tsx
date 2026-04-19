import { Star } from 'lucide-react';
import CheckoutButton from './CheckoutButton';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  price: number;
  images: string[];
  rating: number;
  loyaltyPoints?: number;
  firestoreId?: string; // For Firestore products
}

export default function ProductCard({ product }: { product: Product }) {
  // Use firestoreId if available, otherwise use numeric id
  const productLink = product.firestoreId ? `/product/${product.firestoreId}` : `/product/${product.id}`;
  
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden group">
      {/* Product Image - Clickable - Full Size */}
      <Link href={productLink}>
        <div className="relative h-80 bg-gray-100 overflow-hidden cursor-pointer">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
          {/* Loyalty Points Badge */}
          {product.loyaltyPoints && (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
              🎁 +{product.loyaltyPoints}
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
        
        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm text-gray-600">{product.rating}</span>
          <span className="text-xs text-gray-400">(128 reviews)</span>
        </div>

        {/* Price and Add to Cart */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-primary">₹{product.price.toLocaleString('en-IN')}</p>
          </div>
          <CheckoutButton productName={product.name} productPrice={product.price} productId={product.id} />
        </div>
      </div>
    </div>
  );
}
