'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import HeroSlideshow from '@/components/HeroSlideshow';
import { products as staticProducts, Product as StaticProduct } from '@/data/products';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

// Cache for products
let cachedProducts: StaticProduct[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default function Home() {
  const [products, setProducts] = useState<StaticProduct[]>(staticProducts);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    // Check cache first
    const now = Date.now();
    if (cachedProducts && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('Using cached products');
      setProducts(cachedProducts);
      return;
    }

    setLoading(true);
    
    try {
      // Load Firestore products in background
      const q = query(
        collection(db, 'products'),
        orderBy('createdAt', 'desc'),
        limit(10) // Reduced from 20 to 10 for faster loading
      );
      
      const snapshot = await getDocs(q);
      
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
        
        // Combine and cache
        const allProducts = [...firestoreProducts, ...staticProducts];
        cachedProducts = allProducts;
        cacheTimestamp = Date.now();
        setProducts(allProducts);
        
        console.log('Loaded and cached products from Firestore:', firestoreProducts.length);
      } else {
        setProducts(staticProducts);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts(staticProducts);
    } finally {
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
          {['Women Dresses', 'Men Clothing', 'Accessories', 'Footwear'].map((category) => (
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
