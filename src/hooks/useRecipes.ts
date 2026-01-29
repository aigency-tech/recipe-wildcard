import { useEffect, useCallback } from 'react';
import { useRecipeStore } from '../stores/recipeStore';
import type { CreateRecipeInput } from '../types';

export function useRecipes(options?: { cuisine?: string; limit?: number }) {
  const store = useRecipeStore();

  useEffect(() => {
    store.fetchRecipes(options);
  }, [options?.cuisine, options?.limit]);

  return {
    recipes: store.recipes,
    isLoading: store.isLoading,
    error: store.error,
    refresh: () => store.fetchRecipes(options),
    clearError: store.clearError,
  };
}

export function useRecipe(id: string | undefined) {
  const store = useRecipeStore();

  useEffect(() => {
    if (id) {
      store.fetchRecipeById(id);
    }

    return () => {
      store.clearCurrentRecipe();
    };
  }, [id]);

  return {
    recipe: store.currentRecipe,
    isLoading: store.isLoading,
    error: store.error,
    refresh: () => id && store.fetchRecipeById(id),
    clearError: store.clearError,
  };
}

export function useCreateRecipe() {
  const store = useRecipeStore();

  const createRecipe = useCallback(
    async (input: CreateRecipeInput) => {
      return store.createRecipe(input);
    },
    [store.createRecipe]
  );

  return {
    createRecipe,
    isLoading: store.isLoading,
    error: store.error,
    clearError: store.clearError,
  };
}

export function useSavedRecipes() {
  const store = useRecipeStore();

  useEffect(() => {
    store.fetchSavedRecipes();
  }, []);

  return {
    savedRecipes: store.savedRecipes,
    isLoading: store.isLoading,
    error: store.error,
    saveRecipe: store.saveRecipe,
    unsaveRecipe: store.unsaveRecipe,
    checkIfSaved: store.checkIfSaved,
    refresh: store.fetchSavedRecipes,
    clearError: store.clearError,
  };
}
