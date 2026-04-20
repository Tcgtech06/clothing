'use client';

import { useState, useEffect } from 'react';
import { Filter, ChevronDown, X, SlidersHorizontal, Shirt, ShoppingBag, Watch, Footprints, Tag, ArrowUpDown } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { products as staticProducts } from '@/data/products';
import { CATEGORIES } from '@/data/categories';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/data/products';

type SortOption = 'default' | 'price-low-high' | 'price-high-low' | 'rating';

import type { LucideIcon } from 'lucide-react';

const categoryIcons: Record<string, LucideIcon> = {
  'Women Dresses': Shirt,
  'Men Clothing': ShoppingBag,
  'Accessories': Watch,
  'Footwear': Footprints,
};

export default function CategoryPage() {
  const [allProducts, setAllProducts] = useState<Product[]>(staticProducts);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [showFilter, setShowFilter] = useState(false);

  // Load Firestore products and merge with static
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      const firestoreProducts: Product[] = snapshot.docs.map((doc) => ({
        id: doc.id as any,
        firestoreId: doc.id,
        ...doc.data(),
      } as Product));
      setAllProducts([...staticProducts, ...firestoreProducts]);
    });
    return () => unsubscribe();
  }, []);

  const categories = ['All', ...CATEGORIES];

  const filtered = allProducts
    .filter((p) => selectedCategory === 'All' || p.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === 'price-low-high') return a.price - b.price;
      if (sortBy === 'price-high-low') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

  const getCategoryCount = (cat: string) =>
    cat === 'All'
      ? allProducts.length
      : allProducts.filter((p) => p.category === cat).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Categories</h1>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition"
          >
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-gray-700">Filter & Sort</span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showFilter ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filter Panel */}
        {showFilter && (
          <div className="bg-white rounded-xl shadow-md p-5 mb-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" />
                Sort By
              </h3>
              {sortBy !== 'default' && (
                <button
                  onClick={() => setSortBy('default')}
                  className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                { value: 'default', label: 'Default' },
                { value: 'price-low-high', label: 'Price: Low to High' },
                { value: 'price-high-low', label: 'Price: High to Low' },
                { value: 'rating', label: 'Top Rated' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value as SortOption)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition border ${
                    sortBy === opt.value
                      ? 'bg-primary text-white border-primary'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-primary hover:text-primary'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition whitespace-nowrap border ${
                selectedCategory === cat
                  ? 'bg-primary text-white border-primary shadow-md'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-primary hover:text-primary'
              }`}
            >
              {cat !== 'All' && (() => {
                const Icon = categoryIcons[cat] || Tag;
                return <Icon className="w-4 h-4" />;
              })()}
              {cat}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                selectedCategory === cat ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {getCategoryCount(cat)}
              </span>
            </button>
          ))}
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600 text-sm">
            Showing <span className="font-semibold text-gray-800">{filtered.length}</span> products
            {selectedCategory !== 'All' && (
              <> in <span className="font-semibold text-primary">{selectedCategory}</span></>
            )}
          </p>
          {sortBy !== 'default' && (
            <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
              {sortBy === 'price-low-high' ? 'Price: Low to High' : sortBy === 'price-high-low' ? 'Price: High to Low' : 'Top Rated'}
            </span>
          )}
        </div>

        {/* Products Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-500">Try selecting a different category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
