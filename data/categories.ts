// Shared categories for the entire application
export const CATEGORIES = [
  'Women Dresses',
  'Men Clothing',
  'Accessories',
  'Footwear'
] as const;

export type Category = typeof CATEGORIES[number];
