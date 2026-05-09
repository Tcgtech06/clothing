import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF9482', // Peach - Main brand color
        secondary: '#FFB5A7', // Lighter Peach
        accent: '#FF7461', // Darker Peach for accents
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
        lavender: {
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#C084FC',
          500: '#A855F7',
          600: '#9333EA',
          700: '#7E22CE',
          800: '#6B21A8',
          900: '#581C87',
        },
      },
    },
  },
  plugins: [],
};

export default config;
