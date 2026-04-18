# Setup Instructions

## Quick Start

1. **Install Dependencies** (Already done!)
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) to view the app

3. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## PWA Installation

### On Mobile (iOS/Android)
1. Open the app in your mobile browser
2. Look for "Add to Home Screen" option
3. The app will install and behave like a native app

### On Desktop (Chrome/Edge)
1. Open the app in Chrome or Edge
2. Look for the install icon in the address bar
3. Click to install as a desktop app

## Navigation Behavior

- **Mobile (< 768px)**: Bottom navigation bar with icons
- **Tablet/Desktop (≥ 768px)**: Top header navigation

## Creating PWA Icons

Replace the placeholder icon files with actual PNG images:

1. Create a 512x512px icon for your app
2. Use an online tool like [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator) to generate all sizes
3. Replace these files:
   - `public/icon-192x192.png`
   - `public/icon-512x512.png`
   - `public/favicon.ico`

## Customization Tips

### Change Brand Colors
Edit `tailwind.config.ts`:
```typescript
colors: {
  primary: '#6366f1',    // Your brand color
  secondary: '#8b5cf6',  // Secondary color
}
```

### Add More Pages
1. Create a new folder in `app/` directory
2. Add a `page.tsx` file
3. Update `components/Navigation.tsx` to add the new route

### Modify Products
Edit the product arrays in:
- `app/page.tsx` (Home page)
- `app/category/page.tsx` (Category page)

## Troubleshooting

### Port Already in Use
If port 3000 is busy, run:
```bash
npm run dev -- -p 3001
```

### PWA Not Working
- PWA features are disabled in development mode
- Build and run production mode to test PWA features:
  ```bash
  npm run build
  npm start
  ```

### Dependencies Issues
If you encounter dependency conflicts:
```bash
npm install --legacy-peer-deps
```

## Next Steps

1. ✅ Add real product data (API integration)
2. ✅ Implement shopping cart functionality
3. ✅ Add user authentication
4. ✅ Connect to a backend/database
5. ✅ Add payment integration
6. ✅ Implement search functionality
7. ✅ Add product filters and sorting
8. ✅ Create product detail pages
9. ✅ Add user profile page
10. ✅ Implement real-time notifications

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Lucide Icons](https://lucide.dev/)
