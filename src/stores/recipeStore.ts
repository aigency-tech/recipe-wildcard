import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Recipe, RecipeWithDetails, CreateRecipeInput, SavedRecipe } from '../types';

interface RecipeState {
  recipes: Recipe[];
  currentRecipe: RecipeWithDetails | null;
  savedRecipes: SavedRecipe[];
  isLoading: boolean;
  error: string | null;
}

interface RecipeActions {
  fetchRecipes: (options?: { cuisine?: string; limit?: number }) => Promise<void>;
  fetchRecipeById: (id: string) => Promise<void>;
  createRecipe: (input: CreateRecipeInput) => Promise<Recipe>;
  updateRecipe: (id: string, input: Partial<CreateRecipeInput>) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  saveRecipe: (recipeId: string) => Promise<void>;
  unsaveRecipe: (recipeId: string) => Promise<void>;
  fetchSavedRecipes: () => Promise<void>;
  checkIfSaved: (recipeId: string) => Promise<boolean>;
  clearCurrentRecipe: () => void;
  clearError: () => void;
}

export const useRecipeStore = create<RecipeState & RecipeActions>((set, get) => ({
  recipes: [],
  currentRecipe: null,
  savedRecipes: [],
  isLoading: false,
  error: null,

  fetchRecipes: async (options = {}) => {
    try {
      set({ isLoading: true, error: null });

      let query = supabase
        .from('recipes')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (options.cuisine) {
        query = query.eq('cuisine', options.cuisine);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      set({ recipes: data || [] });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch recipes' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchRecipeById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });

      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single();

      if (recipeError) throw recipeError;

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

        if (profileData) {
          author = profileData;
        }
      }

      const recipeWithDetails: RecipeWithDetails = {
        ...recipe,
        ingredients: ingredientsResult.data || [],
        instructions: instructionsResult.data || [],
        author,
      };

      set({ currentRecipe: recipeWithDetails });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch recipe' });
    } finally {
      set({ isLoading: false });
    }
  },

  createRecipe: async (input: CreateRecipeInput) => {
    try {
      set({ isLoading: true, error: null });

      const { data: { session } } = await supabase.auth.getSession();

      console.log('Creating recipe:', input.title);
      console.log('User session:', session?.user?.id || 'anonymous');

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

      if (recipeError) {
        console.error('Recipe insert error:', recipeError);
        throw recipeError;
      }

      console.log('Recipe created with ID:', recipe.id);

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

        if (ingredientsError) {
          console.error('Ingredients insert error:', ingredientsError);
          throw ingredientsError;
        }
      }

      if (input.instructions.length > 0) {
        const { error: instructionsError } = await supabase.from('instructions').insert(
          input.instructions.map((inst) => ({
            recipe_id: recipe.id,
            step_number: inst.step_number,
            content: inst.content,
          }))
        );

        if (instructionsError) {
          console.error('Instructions insert error:', instructionsError);
          throw instructionsError;
        }
      }

      // Auto-save the recipe to user's saved recipes if logged in
      if (session?.user?.id) {
        const { error: saveError } = await supabase
          .from('saved_recipes')
          .insert({
            user_id: session.user.id,
            recipe_id: recipe.id,
          });

        if (saveError) {
          // Don't throw on save error - recipe was still created successfully
          console.warn('Auto-save to saved_recipes failed:', saveError);
        } else {
          console.log('Recipe auto-saved to user\'s saved recipes');
        }
      }

      return recipe;
    } catch (error: any) {
      console.error('Create recipe failed:', error);
      set({ error: error.message || 'Failed to create recipe' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateRecipe: async (id: string, input: Partial<CreateRecipeInput>) => {
    try {
      set({ isLoading: true, error: null });

      const { error: recipeError } = await supabase
        .from('recipes')
        .update({
          title: input.title,
          description: input.description,
          image_url: input.image_url,
          prep_time_minutes: input.prep_time_minutes,
          cook_time_minutes: input.cook_time_minutes,
          servings: input.servings,
          cuisine: input.cuisine,
          difficulty: input.difficulty,
          is_public: input.is_public,
        })
        .eq('id', id);

      if (recipeError) throw recipeError;

      if (input.ingredients) {
        await supabase.from('ingredients').delete().eq('recipe_id', id);

        if (input.ingredients.length > 0) {
          const { error: ingredientsError } = await supabase.from('ingredients').insert(
            input.ingredients.map((ing) => ({
              recipe_id: id,
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
      }

      if (input.instructions) {
        await supabase.from('instructions').delete().eq('recipe_id', id);

        if (input.instructions.length > 0) {
          const { error: instructionsError } = await supabase.from('instructions').insert(
            input.instructions.map((inst) => ({
              recipe_id: id,
              step_number: inst.step_number,
              content: inst.content,
            }))
          );

          if (instructionsError) throw instructionsError;
        }
      }

      await get().fetchRecipeById(id);
    } catch (error: any) {
      set({ error: error.message || 'Failed to update recipe' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteRecipe: async (id: string) => {
    try {
      set({ isLoading: true, error: null });

      const { error } = await supabase.from('recipes').delete().eq('id', id);

      if (error) throw error;

      set((state) => ({
        recipes: state.recipes.filter((r) => r.id !== id),
        currentRecipe: state.currentRecipe?.id === id ? null : state.currentRecipe,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete recipe' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  saveRecipe: async (recipeId: string) => {
    try {
      set({ isLoading: true, error: null });

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Must be logged in to save recipes');

      const { data, error } = await supabase
        .from('saved_recipes')
        .insert({
          user_id: session.user.id,
          recipe_id: recipeId,
        })
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        savedRecipes: [...state.savedRecipes, data],
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to save recipe' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  unsaveRecipe: async (recipeId: string) => {
    try {
      set({ isLoading: true, error: null });

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Must be logged in to unsave recipes');

      const { error } = await supabase
        .from('saved_recipes')
        .delete()
        .eq('user_id', session.user.id)
        .eq('recipe_id', recipeId);

      if (error) throw error;

      set((state) => ({
        savedRecipes: state.savedRecipes.filter((sr) => sr.recipe_id !== recipeId),
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to unsave recipe' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSavedRecipes: async () => {
    try {
      set({ isLoading: true, error: null });

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        set({ savedRecipes: [] });
        return;
      }

      const { data, error } = await supabase
        .from('saved_recipes')
        .select(`
          *,
          recipe:recipes(*)
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ savedRecipes: data || [] });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch saved recipes' });
    } finally {
      set({ isLoading: false });
    }
  },

  checkIfSaved: async (recipeId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return false;

    const { data } = await supabase
      .from('saved_recipes')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('recipe_id', recipeId)
      .maybeSingle();

    return !!data;
  },

  clearCurrentRecipe: () => set({ currentRecipe: null }),

  clearError: () => set({ error: null }),
}));
