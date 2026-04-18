import ProductCard from '@/components/ProductCard';
import HeroSlideshow from '@/components/HeroSlideshow';

const featuredProducts = [
  { id: 1, name: 'Premium Headphones', price: 299.99, image: '/products/headphones.jpg', rating: 4.5 },
  { id: 2, name: 'Smart Watch', price: 399.99, image: '/products/watch.jpg', rating: 4.8 },
  { id: 3, name: 'Wireless Earbuds', price: 149.99, image: '/products/earbuds.jpg', rating: 4.6 },
  { id: 4, name: 'Laptop Stand', price: 79.99, image: '/products/stand.jpg', rating: 4.3 },
  { id: 5, name: 'USB-C Hub', price: 59.99, image: '/products/hub.jpg', rating: 4.4 },
  { id: 6, name: 'Mechanical Keyboard', price: 189.99, image: '/products/keyboard.jpg', rating: 4.7 },
];

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
