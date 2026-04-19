'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import { products, getProductById } from '@/data/products';
import ProductDetailClient from '@/components/ProductDetailClient';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function ProductPage() {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      // Try to get from static products first (numeric ID)
      const numericId = parseInt(id);
      if (!isNaN(numericId)) {
        const staticProduct = getProductById(numericId);
        if (staticProduct) {
          setProduct(staticProduct);
          setLoading(false);
          return;
        }
      }

      // Try to get from Firestore (string ID)
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const firestoreProduct = {
          id: numericId || parseInt(docSnap.id.substring(0, 8), 16),
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
        };
        
        setProduct(firestoreProduct);
      } else {
        setNotFoundError(true);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setNotFoundError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (notFoundError || !product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
