import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        body: ['Cormorant Garamond', 'serif'],
      },
      colors: {
        background: '#fdfcfa',
        foreground: '#6b6b6b',
        card: '#ffffff',
        'card-foreground': '#6b6b6b',
        popover: '#ffffff',
        'popover-foreground': '#6b6b6b',
        primary: '#b76e79', // Rose Gold for primary accents
        'primary-foreground': '#ffffff',
        secondary: '#f5f0eb', // Beige
        'secondary-foreground': '#6b6b6b',
        muted: '#f5f0eb',
        'muted-foreground': '#6b6b6b',
        accent: '#e8d5c4', // Nude Pink
        'accent-foreground': '#6b6b6b',
        destructive: '#d4183d',
        'destructive-foreground': '#ffffff',
        border: '#00000014',
        input: 'transparent',
        'input-background': '#fdfcfa',
        'switch-background': '#e8d5c4',
        ring: '#e8d5c4',
        beige: '#f5f0eb',
        'nude-pink': '#e8d5c4',
        ivory: '#fdfcfa',
        'rose-gold': '#b76e79',
        'luxury-black': '#000000',
        'soft-gray': '#6b6b6b',

        // Retaining old shade variations to avoid breaking existing code
        rose: {
          50: '#F5EEE8',
          100: '#EBDCD3',
          200: '#E1CABE',
          300: '#D7B9A9',
          400: '#CDA894',
          500: '#C49A8A',
          600: '#A97C6C',
          700: '#8E5E4E',
          800: '#734131',
          900: '#582413',
          950: '#4A1C0E',
        },
        lavender: {
          50: '#F5EEE8',
          100: '#EBDCD3',
          200: '#E1CABE',
          300: '#D7B9A9',
          400: '#CDA894',
          500: '#C49A8A',
          600: '#A97C6C',
          700: '#8E5E4E',
          800: '#734131',
          900: '#582413',
        },
        peach: {
          50: '#FFF5F3',
          100: '#FFE8E3',
          200: '#FFD5CC',
          300: '#FFB5A7',
          400: '#FF9482',
          500: '#FF7461',
          600: '#F55042',
          700: '#E03A2E',
          800: '#B82E24',
          900: '#962824',
        },
      },
    },
  },
  plugins: [],
};

export default config;
