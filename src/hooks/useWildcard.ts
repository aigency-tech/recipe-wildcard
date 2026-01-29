import { useEffect, useCallback } from 'react';
import { useWildcardStore, FALLBACK_WILDCARDS } from '../stores/wildcardStore';

export function useWildcard() {
  const store = useWildcardStore();

  useEffect(() => {
    if (store.catalog.length === 0) {
      store.fetchCatalog();
    }
  }, []);

  const getSuggestion = useCallback(
    async (ingredients: string[], cuisine?: string) => {
      return store.getSuggestion(ingredients, cuisine);
    },
    [store.getSuggestion]
  );

  const explainPairing = useCallback(
    async (wildcardIngredient: string, recipeIngredients: string[], recipeTitle: string) => {
      return store.explainPairing(wildcardIngredient, recipeIngredients, recipeTitle);
    },
    [store.explainPairing]
  );

  return {
    catalog: store.catalog.length > 0 ? store.catalog : FALLBACK_WILDCARDS,
    currentSuggestion: store.currentSuggestion,
    recentSuggestions: store.recentSuggestions,
    isLoading: store.isLoading,
    error: store.error,
    getSuggestion,
    explainPairing,
    clearSuggestion: store.clearSuggestion,
    clearError: store.clearError,
  };
}

export function useWildcardCategories() {
  const { catalog } = useWildcard();

  const categories = catalog.reduce<Record<string, typeof catalog>>((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return Object.entries(categories).map(([name, items]) => ({
    name,
    items,
  }));
}
