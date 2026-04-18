import { Star } from 'lucide-react';
import CheckoutButton from './CheckoutButton';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  rating: number;
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden group">
      {/* Product Image - Clickable */}
      <Link href={`/product/${product.id}`}>
        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden cursor-pointer">
          <div className="text-gray-400 text-sm">Product Image</div>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link href={`/product/${product.id}`}>
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
            <p className="text-2xl font-bold text-primary">${product.price}</p>
          </div>
          <CheckoutButton productName={product.name} productPrice={product.price} />
        </div>
      </div>
    </div>
  );
}
