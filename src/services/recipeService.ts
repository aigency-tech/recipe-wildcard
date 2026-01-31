import { supabase } from '../lib/supabase';
import type { Recipe, RecipeWithDetails, CreateRecipeInput } from '../types';

export async function getPublicRecipes(options?: {
  cuisine?: string;
  limit?: number;
  offset?: number;
}): Promise<Recipe[]> {
  let query = supabase
    .from('recipes')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (options?.cuisine) {
    query = query.eq('cuisine', options.cuisine);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function getRecipeById(id: string): Promise<RecipeWithDetails | null> {
  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .single();

  if (recipeError) throw recipeError;
  if (!recipe) return null;

  const [ingredientsResult, instructionsResult] = await Promise.all([
    supabase
      .from('ingredients')
      .select('*')
      .eq('recipe_id', id)
      .order('order_index'),
    supabase
      .from('instructions')
      .select('*')
      .eq('recipe_id', id)
      .order('step_number'),
  ]);

  if (ingredientsResult.error) throw ingredientsResult.error;
  if (instructionsResult.error) throw instructionsResult.error;

  let author = null;
  if (recipe.user_id) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .eq('user_id', recipe.user_id)
      .single();

    author = profileData;
  }

  return {
    ...recipe,
    ingredients: ingredientsResult.data || [],
    instructions: instructionsResult.data || [],
    author,
  };
}

export async function createRecipe(input: CreateRecipeInput): Promise<Recipe> {
  const { data: { session } } = await supabase.auth.getSession();

  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .insert({
      user_id: session?.user?.id || null,
      title: input.title,
      description: input.description,
      image_url: input.image_url,
      source: input.source,
      prep_time_minutes: input.prep_time_minutes,
      cook_time_minutes: input.cook_time_minutes,
      servings: input.servings,
      cuisine: input.cuisine,
      difficulty: input.difficulty,
      is_public: input.is_public ?? true,
      is_anonymous: !session?.user,
    })
    .select()
    .single();

  if (recipeError) throw recipeError;

  if (input.ingredients.length > 0) {
    const { error: ingredientsError } = await supabase.from('ingredients').insert(
      input.ingredients.map((ing) => ({
        recipe_id: recipe.id,
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        is_wildcard: ing.is_wildcard,
        wildcard_reason: ing.wildcard_reason,
        order_index: ing.order_index,
      }))
    );

    if (ingredientsError) throw ingredientsError;
  }

  if (input.instructions.length > 0) {
    const { error: instructionsError } = await supabase.from('instructions').insert(
      input.instructions.map((inst) => ({
        recipe_id: recipe.id,
        step_number: inst.step_number,
        content: inst.content,
      }))
    );

    if (instructionsError) throw instructionsError;
  }

  return recipe;
}

export async function deleteRecipe(id: string): Promise<void> {
  const { error } = await supabase.from('recipes').delete().eq('id', id);
  if (error) throw error;
}

export async function saveRecipe(recipeId: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('Must be logged in to save recipes');

  const { error } = await supabase.from('saved_recipes').insert({
    user_id: session.user.id,
    recipe_id: recipeId,
  });

  if (error) throw error;
}

export async function unsaveRecipe(recipeId: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('Must be logged in to unsave recipes');

  const { error } = await supabase
    .from('saved_recipes')
    .delete()
    .eq('user_id', session.user.id)
    .eq('recipe_id', recipeId);

  if (error) throw error;
}

export async function getSavedRecipes(): Promise<any[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return [];

  const { data, error } = await supabase
    .from('saved_recipes')
    .select(`
      *,
      recipe:recipes(*)
    `)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function isRecipeSaved(recipeId: string): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return false;

  const { data } = await supabase
    .from('saved_recipes')
    .select('id')
    .eq('user_id', session.user.id)
    .eq('recipe_id', recipeId)
    .maybeSingle();

  return !!data;
}
