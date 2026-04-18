# E-Commerce Progressive Web App (PWA)

A modern, responsive e-commerce Progressive Web App built with Next.js 15, React 19, TypeScript, and Tailwind CSS.

## Features

- ✅ **Progressive Web App (PWA)** - Installable on mobile and desktop
- 📱 **Responsive Design** - Optimized for mobile, tablet, and desktop
- 🎨 **Modern UI** - Clean, app-like interface with Tailwind CSS
- 🧭 **Adaptive Navigation** - Bottom navigation on mobile, header navigation on desktop/tablet
- 🛍️ **E-Commerce Pages**:
  - Home - Featured products and categories
  - Category - Browse products by category
  - Loyalty Points - Rewards and points system
  - My Orders - Order history and tracking

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **PWA**: next-pwa

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
ecommerce-pwa/
├── app/
│   ├── layout.tsx          # Root layout with navigation
│   ├── page.tsx            # Home page
│   ├── globals.css         # Global styles
│   ├── category/
│   │   └── page.tsx        # Category page
│   ├── loyalty/
│   │   └── page.tsx        # Loyalty points page
│   └── orders/
│       └── page.tsx        # My orders page
├── components/
│   ├── Navigation.tsx      # Responsive navigation component
│   └── ProductCard.tsx     # Product card component
├── public/
│   └── manifest.json       # PWA manifest
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── package.json
```

## Navigation Behavior

- **Mobile View**: Bottom navigation bar (app-like experience)
- **Tablet/Desktop View**: Top header navigation

## PWA Features

The app includes:
- Offline support
- Install prompt for mobile and desktop
- App-like experience when installed
- Service worker for caching

## Customization

### Colors

Edit `tailwind.config.ts` to customize the color scheme:

```typescript
theme: {
  extend: {
    colors: {
      primary: '#6366f1',    // Main brand color
      secondary: '#8b5cf6',  // Secondary color
    },
  },
}
```

### Navigation Items

Edit `components/Navigation.tsx` to add or modify navigation items.

## License

MIT
