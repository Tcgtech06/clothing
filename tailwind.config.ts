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
        primary: '#A855F7', // Lavender - Main brand color
        secondary: '#C084FC', // Lighter Lavender
        accent: '#9333EA', // Darker Lavender for accents
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
