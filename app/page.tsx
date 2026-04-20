'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import HeroSlideshow from '@/components/HeroSlideshow';
import { products as staticProducts, Product as StaticProduct } from '@/data/products';
import { CATEGORIES } from '@/data/categories';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

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
    <div className="min-h-screen">
      {/* Hero Slideshow Section */}
      <HeroSlideshow />

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">Featured Products</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {loading && (
          <div className="text-center mt-4">
            <p className="text-sm text-gray-500">Loading more products...</p>
          </div>
        )}
      </section>

      {/* Categories Preview */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((category) => (
            <div
              key={category}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer text-center"
            >
              <h3 className="font-semibold text-lg text-gray-800">{category}</h3>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
