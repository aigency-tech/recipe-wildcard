import { supabase } from '../lib/supabase';
import { suggestWildcardIngredient, explainWildcardPairing } from '../lib/gemini';
import type { WildcardIngredient, WildcardSuggestion } from '../types';

export async function getWildcardCatalog(): Promise<WildcardIngredient[]> {
  const { data, error } = await supabase
    .from('wildcard_catalog')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function getWildcardsByCategory(): Promise<Record<string, WildcardIngredient[]>> {
  const catalog = await getWildcardCatalog();

  return catalog.reduce<Record<string, WildcardIngredient[]>>((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});
}

export async function getWildcardSuggestion(
  ingredients: string[],
  cuisine?: string
): Promise<WildcardSuggestion> {
  return suggestWildcardIngredient(ingredients, cuisine);
}

export async function explainWildcard(
  wildcardIngredient: string,
  recipeIngredients: string[],
  recipeTitle: string
): Promise<string> {
  return explainWildcardPairing(wildcardIngredient, recipeIngredients, recipeTitle);
}

export async function getRandomWildcard(): Promise<WildcardIngredient | null> {
  const { data, error } = await supabase
    .from('wildcard_catalog')
    .select('*');

  if (error) throw error;
  if (!data || data.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * data.length);
  return data[randomIndex];
}

export async function searchWildcards(query: string): Promise<WildcardIngredient[]> {
  const { data, error } = await supabase
    .from('wildcard_catalog')
    .select('*')
    .or(`name.ilike.%${query}%, description.ilike.%${query}%`)
    .order('name');

  if (error) throw error;
  return data || [];
}
