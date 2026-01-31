export type RecipeSource = 'user_uploaded' | 'ai_generated' | 'wildcard_modified' | 'template' | 'imported';

export interface Ingredient {
  id: string;
  recipe_id: string;
  name: string;
  quantity: string;
  unit: string;
  is_wildcard: boolean;
  wildcard_reason?: string;
  order_index: number;
  created_at: string;
}

export interface Instruction {
  id: string;
  recipe_id: string;
  step_number: number;
  content: string;
  created_at: string;
}

export interface Recipe {
  id: string;
  user_id: string | null;
  title: string;
  description: string;
  image_url: string | null;
  source: RecipeSource;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  servings: number | null;
  cuisine: string | null;
  difficulty: 'easy' | 'medium' | 'hard' | null;
  is_public: boolean;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
  ingredients?: Ingredient[];
  instructions?: Instruction[];
}

export interface RecipeWithDetails extends Recipe {
  ingredients: Ingredient[];
  instructions: Instruction[];
  is_saved?: boolean;
  author?: {
    id: string;
    username: string | null;
    avatar_url: string | null;
  };
}

export interface SavedRecipe {
  id: string;
  user_id: string;
  recipe_id: string;
  created_at: string;
  recipe?: Recipe;
}

export interface WildcardIngredient {
  id: string;
  name: string;
  category: string;
  flavor_profile: string[];
  pairs_with: string[];
  description: string;
  usage_tips: string;
  intensity: 'subtle' | 'medium' | 'bold';
}

export interface CreateRecipeInput {
  title: string;
  description: string;
  image_url?: string;
  source: RecipeSource;
  source_url?: string;
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  servings?: number;
  cuisine?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  is_public?: boolean;
  ingredients: Omit<Ingredient, 'id' | 'recipe_id' | 'created_at'>[];
  instructions: Omit<Instruction, 'id' | 'recipe_id' | 'created_at'>[];
}

export interface GenerateRecipeInput {
  prompt: string;
  cuisine?: string;
  dietary_restrictions?: string[];
  include_wildcard?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface WildcardSuggestion {
  ingredient: WildcardIngredient;
  reason: string;
  how_to_use: string;
  quantity_suggestion: string;
}
