'use client';

import { useFavourites } from '@/lib/favourites-context';
import ProductCard from '@/components/ProductCard';
import { Heart, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function FavouritesPage() {
  const { favourites, removeFromFavourites } = useFavourites();

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-20 md:pt-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-8 h-8 text-red-500 fill-red-500" />
          <h1 className="text-3xl font-bold text-gray-800">My Favourites</h1>
        </div>

        {favourites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">No Favourites Yet</h2>
            <p className="text-gray-500 mb-6">
              Start adding products to your favourites by clicking the heart icon on any product.
            </p>
            <Link
              href="/"
              className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition font-semibold"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-6">
              You have {favourites.length} {favourites.length === 1 ? 'item' : 'items'} in your favourites
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favourites.map((product) => (
                <div key={product.id} className="relative group">
                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromFavourites(product.id)}
                    className="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-red-50 transition shadow-lg group-hover:scale-110"
                    aria-label="Remove from favourites"
                  >
                    <X className="w-5 h-5 text-red-500" />
                  </button>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
