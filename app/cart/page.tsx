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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Shopping Cart ({getCartCount()} items)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`} className="bg-white rounded-lg shadow-md p-4">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <Link href={`/product/${item.product.id}`} className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </Link>

                  {/* Product Details */}
                  <div className="flex-1">
                    <Link href={`/product/${item.product.id}`}>
                      <h3 className="font-semibold text-gray-800 hover:text-primary transition">
                        {item.product.name}
                      </h3>
                    </Link>
                    <div className="text-sm text-gray-600 mt-1">
                      {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                      {item.selectedSize && <span className="ml-3">Size: {item.selectedSize}</span>}
                    </div>
                    <p className="text-xl font-bold text-primary mt-2">
                      ₹{item.product.price.toLocaleString('en-IN')}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-end justify-between">
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
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({getCartCount()} items)</span>
                  <span>₹{getCartTotal().toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-800">
                  <span>Total</span>
                  <span className="text-primary">₹{getCartTotal().toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                onClick={() => router.push('/checkout')}
                className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition font-semibold mb-3"
              >
                Proceed to Checkout
              </button>

              <Link
                href="/"
                className="block text-center text-primary hover:underline"
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
