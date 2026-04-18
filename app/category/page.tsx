import ProductCard from '@/components/ProductCard';
import { Filter } from 'lucide-react';
import { products, getAllCategories } from '@/data/products';

const categories = getAllCategories().map((cat, index) => ({
  id: index + 1,
  name: cat,
  count: products.filter(p => p.category === cat).length
}));

export default function CategoryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Categories</h1>
          <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition">
            <Filter className="w-5 h-5" />
            <span className="hidden md:inline">Filter</span>
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer"
            >
              <h3 className="font-semibold text-gray-800 mb-1">{category.name}</h3>
              <p className="text-sm text-gray-500">{category.count} items</p>
            </div>
          ))}
        </div>

        {/* Products in Selected Category */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">All Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.slice(0, 6).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
