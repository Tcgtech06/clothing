'use client';

import { useCart } from '@/lib/cart-context';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, getCartCount } = useCart();
  const router = useRouter();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products to get started!</p>
          <Link
            href="/"
            className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition font-semibold"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8 text-gray-800">
          Shopping Cart ({getCartCount()} items)
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3 md:space-y-4">
            {cart.map((item) => (
              <div key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`} className="bg-white rounded-lg shadow-md p-3 md:p-4">
                <div className="flex gap-3 md:gap-4">
                  {/* Product Image */}
                  <Link href={`/product/${item.product.id}`} className="relative w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </Link>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.product.id}`}>
                      <h3 className="text-sm md:text-base font-semibold text-gray-800 hover:text-primary transition truncate">
                        {item.product.name}
                      </h3>
                    </Link>
                    <div className="text-xs md:text-sm text-gray-600 mt-1">
                      {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                      {item.selectedSize && <span className="ml-2 md:ml-3">Size: {item.selectedSize}</span>}
                    </div>
                    <p className="text-lg md:text-xl font-bold text-primary mt-1 md:mt-2">
                      ₹{item.product.price.toLocaleString('en-IN')}
                    </p>
                    
                    {/* Mobile: Quantity and Delete */}
                    <div className="flex items-center justify-between mt-2 md:hidden">
                      <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1.5 hover:bg-gray-100 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1.5 hover:bg-gray-100 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-red-500 hover:text-red-700 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs md:text-sm text-gray-600 mt-1 md:hidden">
                      Subtotal: ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>

                  {/* Desktop: Quantity Controls */}
                  <div className="hidden md:flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-500 hover:text-red-700 transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-2 hover:bg-gray-100 transition"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-2 hover:bg-gray-100 transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-sm text-gray-600 mt-2">
                      Subtotal: ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 md:p-6 lg:sticky lg:top-20">
              <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-800">Order Summary</h2>
              
              <div className="space-y-2 md:space-y-3 mb-3 md:mb-4">
                <div className="flex justify-between text-sm md:text-base text-gray-600">
                  <span>Subtotal ({getCartCount()} items)</span>
                  <span>₹{getCartTotal().toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm md:text-base text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="border-t pt-2 md:pt-3 flex justify-between text-base md:text-lg font-bold text-gray-800">
                  <span>Total</span>
                  <span className="text-primary">₹{getCartTotal().toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                onClick={() => router.push('/checkout')}
                className="w-full bg-primary text-white py-2.5 md:py-3 rounded-lg hover:bg-primary/90 transition font-semibold mb-2 md:mb-3 text-sm md:text-base"
              >
                Proceed to Checkout
              </button>

              <Link
                href="/"
                className="block text-center text-sm md:text-base text-primary hover:underline"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
