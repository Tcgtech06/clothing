'use client';

import { useState, useEffect } from 'react';
import { Star, ShoppingCart, Heart, Share2, Check, Truck, Shield, RotateCcw, Minus, Plus, ArrowLeft, ChevronLeft, ChevronRight, Coins } from 'lucide-react';
import { Product } from '@/data/products';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/cart-context';
import { useFavourites } from '@/lib/favourites-context';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import ProductPoll from './ProductPoll';

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addToFavourites, removeFromFavourites, isFavourite } = useFavourites();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  const [showAddedToCart, setShowAddedToCart] = useState(false);
  const [showLoyaltyPoints, setShowLoyaltyPoints] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewName, setReviewName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [showReviewSuccess, setShowReviewSuccess] = useState(false);

  const isProductFavourite = isFavourite(product.id);

  // Auto-slide images every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedImage((prev) => (prev + 1) % product.images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [product.images.length]);

  const handlePrevImage = () => {
    setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const handleNextImage = () => {
    setSelectedImage((prev) => (prev + 1) % product.images.length);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} - ₹${product.price.toLocaleString('en-IN')}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!user) {
      router.push('/signup');
      return;
    }
    
    addToCart(product, quantity, selectedColor, selectedSize);
    
    // Calculate loyalty points earned
    const points = (product.loyaltyPoints || 0) * quantity;
    setEarnedPoints(points);
    
    setShowAddedToCart(true);
    setShowLoyaltyPoints(true);
    
    setTimeout(() => {
      setShowAddedToCart(false);
      setShowLoyaltyPoints(false);
      router.push('/checkout');
    }, 2000);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      router.push('/signup');
      return;
    }
    
    // Here you would typically send the review to your backend
    console.log('Review submitted:', { reviewRating, reviewName, reviewText });
    setShowReviewSuccess(true);
    setReviewName('');
    setReviewText('');
    setReviewRating(5);
    setTimeout(() => setShowReviewSuccess(false), 3000);
  };

  const handleToggleFavourite = () => {
    if (!user) {
      router.push('/signup');
      return;
    }
    
    if (isProductFavourite) {
      removeFromFavourites(product.id);
    } else {
      addToFavourites(product);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-primary transition mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-8">
            {/* Main Image with Share and Favourite Buttons */}
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 group">
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full font-semibold text-sm z-10">
                  -{discount}%
                </div>
              )}
              
              {/* Top Right Icons */}
              <div className="absolute top-4 right-4 flex gap-2 z-10">
                {/* Favourite Button */}
                <button
                  onClick={handleToggleFavourite}
                  className={`bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition shadow-lg ${
                    isProductFavourite ? 'bg-red-50' : ''
                  }`}
                  aria-label={isProductFavourite ? 'Remove from favourites' : 'Add to favourites'}
                >
                  <Heart className={`w-5 h-5 ${isProductFavourite ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
                </button>

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition shadow-lg"
                  aria-label="Share product"
                >
                  <Share2 className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition opacity-0 group-hover:opacity-100 shadow-lg"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition opacity-0 group-hover:opacity-100 shadow-lg"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>

              {/* Image Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {product.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-2 h-2 rounded-full transition ${
                      selectedImage === index ? 'bg-white w-6' : 'bg-white/50'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </div>
            
            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square bg-gray-100 rounded-lg cursor-pointer overflow-hidden transition ${
                    selectedImage === index ? 'ring-2 ring-primary' : 'hover:ring-2 hover:ring-gray-300'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
            
            {/* Rating */}
            {/* Price */}
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl md:text-4xl font-bold text-primary">₹{product.price.toLocaleString('en-IN')}</span>
                {product.originalPrice && (
                  <span className="text-xl md:text-2xl text-gray-400 line-through">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              {product.inStock ? (
                <p className="text-green-600 font-medium mt-2 flex items-center gap-1">
                  <Check className="w-4 h-4" /> In Stock
                </p>
              ) : (
                <p className="text-red-600 font-medium mt-2">Out of Stock</p>
              )}
              {product.loyaltyPoints && (
                <div className="mt-3 inline-flex items-center gap-2 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 px-3 py-2 rounded-lg">
                  <Coins className="w-6 h-6 text-amber-600" />
                  <div>
                    <p className="text-xs text-gray-600">Earn Loyalty Points</p>
                    <p className="text-sm font-bold text-amber-600">+{product.loyaltyPoints} points</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-6 text-sm md:text-base">{product.description}</p>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color: <span className="text-gray-900">{selectedColor}</span>
                </label>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 border-2 rounded-lg transition text-sm ${
                        selectedColor === color
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size: <span className="text-gray-900">{selectedSize}</span>
                </label>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border-2 rounded-lg transition text-sm ${
                        selectedSize === size
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100 transition flex items-center justify-center"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100 transition flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition font-semibold flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
            </div>

            {/* Added to Cart Message */}
            {showAddedToCart && (
              <div className="mb-4 space-y-2">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-center animate-fade-in">
                  ✓ Added to cart successfully!
                </div>
                {showLoyaltyPoints && earnedPoints > 0 && (
                  <div className="p-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg text-center animate-fade-in">
                    <div className="flex items-center justify-center gap-3">
                      <Coins className="w-8 h-8 text-amber-600" />
                      <div>
                        <p className="text-sm text-gray-700">You&apos;ll earn</p>
                        <p className="text-lg font-bold text-amber-600">+{earnedPoints} Loyalty Points</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Features */}
            <div className="border-t pt-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-3">
                  <Truck className="w-6 h-6 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">Free Delivery</p>
                    <p className="text-xs text-gray-600">On orders over $50</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">Warranty</p>
                    <p className="text-xs text-gray-600">1 year warranty</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <RotateCcw className="w-6 h-6 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">Easy Returns</p>
                    <p className="text-xs text-gray-600">30-day return policy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description and Reviews Tabs */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-8">
          <div className="border-b mb-6">
            <div className="flex gap-4 md:gap-8">
              <button
                onClick={() => setActiveTab('description')}
                className={`pb-4 border-b-2 font-semibold transition ${
                  activeTab === 'description'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-4 border-b-2 font-semibold transition ${
                  activeTab === 'reviews'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                Reviews ({product.reviews})
              </button>
            </div>
          </div>

          {activeTab === 'description' ? (
            <div>
              <h3 className="text-xl font-bold mb-4">Product Description</h3>
              <p className="text-gray-700 mb-6">{product.description}</p>
              
              <h4 className="text-lg font-bold mb-3">Key Features</h4>
              <ul className="space-y-3 mb-6">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <h4 className="text-lg font-bold mb-3">Specifications</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between border-b pb-2">
                    <span className="font-medium text-gray-700">{key}:</span>
                    <span className="text-gray-600">{value}</span>
                  </div>
                ))}
              </div>

              {/* Product Poll */}
              <ProductPoll 
                productId={product.id}
                firestoreId={(product as any).firestoreId}
                initialPoll={product.poll}
              />
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-bold mb-4">Customer Reviews</h3>
              <p className="text-gray-600 mb-6">{product.reviews} customer reviews</p>

              {/* Write a Review Form */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h4 className="text-lg font-bold mb-4">Write a Review</h4>
                {showReviewSuccess && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
                    ✓ Thank you! Your review has been submitted successfully.
                  </div>
                )}
                <form onSubmit={handleSubmitReview}>
                  {/* Name Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter your name"
                    />
                  </div>

                  {/* Review Text */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Review
                    </label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      required
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      placeholder="Share your experience with this product..."
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition font-semibold"
                  >
                    Submit Review
                  </button>
                </form>
              </div>
              
              {/* Sample Reviews */}
              <h4 className="text-lg font-bold mb-4">Customer Reviews</h4>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border-b pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="font-semibold">Customer {i}</span>
                      <span className="text-sm text-gray-500">• 2 days ago</span>
                    </div>
                    <p className="text-gray-700">
                      Great product! Highly recommended. The quality is excellent and it works perfectly.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
