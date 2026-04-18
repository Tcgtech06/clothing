export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
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
    name: 'Premium Wireless Headphones',
    price: 299.99,
    originalPrice: 399.99,
    image: '/products/headphones.jpg',
    rating: 4.5,
    reviews: 128,
    description: 'Experience superior sound quality with our premium wireless headphones. Featuring active noise cancellation, 30-hour battery life, and premium comfort padding.',
    category: 'Electronics',
    features: [
      'Active Noise Cancellation',
      '30-hour battery life',
      'Premium comfort padding',
      'Bluetooth 5.0 connectivity',
      'Built-in microphone',
      'Foldable design'
    ],
    specifications: {
      'Brand': 'AudioPro',
      'Model': 'AP-X1000',
      'Connectivity': 'Bluetooth 5.0',
      'Battery Life': '30 hours',
      'Weight': '250g',
      'Color': 'Black'
    },
    inStock: true,
    colors: ['Black', 'Silver', 'Blue']
  },
  {
    id: 2,
    name: 'Smart Watch Pro',
    price: 399.99,
    originalPrice: 499.99,
    image: '/products/watch.jpg',
    rating: 4.8,
    reviews: 256,
    description: 'Stay connected and track your fitness with our advanced smart watch. Features heart rate monitoring, GPS, and 7-day battery life.',
    category: 'Wearables',
    features: [
      'Heart rate monitoring',
      'Built-in GPS',
      '7-day battery life',
      'Water resistant (50m)',
      'Sleep tracking',
      'Multiple sport modes'
    ],
    specifications: {
      'Brand': 'TechFit',
      'Model': 'TF-SW500',
      'Display': '1.4" AMOLED',
      'Battery': '7 days',
      'Water Resistance': '5ATM',
      'Compatibility': 'iOS & Android'
    },
    inStock: true,
    colors: ['Black', 'Rose Gold', 'Silver']
  },
  {
    id: 3,
    name: 'Wireless Earbuds',
    price: 149.99,
    originalPrice: 199.99,
    image: '/products/earbuds.jpg',
    rating: 4.6,
    reviews: 342,
    description: 'Compact and powerful wireless earbuds with crystal clear sound. Perfect for workouts and daily commutes.',
    category: 'Audio',
    features: [
      'True wireless design',
      '24-hour total battery life',
      'IPX7 water resistant',
      'Touch controls',
      'Quick charge support',
      'Comfortable fit'
    ],
    specifications: {
      'Brand': 'SoundWave',
      'Model': 'SW-EB200',
      'Battery Life': '6 hours (24 with case)',
      'Charging': 'USB-C',
      'Water Resistance': 'IPX7',
      'Bluetooth': '5.2'
    },
    inStock: true,
    colors: ['White', 'Black']
  },
  {
    id: 4,
    name: 'Ergonomic Laptop Stand',
    price: 79.99,
    image: '/products/stand.jpg',
    rating: 4.3,
    reviews: 89,
    description: 'Improve your posture and productivity with our adjustable laptop stand. Made from premium aluminum with multiple angle adjustments.',
    category: 'Accessories',
    features: [
      'Adjustable height and angle',
      'Premium aluminum construction',
      'Non-slip rubber pads',
      'Supports up to 17" laptops',
      'Portable and foldable',
      'Cable management'
    ],
    specifications: {
      'Brand': 'DeskPro',
      'Material': 'Aluminum Alloy',
      'Weight': '800g',
      'Max Load': '5kg',
      'Compatibility': 'Up to 17" laptops',
      'Dimensions': '28 x 24 x 15 cm'
    },
    inStock: true,
    colors: ['Silver', 'Space Gray']
  },
  {
    id: 5,
    name: 'USB-C Hub 7-in-1',
    price: 59.99,
    image: '/products/hub.jpg',
    rating: 4.4,
    reviews: 167,
    description: 'Expand your connectivity with our versatile 7-in-1 USB-C hub. Features HDMI, USB 3.0, SD card reader, and more.',
    category: 'Accessories',
    features: [
      '7 ports in one hub',
      '4K HDMI output',
      '3x USB 3.0 ports',
      'SD/TF card reader',
      '100W power delivery',
      'Compact aluminum design'
    ],
    specifications: {
      'Brand': 'ConnectHub',
      'Model': 'CH-7IN1',
      'Ports': '7 (HDMI, USB-A x3, SD, TF, USB-C PD)',
      'HDMI Output': '4K@30Hz',
      'USB Speed': 'USB 3.0 (5Gbps)',
      'Power Delivery': '100W'
    },
    inStock: true
  },
  {
    id: 6,
    name: 'Mechanical Gaming Keyboard',
    price: 189.99,
    originalPrice: 249.99,
    image: '/products/keyboard.jpg',
    rating: 4.7,
    reviews: 423,
    description: 'Dominate your games with our RGB mechanical keyboard. Features customizable switches, per-key RGB lighting, and programmable macros.',
    category: 'Gaming',
    features: [
      'Mechanical switches (Blue/Red/Brown)',
      'Per-key RGB lighting',
      'Programmable macros',
      'Anti-ghosting technology',
      'Detachable USB-C cable',
      'Aluminum frame'
    ],
    specifications: {
      'Brand': 'GameMaster',
      'Model': 'GM-K100',
      'Switch Type': 'Mechanical (Hot-swappable)',
      'Lighting': 'RGB per-key',
      'Connection': 'USB-C',
      'Layout': 'Full-size (104 keys)'
    },
    inStock: true,
    colors: ['Black', 'White']
  },
  {
    id: 7,
    name: 'Wireless Gaming Mouse',
    price: 89.99,
    image: '/products/mouse.jpg',
    rating: 4.5,
    reviews: 234,
    description: 'Precision gaming mouse with 16000 DPI sensor, customizable RGB lighting, and ultra-long battery life.',
    category: 'Gaming',
    features: [
      '16000 DPI sensor',
      'Wireless 2.4GHz + Bluetooth',
      '70-hour battery life',
      'RGB lighting',
      '6 programmable buttons',
      'Ergonomic design'
    ],
    specifications: {
      'Brand': 'GameMaster',
      'Model': 'GM-M200',
      'DPI': 'Up to 16000',
      'Battery': '70 hours',
      'Buttons': '6 programmable',
      'Weight': '95g'
    },
    inStock: true,
    colors: ['Black', 'White']
  },
  {
    id: 8,
    name: '27" 4K Monitor',
    price: 449.99,
    originalPrice: 599.99,
    image: '/products/monitor.jpg',
    rating: 4.6,
    reviews: 178,
    description: 'Stunning 4K display with HDR support, 144Hz refresh rate, and ultra-thin bezels. Perfect for gaming and content creation.',
    category: 'Displays',
    features: [
      '4K UHD resolution (3840x2160)',
      '144Hz refresh rate',
      'HDR10 support',
      '1ms response time',
      'Ultra-thin bezels',
      'VESA mount compatible'
    ],
    specifications: {
      'Brand': 'ViewPro',
      'Size': '27 inches',
      'Resolution': '3840 x 2160',
      'Refresh Rate': '144Hz',
      'Panel Type': 'IPS',
      'Response Time': '1ms'
    },
    inStock: true
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
