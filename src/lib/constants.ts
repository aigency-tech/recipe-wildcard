export const APP_NAME = 'Recipe Wildcard';

export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
export const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
export const APP_SCHEME = process.env.EXPO_PUBLIC_APP_SCHEME || 'recipewildcard';

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth-token',
  USER_PREFERENCES: 'user-preferences',
} as const;

export const DIFFICULTY_LABELS = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
} as const;

export const CUISINE_OPTIONS = [
  'American',
  'Chinese',
  'French',
  'Indian',
  'Italian',
  'Japanese',
  'Korean',
  'Mediterranean',
  'Mexican',
  'Middle Eastern',
  'Thai',
  'Vietnamese',
  'Other',
] as const;

export const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Low-Carb',
  'Keto',
  'Paleo',
] as const;

export const WILDCARD_CATEGORIES = [
  'Umami Boosters',
  'Acidic Notes',
  'Sweet Enhancers',
  'Aromatic Additions',
  'Textural Elements',
  'Heat & Spice',
] as const;
