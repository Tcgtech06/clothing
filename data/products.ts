export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  rating: number;
  reviews: number;
  description: string;
  category: string;
  features: string[];
  specifications: {
    [key: string]: string;
  };
  inStock: boolean;
  colors?: string[];
  sizes?: string[];
}

export const products: Product[] = [
  {
    id: 1,
    name: 'Floral Summer Maxi Dress',
    price: 3499,
    originalPrice: 4999,
    images: [
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800'
    ],
    rating: 4.5,
    reviews: 128,
    description: 'Beautiful floral print maxi dress perfect for summer occasions. Features a flowing silhouette, adjustable straps, and breathable fabric.',
    category: 'Women Dresses',
    features: [
      'Floral print design',
      'Adjustable shoulder straps',
      'Breathable cotton blend',
      'Flowing maxi length',
      'Side pockets',
      'Machine washable'
    ],
    specifications: {
      'Brand': 'FashionHub',
      'Material': '95% Cotton, 5% Spandex',
      'Length': 'Maxi (Floor length)',
      'Fit': 'Regular',
      'Occasion': 'Casual, Party',
      'Care': 'Machine wash cold'
    },
    inStock: true,
    colors: ['Blue Floral', 'Pink Floral', 'White Floral'],
    sizes: ['XS', 'S', 'M', 'L', 'XL']
  },
  {
    id: 2,
    name: 'Elegant Evening Gown',
    price: 5999,
    originalPrice: 8999,
    images: [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800',
      'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800',
      'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800',
      'https://images.unsplash.com/photo-1612423284934-2850a4ea6b0f?w=800'
    ],
    rating: 4.8,
    reviews: 256,
    description: 'Stunning evening gown with elegant draping and a flattering silhouette. Perfect for formal events, weddings, and special occasions.',
    category: 'Women Dresses',
    features: [
      'Elegant draping design',
      'Hidden back zipper',
      'Premium satin fabric',
      'Floor-length gown',
      'Fully lined',
      'Dry clean only'
    ],
    specifications: {
      'Brand': 'Elegance',
      'Material': '100% Polyester Satin',
      'Length': 'Floor length',
      'Fit': 'Fitted bodice, flowing skirt',
      'Occasion': 'Formal, Wedding, Party',
      'Care': 'Dry clean only'
    },
    inStock: true,
    colors: ['Black', 'Navy Blue', 'Burgundy', 'Emerald Green'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  },
  {
    id: 3,
    name: 'Casual A-Line Midi Dress',
    price: 2499,
    originalPrice: 3499,
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
      'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800',
      'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800'
    ],
    rating: 4.6,
    reviews: 342,
    description: 'Versatile A-line midi dress perfect for everyday wear. Features a comfortable fit, flattering cut, and easy-care fabric.',
    category: 'Women Dresses',
    features: [
      'Classic A-line silhouette',
      'Midi length',
      'Short sleeves',
      'Round neckline',
      'Side pockets',
      'Easy care fabric'
    ],
    specifications: {
      'Brand': 'DailyWear',
      'Material': '60% Cotton, 40% Polyester',
      'Length': 'Midi (Below knee)',
      'Fit': 'Regular A-line',
      'Occasion': 'Casual, Office',
      'Care': 'Machine wash'
    },
    inStock: true,
    colors: ['Navy', 'Black', 'Olive Green', 'Dusty Rose'],
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 4,
    name: 'Bohemian Wrap Dress',
    price: 2999,
    images: [
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800',
      'https://images.unsplash.com/photo-1550639525-c97d455acf70?w=800'
    ],
    rating: 4.3,
    reviews: 89,
    description: 'Boho-chic wrap dress with a relaxed fit and beautiful print. Perfect for beach vacations and casual summer days.',
    category: 'Women Dresses',
    features: [
      'Wrap-style design',
      'Adjustable tie waist',
      'Flowing sleeves',
      'Lightweight fabric',
      'Bohemian print',
      'Versatile styling'
    ],
    specifications: {
      'Brand': 'BohoStyle',
      'Material': '100% Rayon',
      'Length': 'Midi',
      'Fit': 'Relaxed wrap',
      'Occasion': 'Casual, Beach, Vacation',
      'Care': 'Hand wash recommended'
    },
    inStock: true,
    colors: ['Coral Print', 'Blue Print', 'Green Print'],
    sizes: ['XS', 'S', 'M', 'L', 'XL']
  },
  {
    id: 5,
    name: 'Little Black Cocktail Dress',
    price: 4499,
    images: [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800',
      'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800',
      'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800',
      'https://images.unsplash.com/photo-1612423284934-2850a4ea6b0f?w=800'
    ],
    rating: 4.7,
    reviews: 167,
    description: 'Timeless little black dress perfect for cocktail parties and evening events. Features a fitted silhouette and elegant details.',
    category: 'Women Dresses',
    features: [
      'Classic LBD design',
      'Fitted silhouette',
      'Knee-length',
      'Hidden back zipper',
      'Sleeveless design',
      'Versatile styling'
    ],
    specifications: {
      'Brand': 'ClassicChic',
      'Material': '95% Polyester, 5% Spandex',
      'Length': 'Knee length',
      'Fit': 'Fitted',
      'Occasion': 'Cocktail, Party, Evening',
      'Care': 'Dry clean'
    },
    inStock: true,
    colors: ['Black'],
    sizes: ['XS', 'S', 'M', 'L', 'XL']
  },
  {
    id: 6,
    name: 'Flowy Chiffon Dress',
    price: 3999,
    originalPrice: 5499,
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800',
      'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800'
    ],
    rating: 4.5,
    reviews: 423,
    description: 'Romantic flowy chiffon dress with delicate details. Perfect for garden parties, weddings, and spring events.',
    category: 'Women Dresses',
    features: [
      'Lightweight chiffon fabric',
      'Flowy silhouette',
      'Delicate pleating',
      'Lined bodice',
      'Flutter sleeves',
      'Midi length'
    ],
    specifications: {
      'Brand': 'RomanticStyle',
      'Material': '100% Polyester Chiffon',
      'Length': 'Midi',
      'Fit': 'Flowy',
      'Occasion': 'Wedding, Garden Party, Spring',
      'Care': 'Hand wash cold'
    },
    inStock: true,
    colors: ['Blush Pink', 'Lavender', 'Mint Green', 'Champagne'],
    sizes: ['XS', 'S', 'M', 'L', 'XL']
  },
  {
    id: 7,
    name: 'Professional Sheath Dress',
    price: 3299,
    images: [
      'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800',
      'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800'
    ],
    rating: 4.4,
    reviews: 234,
    description: 'Sophisticated sheath dress perfect for the office and professional settings. Features a tailored fit and classic design.',
    category: 'Women Dresses',
    features: [
      'Tailored sheath silhouette',
      'Knee-length',
      'Short sleeves',
      'Back slit for movement',
      'Professional design',
      'Wrinkle-resistant fabric'
    ],
    specifications: {
      'Brand': 'WorkWear',
      'Material': '70% Polyester, 25% Rayon, 5% Spandex',
      'Length': 'Knee length',
      'Fit': 'Tailored sheath',
      'Occasion': 'Office, Business, Professional',
      'Care': 'Machine wash'
    },
    inStock: true,
    colors: ['Navy', 'Black', 'Charcoal Gray', 'Burgundy'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  },
  {
    id: 8,
    name: 'Vintage Polka Dot Dress',
    price: 2799,
    originalPrice: 3999,
    images: [
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800',
      'https://images.unsplash.com/photo-1550639525-c97d455acf70?w=800'
    ],
    rating: 4.6,
    reviews: 178,
    description: 'Charming vintage-inspired polka dot dress with a retro silhouette. Features a fitted bodice and full skirt for a classic look.',
    category: 'Women Dresses',
    features: [
      'Vintage polka dot print',
      'Fitted bodice',
      'Full A-line skirt',
      'Belt included',
      'Knee-length',
      'Retro styling'
    ],
    specifications: {
      'Brand': 'VintageVibes',
      'Material': '97% Cotton, 3% Spandex',
      'Length': 'Knee length',
      'Fit': 'Fitted bodice, full skirt',
      'Occasion': 'Casual, Retro Party, Date',
      'Care': 'Machine wash'
    },
    inStock: true,
    colors: ['Black with White Dots', 'Navy with White Dots', 'Red with White Dots'],
    sizes: ['XS', 'S', 'M', 'L', 'XL']
  }
];

export function getProductById(id: number): Product | undefined {
  return products.find(product => product.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter(product => product.category === category);
}

export function getAllCategories(): string[] {
  return Array.from(new Set(products.map(product => product.category)));
}
