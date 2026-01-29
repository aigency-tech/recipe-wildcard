import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { suggestWildcardIngredient, explainWildcardPairing } from '../lib/gemini';
import type { WildcardIngredient, WildcardSuggestion } from '../types';

interface WildcardState {
  catalog: WildcardIngredient[];
  currentSuggestion: WildcardSuggestion | null;
  recentSuggestions: WildcardSuggestion[];
  isLoading: boolean;
  error: string | null;
}

interface WildcardActions {
  fetchCatalog: () => Promise<void>;
  getSuggestion: (ingredients: string[], cuisine?: string) => Promise<WildcardSuggestion>;
  explainPairing: (wildcardIngredient: string, recipeIngredients: string[], recipeTitle: string) => Promise<string>;
  clearSuggestion: () => void;
  clearError: () => void;
}

export const useWildcardStore = create<WildcardState & WildcardActions>((set, get) => ({
  catalog: [],
  currentSuggestion: null,
  recentSuggestions: [],
  isLoading: false,
  error: null,

  fetchCatalog: async () => {
    try {
      set({ isLoading: true, error: null });

      const { data, error } = await supabase
        .from('wildcard_catalog')
        .select('*')
        .order('name');

      if (error) throw error;

      set({ catalog: data || [] });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch wildcard catalog' });
    } finally {
      set({ isLoading: false });
    }
  },

  getSuggestion: async (ingredients: string[], cuisine?: string) => {
    try {
      set({ isLoading: true, error: null });

      const suggestion = await suggestWildcardIngredient(ingredients, cuisine);

      set((state) => ({
        currentSuggestion: suggestion,
        recentSuggestions: [suggestion, ...state.recentSuggestions.slice(0, 4)],
      }));

      return suggestion;
    } catch (error: any) {
      set({ error: error.message || 'Failed to get wildcard suggestion' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  explainPairing: async (wildcardIngredient: string, recipeIngredients: string[], recipeTitle: string) => {
    try {
      set({ isLoading: true, error: null });

      const explanation = await explainWildcardPairing(wildcardIngredient, recipeIngredients, recipeTitle);

      return explanation;
    } catch (error: any) {
      set({ error: error.message || 'Failed to explain pairing' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  clearSuggestion: () => set({ currentSuggestion: null }),

  clearError: () => set({ error: null }),
}));

export const FALLBACK_WILDCARDS: WildcardIngredient[] = [
  {
    id: '1',
    name: 'Fish Sauce',
    category: 'Umami Boosters',
    flavor_profile: ['umami', 'salty', 'funky'],
    pairs_with: ['beef', 'tomatoes', 'caramel', 'citrus'],
    description: 'Southeast Asian fermented fish condiment that adds deep umami without tasting fishy',
    usage_tips: 'Start with 1/2 tsp, add more to taste. Works great in non-Asian dishes like bolognese or Caesar dressing.',
    intensity: 'bold',
  },
  {
    id: '2',
    name: 'Miso Paste',
    category: 'Umami Boosters',
    flavor_profile: ['umami', 'sweet', 'salty'],
    pairs_with: ['butter', 'chocolate', 'caramel', 'mushrooms'],
    description: 'Fermented soybean paste that adds depth and complexity to both savory and sweet dishes',
    usage_tips: 'White miso is milder, red miso is stronger. Try it in caramel or chocolate desserts.',
    intensity: 'medium',
  },
  {
    id: '3',
    name: 'Espresso Powder',
    category: 'Aromatic Additions',
    flavor_profile: ['bitter', 'roasted', 'complex'],
    pairs_with: ['chocolate', 'beef', 'chili', 'vanilla'],
    description: 'Concentrated coffee flavor that enhances chocolate and adds depth to savory dishes',
    usage_tips: '1/4 tsp in chili or beef stew adds complexity without coffee flavor. Perfect in brownies.',
    intensity: 'medium',
  },
  {
    id: '4',
    name: 'Tahini',
    category: 'Textural Elements',
    flavor_profile: ['nutty', 'bitter', 'creamy'],
    pairs_with: ['honey', 'chocolate', 'citrus', 'greens'],
    description: 'Sesame seed paste that adds creamy nuttiness to both savory and sweet applications',
    usage_tips: 'Drizzle on salads, blend into smoothies, or swirl into brownies before baking.',
    intensity: 'medium',
  },
  {
    id: '5',
    name: 'Apple Cider Vinegar',
    category: 'Acidic Notes',
    flavor_profile: ['tart', 'fruity', 'bright'],
    pairs_with: ['pork', 'beans', 'greens', 'berries'],
    description: 'Fruity vinegar that brightens flavors and cuts through richness',
    usage_tips: 'Add a splash at the end of cooking to brighten stews, soups, and braises.',
    intensity: 'subtle',
  },
  {
    id: '6',
    name: 'Gochujang',
    category: 'Heat & Spice',
    flavor_profile: ['spicy', 'sweet', 'umami'],
    pairs_with: ['mayo', 'honey', 'beef', 'eggs'],
    description: 'Korean fermented chili paste with sweet heat and deep umami notes',
    usage_tips: 'Mix with mayo for spicy aioli, glaze on roasted vegetables, or stir into mac and cheese.',
    intensity: 'bold',
  },
];
