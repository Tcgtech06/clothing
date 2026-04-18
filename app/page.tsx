import ProductCard from '@/components/ProductCard';
import HeroSlideshow from '@/components/HeroSlideshow';
import { products } from '@/data/products';

const featuredProducts = products.slice(0, 6);

export default function Home() {
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
      </section>

      {/* Categories Preview */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Electronics', 'Fashion', 'Home & Garden', 'Sports'].map((category) => (
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
