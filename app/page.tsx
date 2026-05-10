'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import HeroSlideshow from '@/components/HeroSlideshow';
import { products as staticProducts, Product as StaticProduct } from '@/data/products';
import { CATEGORIES } from '@/data/categories';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Sparkles, TrendingUp, Award, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

// No caching - always fetch fresh data
export default function Home() {
  const [products, setProducts] = useState<StaticProduct[]>(staticProducts);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    
    try {
      // Load Firestore products with real-time listener
      const q = query(
        collection(db, 'products'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      
      // Use onSnapshot for real-time updates
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const firestoreProducts: StaticProduct[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            firestoreProducts.push({
              id: parseInt(doc.id.substring(0, 8), 16),
              firestoreId: doc.id,
              name: data.name || '',
              price: data.price || 0,
              originalPrice: data.originalPrice,
              images: data.images || [],
              rating: data.rating || 4.5,
              reviews: data.reviews || 0,
              poll: data.poll || { best: 0, good: 0, average: 0, worst: 0 },
              description: data.description || '',
              category: data.category || '',
              features: data.features || [],
              specifications: data.specifications || {},
              inStock: data.inStock !== false,
              colors: data.colors || [],
              sizes: data.sizes || [],
              loyaltyPoints: data.loyaltyPoints || 0,
            } as any);
          });
          
          // Combine with static products
          const allProducts = [...firestoreProducts, ...staticProducts];
          setProducts(allProducts);
          
          console.log('Real-time update: Loaded products from Firestore:', firestoreProducts.length);
        } else {
          setProducts(staticProducts);
        }
        setLoading(false);
      });

      // Cleanup listener on unmount
      return () => unsubscribe();
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts(staticProducts);
      setLoading(false);
    }
  };

  const featuredProducts = products.slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-purple-100/50 to-purple-50">
      {/* Hero Slideshow Section */}
      <HeroSlideshow />

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-700 bg-clip-text text-transparent">
            Featured Collection
          </h2>
          <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
            Discover our handpicked selection of premium fashion pieces
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {loading && (
          <div className="text-center mt-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-lavender-200 border-t-lavender-500"></div>
            <p className="text-sm text-gray-500 mt-2">Loading more products...</p>
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            href="/category"
            className="inline-block bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-3 md:px-10 md:py-4 rounded-full hover:from-purple-600 hover:to-purple-700 transition font-semibold text-sm md:text-base shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            View All Products
          </Link>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="bg-gradient-to-b from-purple-100/30 to-purple-50 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-700 bg-clip-text text-transparent">
              Shop by Category
            </h2>
            <p className="text-gray-600 text-sm md:text-base">
              Explore our curated collections
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {CATEGORIES.map((category, index) => (
              <Link
                key={category}
                href="/category"
                className="group relative overflow-hidden bg-purple-50/80 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer text-center transform hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-purple-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <h3 className="font-bold text-base md:text-lg text-gray-800 group-hover:text-purple-600 transition">
                    {category}
                  </h3>
                  <p className="text-xs text-gray-500 mt-2 hidden md:block">Explore Collection</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4">
            Join Our Exclusive Club
          </h2>
          <p className="text-white/90 text-sm md:text-base mb-6 md:mb-8">
            Subscribe to get special offers, free giveaways, and exclusive deals
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 md:px-6 py-3 md:py-4 rounded-full focus:outline-none focus:ring-4 focus:ring-white/50 text-sm md:text-base bg-purple-50"
            />
            <button className="bg-purple-50 text-purple-600 px-6 md:px-8 py-3 md:py-4 rounded-full hover:bg-purple-100 transition font-semibold text-sm md:text-base shadow-lg">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
