import ProductCard from '@/components/ProductCard';
import { Filter } from 'lucide-react';

const categories = [
  { id: 1, name: 'Electronics', count: 245 },
  { id: 2, name: 'Fashion', count: 532 },
  { id: 3, name: 'Home & Garden', count: 189 },
  { id: 4, name: 'Sports & Outdoors', count: 321 },
  { id: 5, name: 'Books', count: 876 },
  { id: 6, name: 'Toys & Games', count: 234 },
];

const products = [
  { id: 1, name: 'Wireless Mouse', price: 29.99, image: '/products/mouse.jpg', rating: 4.2 },
  { id: 2, name: 'Gaming Keyboard', price: 129.99, image: '/products/keyboard.jpg', rating: 4.7 },
  { id: 3, name: 'Monitor 27"', price: 349.99, image: '/products/monitor.jpg', rating: 4.6 },
  { id: 4, name: 'Webcam HD', price: 79.99, image: '/products/webcam.jpg', rating: 4.4 },
  { id: 5, name: 'Desk Lamp', price: 39.99, image: '/products/lamp.jpg', rating: 4.3 },
  { id: 6, name: 'Phone Stand', price: 19.99, image: '/products/stand.jpg', rating: 4.5 },
];

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
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Electronics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
