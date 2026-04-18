import { Star } from 'lucide-react';
import CheckoutButton from './CheckoutButton';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id: number;
  name: string;
  price: number;
  images: string[];
  rating: number;
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden group">
      {/* Product Image - Clickable */}
      <Link href={`/product/${product.id}`}>
        <div className="relative h-48 bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition duration-300"
          />
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
            <p className="text-2xl font-bold text-primary">₹{product.price.toLocaleString('en-IN')}</p>
          </div>
          <CheckoutButton productName={product.name} productPrice={product.price} productId={product.id} />
        </div>
      </div>
    </div>
  );
}
