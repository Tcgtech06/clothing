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
        primary: '#C49A8A', // Rose Gold Nude
        secondary: '#EBDCD3', 
        accent: '#A97C6C', 
        rose: {
          50: '#F5EEE8',  // Soft Beige (Background)
          100: '#EBDCD3',
          200: '#E1CABE',
          300: '#D7B9A9',
          400: '#CDA894',
          500: '#C49A8A', // Rose Gold Nude
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
