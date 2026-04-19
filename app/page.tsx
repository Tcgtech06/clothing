'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import HeroSlideshow from '@/components/HeroSlideshow';
import { products as staticProducts, Product as StaticProduct } from '@/data/products';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

export default function Home() {
  const [products, setProducts] = useState<StaticProduct[]>(staticProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      // Try to load from Firestore
      const q = query(
        collection(db, 'products'),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const firestoreProducts: StaticProduct[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          firestoreProducts.push({
            id: parseInt(doc.id.substring(0, 8), 16), // Convert Firestore ID to number
            firestoreId: doc.id, // Store original Firestore ID for linking
            name: data.name || '',
            price: data.price || 0,
            originalPrice: data.originalPrice,
            images: data.images || [],
            rating: data.rating || 4.5,
            reviews: data.reviews || 0,
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
        
        // Combine Firestore products with static products
        setProducts([...firestoreProducts, ...staticProducts]);
        console.log('Loaded products from Firestore:', firestoreProducts.length);
      } else {
        // Use static products if Firestore is empty
        setProducts(staticProducts);
        console.log('Using static products');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      // Fallback to static products
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
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-96"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
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
