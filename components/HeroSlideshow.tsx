'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ShoppingBag, Zap, Gift, TrendingUp } from 'lucide-react';

const slides = [
  {
    id: 1,
    title: 'Welcome to Our Store',
    subtitle: 'Discover amazing products at unbeatable prices',
    buttonText: 'Shop Now',
    icon: ShoppingBag,
    gradient: 'from-primary to-secondary',
  },
  {
    id: 2,
    title: 'Flash Sale Today',
    subtitle: 'Up to 50% off on selected items',
    buttonText: 'Grab Deals',
    icon: Zap,
    gradient: 'from-orange-500 to-red-500',
  },
  {
    id: 3,
    title: 'Free Shipping',
    subtitle: 'On orders over $50 - Limited time offer',
    buttonText: 'Start Shopping',
    icon: Gift,
    gradient: 'from-green-500 to-teal-500',
  },
  {
    id: 4,
    title: 'New Arrivals',
    subtitle: 'Check out the latest trending products',
    buttonText: 'Explore Now',
    icon: TrendingUp,
    gradient: 'from-purple-500 to-pink-500',
  },
];

export default function HeroSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds of manual interaction
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    goToSlide((currentSlide + 1) % slides.length);
  };

  const prevSlide = () => {
    goToSlide((currentSlide - 1 + slides.length) % slides.length);
  };

  const currentSlideData = slides[currentSlide];
  const Icon = currentSlideData.icon;

  return (
    <section className="relative overflow-hidden">
      {/* Slideshow Container */}
      <div className="relative h-[400px] md:h-[500px]">
        {/* Slides */}
        {slides.map((slide, index) => {
          const SlideIcon = slide.icon;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                index === currentSlide
                  ? 'opacity-100 translate-x-0'
                  : index < currentSlide
                  ? 'opacity-0 -translate-x-full'
                  : 'opacity-0 translate-x-full'
              }`}
            >
              <div
                className={`h-full bg-gradient-to-r ${slide.gradient} text-white py-16 px-4 md:py-20 flex items-center justify-center`}
              >
                <div className="max-w-7xl mx-auto text-center">
                  <SlideIcon className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 animate-bounce" />
                  <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
                    {slide.title}
                  </h1>
                  <p className="text-lg md:text-2xl mb-8 opacity-90 animate-fade-in-delay">
                    {slide.subtitle}
                  </p>
                  <button className="bg-white text-gray-800 px-8 py-3 md:px-10 md:py-4 rounded-full font-semibold hover:bg-gray-100 transition transform hover:scale-105 shadow-lg">
                    {slide.buttonText}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 backdrop-blur-sm text-white p-2 md:p-3 rounded-full transition z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 backdrop-blur-sm text-white p-2 md:p-3 rounded-full transition z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide
                ? 'bg-white w-8 h-3'
                : 'bg-white/50 w-3 h-3 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Auto-play indicator */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="bg-white/30 hover:bg-white/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm transition"
        >
          {isAutoPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
      </div>
    </section>
  );
}
